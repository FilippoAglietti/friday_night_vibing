/**
 * src/lib/export/markdown.ts
 * ──────────────────────────────────────────────────────────────
 * Shared markdown → HTML helper for export pipelines.
 * Lifted out of generateScorm.ts (Phase 2 audit recommendation,
 * 2026-04-26) and extended to cover what the online course view
 * renders: ## headings, **bold**, *italic*, `inline code`,
 * > blockquote, * / 1. lists, [links](url), paragraphs,
 * GFM tables (| col | col |), and KaTeX math
 * ($...$ inline, $$...$$ display).
 *
 * Used by:
 *   - PDF v2 LessonPage.tsx (renders via dangerouslySetInnerHTML
 *     since the SSR pipeline produces print-targeted HTML)
 *   - Notion HTML export (replaces the literal escape that was
 *     leaking **bold** as plain text)
 *   - Markdown export (no HTML conversion; uses curriculumToMarkdown
 *     which appends raw lesson.content directly — this helper is
 *     not used there)
 *   - SCORM (refactored to call this instead of its inline copy)
 *
 * Safety: input is always escaped before any markdown substitution,
 * so a malicious lesson.content cannot inject <script> tags. Math is
 * extracted to placeholders BEFORE escape and rendered by KaTeX
 * (whose output is its own controlled markup), so user-supplied
 * LaTeX cannot smuggle HTML through the math channel either.
 * Generated output is safe to inject via dangerouslySetInnerHTML.
 * ──────────────────────────────────────────────────────────────
 */

import katex from "katex";

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(str: string): string {
  return String(str).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/**
 * Strip markdown to flat prose suitable for read-aloud / TTS contexts
 * (NotebookLM Audio Overview, slide speaker notes). Different from
 * `markdownToHtml`: instead of producing structured HTML, it inlines
 * all structural markers so the result reads as continuous prose.
 *
 *   - `## Heading` → `Heading.` (added period if absent)
 *   - `* item` / `1. item` → unwrapped phrase, joined into a sentence
 *   - `**bold**` / `*italic*` / `` `code` `` → text only, markers dropped
 *   - `> quote` → unwrapped (the content stays as a regular paragraph)
 *   - `[label](url)` → just `label`
 *   - paragraph breaks (double newline) preserved
 */
export function markdownToProse(markdown: string): string {
  if (!markdown) return "";

  const paragraphs = markdown.split(/\n{2,}/);
  const out: string[] = [];

  for (const block of paragraphs) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Pure list block — flatten into a sentence
    const allBullet = lines.every((l) => /^([*\-]|\d+\.)\s+/.test(l));
    if (allBullet && lines.length > 0) {
      const phrases = lines
        .map((l) => l.replace(/^([*\-]|\d+\.)\s+/, "").trim())
        .map(stripInline)
        .filter(Boolean);
      if (phrases.length > 0) {
        out.push(joinPhrasesAsSentence(phrases));
      }
      continue;
    }

    // Mixed / prose block — strip markers per line, then join with spaces
    const flat = lines
      .map((l) => {
        // Heading → ensure trailing period
        const heading = l.match(/^#{1,6}\s+(.*)$/);
        if (heading) {
          const text = stripInline(heading[1]);
          return /[.!?]$/.test(text) ? text : `${text}.`;
        }
        // Blockquote → drop the marker
        const bq = l.match(/^>\s*(.*)$/);
        if (bq) return stripInline(bq[1]);
        // Bullet inline (rare in prose blocks) — strip marker
        const bullet = l.match(/^([*\-]|\d+\.)\s+(.*)$/);
        if (bullet) return stripInline(bullet[2]);
        return stripInline(l);
      })
      .filter(Boolean)
      .join(" ");

    if (flat) out.push(flat);
  }

  return out.join("\n\n").trim();
}

function stripInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/(?<![A-Za-z0-9])_([^_\n]+)_(?![A-Za-z0-9])/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function joinPhrasesAsSentence(phrases: string[]): string {
  // "A; B; and C." — readable both as audio and as a slide note
  if (phrases.length === 1) {
    const p = phrases[0];
    return /[.!?]$/.test(p) ? p : `${p}.`;
  }
  const head = phrases.slice(0, -1).join("; ");
  const tail = phrases[phrases.length - 1];
  const ending = /[.!?]$/.test(tail) ? tail : `${tail}.`;
  return `${head}; and ${ending}`;
}

/**
 * Math placeholder format: MATH(BLOCK|INLINE)<idx>
 *
 *  (start of heading) is a control char that:
 *   - never appears in real lesson content
 *   - is not in HTML_ESCAPE_MAP, so it survives escapeHtml() unchanged
 *   - is not consumed by any markdown regex in this file
 *
 * The pre-pass extractor walks the input character-by-character, leaving
 * code spans (`...`) and fenced blocks (```...```) intact so that
 * something like `` `$x$` `` keeps the dollar signs literal.
 */
const MATH_PLACEHOLDER_PREFIX = "MATH";
const MATH_PLACEHOLDER_SUFFIX = "";
const MATH_PLACEHOLDER_RE = /MATH(BLOCK|INLINE)(\d+)/g;

function extractMath(input: string): {
  stripped: string;
  rendered: string[];
} {
  const rendered: string[] = [];
  let out = "";
  let i = 0;

  const renderAndPlace = (expr: string, displayMode: boolean): string => {
    const html = katex.renderToString(expr, {
      displayMode,
      throwOnError: false,
      // AI-generated lessons frequently include em-dashes and other
      // non-LaTeX Unicode inside math. Ignore these instead of warning
      // (the default 'warn' mode floods Cloud Run logs and provides no
      // user-facing benefit — KaTeX still renders the expression).
      strict: "ignore",
      output: "html",
    });
    rendered.push(html);
    const kind = displayMode ? "BLOCK" : "INLINE";
    return `${MATH_PLACEHOLDER_PREFIX}${kind}${rendered.length - 1}${MATH_PLACEHOLDER_SUFFIX}`;
  };

  while (i < input.length) {
    // Fenced code block: ``` ... ``` — passthrough untouched
    if (input.startsWith("```", i)) {
      const end = input.indexOf("```", i + 3);
      if (end === -1) {
        out += input.slice(i);
        break;
      }
      out += input.slice(i, end + 3);
      i = end + 3;
      continue;
    }
    // Inline code: ` ... ` — passthrough untouched
    if (input[i] === "`") {
      const end = input.indexOf("`", i + 1);
      if (end === -1) {
        out += input[i];
        i++;
        continue;
      }
      out += input.slice(i, end + 1);
      i = end + 1;
      continue;
    }
    // Escaped dollar — keep literal, drop the backslash so it renders as $
    if (input[i] === "\\" && input[i + 1] === "$") {
      out += "$";
      i += 2;
      continue;
    }
    // Block math: $$ ... $$ (may span lines)
    if (input.startsWith("$$", i)) {
      const end = input.indexOf("$$", i + 2);
      if (end !== -1) {
        const expr = input.slice(i + 2, end).trim();
        out += renderAndPlace(expr, true);
        i = end + 2;
        continue;
      }
    }
    // Inline math: $ ... $ on a single line, no internal blank
    if (input[i] === "$") {
      let end = -1;
      for (let j = i + 1; j < input.length; j++) {
        if (input[j] === "\n") break;
        if (input[j] === "$" && input[j - 1] !== "\\") {
          end = j;
          break;
        }
      }
      if (end !== -1 && end > i + 1) {
        const expr = input.slice(i + 1, end);
        out += renderAndPlace(expr, false);
        i = end + 1;
        continue;
      }
    }
    out += input[i];
    i++;
  }

  return { stripped: out, rendered };
}

/**
 * Convert lightweight markdown to HTML.
 *
 * Supports the subset used in lesson.content across the app:
 *   - `# Heading 1`, `## Heading 2`, `### Heading 3`
 *   - `**bold**` and `__bold__`
 *   - `*italic*` and `_italic_`
 *   - `` `inline code` ``
 *   - `> blockquote`
 *   - `* item` / `- item` unordered list
 *   - `1. item` ordered list
 *   - `[label](https://url)` links (open in new tab)
 *   - GFM tables: `| col1 | col2 |\n| --- | --- |\n| a | b |`
 *   - Math (KaTeX): `$inline$` and `$$display$$`
 *   - blank-line paragraph separation
 *
 * Returns sanitized HTML safe for dangerouslySetInnerHTML.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  // Pre-pass: extract math expressions (raw LaTeX has $, <, >, & that
  // would otherwise be escaped or eaten by markdown regexes) and replace
  // them with placeholders that survive escape + markdown processing.
  const { stripped, rendered } = extractMath(markdown);

  // Escape every untrusted character first. All subsequent regex
  // substitutions only re-introduce *intended* HTML.
  const escaped = escapeHtml(stripped);

  const lines = escaped.split("\n");
  const out: string[] = [];

  let inUl = false;
  let inOl = false;
  let inBlockquote = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    out.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeUl = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
  };
  const closeOl = () => {
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };
  const closeBlockquote = () => {
    if (inBlockquote) {
      out.push("</blockquote>");
      inBlockquote = false;
    }
  };
  const closeAllBlocks = () => {
    flushParagraph();
    closeUl();
    closeOl();
    closeBlockquote();
  };

  for (let li = 0; li < lines.length; li++) {
    const rawLine = lines[li];
    const line = rawLine.trimEnd();

    // Blank line — paragraph / list / quote terminator
    if (line.trim() === "") {
      closeAllBlocks();
      continue;
    }

    // Headings
    const h3 = /^### (.*)$/.exec(line);
    if (h3) {
      closeAllBlocks();
      out.push(`<h3>${renderInline(h3[1])}</h3>`);
      continue;
    }
    const h2 = /^## (.*)$/.exec(line);
    if (h2) {
      closeAllBlocks();
      out.push(`<h2>${renderInline(h2[1])}</h2>`);
      continue;
    }
    const h1 = /^# (.*)$/.exec(line);
    if (h1) {
      closeAllBlocks();
      out.push(`<h1>${renderInline(h1[1])}</h1>`);
      continue;
    }

    // GFM table — header row + separator row + zero or more body rows.
    // We only enter this branch when the *next* line is a valid separator,
    // which keeps lonely "| ... |" lines from being mistaken for tables.
    if (
      isTableRow(line) &&
      li + 1 < lines.length &&
      isTableSeparator(lines[li + 1].trimEnd())
    ) {
      closeAllBlocks();
      const header = splitTableRow(line);
      const bodyRows: string[][] = [];
      let scan = li + 2;
      while (scan < lines.length && isTableRow(lines[scan].trimEnd())) {
        bodyRows.push(splitTableRow(lines[scan].trimEnd()));
        scan++;
      }
      out.push(buildTableHtml(header, bodyRows));
      li = scan - 1; // for-loop increment lands on `scan`
      continue;
    }

    // Blockquote (note: > was escaped to &gt; above)
    const bq = /^&gt; ?(.*)$/.exec(line);
    if (bq) {
      flushParagraph();
      closeUl();
      closeOl();
      if (!inBlockquote) {
        out.push("<blockquote>");
        inBlockquote = true;
      }
      out.push(`<p>${renderInline(bq[1])}</p>`);
      continue;
    } else if (inBlockquote) {
      closeBlockquote();
    }

    // Unordered list (* or -)
    const ul = /^[*-] (.*)$/.exec(line);
    if (ul) {
      flushParagraph();
      closeOl();
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${renderInline(ul[1])}</li>`);
      continue;
    } else if (inUl) {
      closeUl();
    }

    // Ordered list
    const ol = /^\d+\. (.*)$/.exec(line);
    if (ol) {
      flushParagraph();
      closeUl();
      if (!inOl) {
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${renderInline(ol[1])}</li>`);
      continue;
    } else if (inOl) {
      closeOl();
    }

    // Default: accumulate into a paragraph
    paragraph.push(line);
  }

  closeAllBlocks();

  // Post-pass: substitute math placeholders with the rendered KaTeX HTML.
  // The placeholders survived escape unchanged and may now sit inside
  // <p>, <li>, <td>, <blockquote>, etc. — KaTeX HTML is always valid in
  // those contexts (inline math is a <span>, display math is a <span>
  // that renders as a centered block via the consumer's CSS).
  const html = out.join("\n");
  return html.replace(MATH_PLACEHOLDER_RE, (_, _kind, idx) => {
    return rendered[Number(idx)] ?? "";
  });
}

/**
 * Inline pass: applied per line / paragraph / list-item / heading / table cell.
 * Order matters — code spans are processed first so their contents
 * are protected from bold/italic/link substitution.
 */
function renderInline(text: string): string {
  // Inline code first — protect contents from further substitution.
  // Replace with a placeholder, then restore at the end.
  const codeStash: string[] = [];
  let stage = text.replace(/`([^`]+)`/g, (_, c) => {
    codeStash.push(c);
    return ` CODE${codeStash.length - 1} `;
  });

  // Bold (must run before italic so ** isn't consumed as nested *)
  stage = stage.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  stage = stage.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // Italic
  stage = stage.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  stage = stage.replace(/(?<![A-Za-z0-9])_([^_\n]+)_(?![A-Za-z0-9])/g, "<em>$1</em>");

  // Links — text already escaped, URL must be re-extracted carefully.
  // The pattern matches escaped versions: [text](url) where & became &amp;
  // but [, ], (, ) survived the escape map.
  stage = stage.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  );

  // Restore code spans
  stage = stage.replace(/ CODE(\d+) /g, (_, i) => {
    return `<code>${codeStash[Number(i)]}</code>`;
  });

  return stage;
}

// ─── GFM table helpers ───────────────────────────────────────

function isTableRow(line: string): boolean {
  // Must start and end with a pipe and have at least one cell separator inside.
  // We check the post-escape representation, where `|` is unchanged.
  return /^\|.+\|$/.test(line) && line.indexOf("|", 1) < line.length - 1;
}

function isTableSeparator(line: string): boolean {
  if (!isTableRow(line)) return false;
  const cells = splitTableRow(line);
  // Each cell must be a run of dashes, optionally bracketed by colons for
  // alignment. We accept the alignment markers but currently ignore them
  // (default left-align in CSS).
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c.trim()));
}

function splitTableRow(line: string): string[] {
  // GFM allows `\|` for a literal pipe inside a cell. Stash escaped pipes
  // before splitting, restore after.
  const PIPE = "";
  return line
    .slice(1, -1)
    .replace(/\\\|/g, PIPE)
    .split("|")
    .map((c) => c.trim().replace(new RegExp(PIPE, "g"), "|"));
}

function buildTableHtml(header: string[], rows: string[][]): string {
  const headerHtml = header
    .map((c) => `<th>${renderInline(c)}</th>`)
    .join("");
  if (rows.length === 0) {
    return `<table><thead><tr>${headerHtml}</tr></thead></table>`;
  }
  const bodyHtml = rows
    .map((row) => {
      const cells = row
        .map((c) => `<td>${renderInline(c)}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}
