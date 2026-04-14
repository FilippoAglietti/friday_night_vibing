/**
 * lib/exports/generateNotionHtml.ts
 * ---------------------------------------------------------
 * Generates clean semantic HTML that Notion's paste handler
 * converts into native blocks (headings, tables, toggles,
 * checklists, callouts, etc.).
 *
 * Usage: copy the HTML to clipboard via navigator.clipboard.write()
 * with ClipboardItem({ "text/html": blob }). When pasted into
 * Notion, it creates a beautifully formatted course page.
 * ---------------------------------------------------------
 */

import type { Curriculum, TeachingStyle } from "@/types/curriculum";

type NotionHtmlCfg = {
  subtitleIcon: string;
  moduleWord: string;
  moduleEmoji: string;
  lessonEmoji: string;
  quizEmoji: string;
  trackerHeader: string;
  trackerIcon: string;
};

const NOTION_HTML_STYLE: Record<TeachingStyle, NotionHtmlCfg> = {
  conversational: { subtitleIcon: "✨", moduleWord: "Module", moduleEmoji: "📕", lessonEmoji: "📖", quizEmoji: "🧪", trackerHeader: "Progress Tracker", trackerIcon: "✅" },
  academic: { subtitleIcon: "🎓", moduleWord: "Chapter", moduleEmoji: "📜", lessonEmoji: "📖", quizEmoji: "📝", trackerHeader: "Study Log", trackerIcon: "📑" },
  "hands-on": { subtitleIcon: "🛠️", moduleWord: "Session", moduleEmoji: "🔨", lessonEmoji: "⚙️", quizEmoji: "🎯", trackerHeader: "Build Log", trackerIcon: "📋" },
  storytelling: { subtitleIcon: "📖", moduleWord: "Chapter", moduleEmoji: "✨", lessonEmoji: "📜", quizEmoji: "💭", trackerHeader: "Reader's Journey", trackerIcon: "📖" },
};

const MOD_PREFIX_RE = /^(?:module|chapter|session|unit|lesson|scene)\s*\d+\s*[:.\-–—]\s*/i;

export function generateNotionHtml(
  c: Curriculum,
  opts?: { teachingStyle?: TeachingStyle | null }
): string {
  const cfg = NOTION_HTML_STYLE[opts?.teachingStyle ?? "conversational"] ?? NOTION_HTML_STYLE.conversational;
  const totalLessons = c.modules.reduce((a, m) => a + (m.lessons?.length || 0), 0);
  const totalQuizzes = c.modules.reduce(
    (a, m) => a + (m.quiz?.length || 0) + m.lessons.reduce((b, l) => b + (l.quiz?.length || 0), 0),
    0,
  );
  const totalMinutes = c.modules.reduce(
    (a, m) => a + m.lessons.reduce((b, l) => b + (l.durationMinutes || 0), 0),
    0,
  );
  const totalHours = Math.round(totalMinutes / 60);
  const diffEmoji: Record<string, string> = {
    beginner: "🟢",
    intermediate: "🟡",
    advanced: "🔴",
  };

  const parts: string[] = [];

  // ── Header ──
  parts.push(`<h1>${esc(c.title)}</h1>`);
  parts.push(`<blockquote>${cfg.subtitleIcon} ${esc(c.subtitle)}</blockquote>`);
  parts.push(`<p>${esc(c.description)}</p>`);
  parts.push(`<hr>`);

  // ── Quick Stats ──
  parts.push(`<h2>📊 Quick Stats</h2>`);
  parts.push(`<table><thead><tr>
    <th>${cfg.moduleWord}s</th><th>Lessons</th><th>Quizzes</th><th>Duration</th><th>Level</th>
  </tr></thead><tbody><tr>
    <td>${c.modules.length}</td>
    <td>${totalLessons}</td>
    <td>${totalQuizzes}</td>
    <td>~${totalHours}h</td>
    <td>${diffEmoji[c.difficulty] || "⚪"} ${cap(c.difficulty)}</td>
  </tr></tbody></table>`);
  parts.push(`<hr>`);

  // ── Learning Objectives ──
  parts.push(`<h2>🎯 Learning Objectives</h2>`);
  parts.push(`<ul>${c.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>`);
  parts.push(`<hr>`);

  // ── Course Roadmap ──
  parts.push(`<h2>🗺️ Course Roadmap</h2>`);
  parts.push(`<table><thead><tr>
    <th>#</th><th>${cfg.moduleWord}</th><th>Lessons</th><th>Duration</th>
  </tr></thead><tbody>`);
  c.modules.forEach((mod, i) => {
    const modMins = mod.lessons.reduce((a, l) => a + (l.durationMinutes || 0), 0);
    parts.push(`<tr>
      <td>${i + 1}</td>
      <td><strong>${esc(mod.title.replace(MOD_PREFIX_RE, ""))}</strong></td>
      <td>${mod.lessons.length}</td>
      <td>${modMins} min</td>
    </tr>`);
  });
  parts.push(`</tbody></table>`);
  parts.push(`<hr>`);

  // ── Modules & Lessons (detailed) ──
  c.modules.forEach((mod, mi) => {
    parts.push(`<h2>${cfg.moduleEmoji} ${cfg.moduleWord} ${mi + 1}: ${esc(mod.title.replace(MOD_PREFIX_RE, ""))}</h2>`);
    parts.push(`<p>${esc(mod.description)}</p>`);

    if (mod.objectives && mod.objectives.length > 0) {
      parts.push(`<h3>🎯 ${cfg.moduleWord} Objectives</h3>`);
      parts.push(`<ul>${mod.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>`);
    }

    mod.lessons.forEach((lesson, li) => {
      parts.push(`<h3>${cfg.lessonEmoji} Lesson ${li + 1}: ${esc(lesson.title)}</h3>`);
      parts.push(`<p><em>⏱ ${lesson.durationMinutes} minutes</em></p>`);

      if (lesson.description) {
        parts.push(`<p>${esc(lesson.description)}</p>`);
      }

      if (lesson.objectives && lesson.objectives.length > 0) {
        parts.push(`<p><strong>Objectives:</strong></p>`);
        parts.push(`<ul>${lesson.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>`);
      }

      if (lesson.content) {
        parts.push(`<p>${esc(lesson.content)}</p>`);
      }

      if (lesson.keyPoints && lesson.keyPoints.length > 0) {
        parts.push(`<p><strong>💡 Key Points:</strong></p>`);
        parts.push(`<ul>${lesson.keyPoints.map((kp) => `<li>${esc(kp)}</li>`).join("")}</ul>`);
      }

      if (lesson.suggestedResources && lesson.suggestedResources.length > 0) {
        parts.push(`<p><strong>📚 Resources:</strong></p>`);
        parts.push(
          `<ul>${lesson.suggestedResources
            .map((r) => `<li><a href="${esc(r.url)}">${esc(r.title)}</a> (${esc(r.type)})</li>`)
            .join("")}</ul>`,
        );
      }

      // Lesson-level quiz
      if (lesson.quiz && lesson.quiz.length > 0) {
        parts.push(`<p><strong>❓ Quiz — ${esc(lesson.title)}</strong></p>`);
        lesson.quiz.forEach((q, qi) => {
          parts.push(`<p><strong>Q${qi + 1}:</strong> ${esc(q.question)}</p>`);
          if (q.options && q.options.length > 0) {
            parts.push(
              `<ul>${q.options
                .map(
                  (opt, oi) =>
                    `<li>${String.fromCharCode(65 + oi)}) ${esc(opt)}${opt === q.correctAnswer ? " ✅" : ""}</li>`,
                )
                .join("")}</ul>`,
            );
          }
          if (q.explanation) {
            parts.push(`<blockquote>💡 ${esc(q.explanation)}</blockquote>`);
          }
        });
      }
    });

    // Module-level quiz
    if (mod.quiz && mod.quiz.length > 0) {
      parts.push(`<h3>${cfg.quizEmoji} ${cfg.moduleWord} ${mi + 1} Quiz</h3>`);
      mod.quiz.forEach((q, qi) => {
        parts.push(`<p><strong>Q${qi + 1}:</strong> ${esc(q.question)}</p>`);
        if (q.options && q.options.length > 0) {
          parts.push(
            `<ul>${q.options
              .map(
                (opt, oi) =>
                  `<li>${String.fromCharCode(65 + oi)}) ${esc(opt)}${opt === q.correctAnswer ? " ✅" : ""}</li>`,
              )
              .join("")}</ul>`,
          );
        }
        if (q.explanation) {
          parts.push(`<blockquote>💡 ${esc(q.explanation)}</blockquote>`);
        }
      });
    }

    parts.push(`<hr>`);
  });

  // ── Pacing Schedule ──
  parts.push(`<h2>📅 Pacing Schedule</h2>`);
  parts.push(`<table><thead><tr>
    <th>Week</th><th>Module</th><th>Focus</th>
  </tr></thead><tbody>`);
  c.modules.forEach((mod, i) => {
    parts.push(`<tr>
      <td>Week ${i + 1}</td>
      <td>${esc(mod.title.replace(MOD_PREFIX_RE, ""))}</td>
      <td>${esc(mod.description.slice(0, 80))}${mod.description.length > 80 ? "…" : ""}</td>
    </tr>`);
  });
  parts.push(`</tbody></table>`);
  parts.push(`<hr>`);

  // ── Progress Tracker ──
  parts.push(`<h2>${cfg.trackerIcon} ${cfg.trackerHeader}</h2>`);
  c.modules.forEach((mod, mi) => {
    parts.push(`<p><strong>${cfg.moduleWord} ${mi + 1}: ${esc(mod.title.replace(MOD_PREFIX_RE, ""))}</strong></p>`);
    // Notion converts <li> with [ ] into to-do blocks
    parts.push(`<ul>`);
    mod.lessons.forEach((l) => {
      parts.push(`<li>☐ ${esc(l.title)}</li>`);
    });
    parts.push(`</ul>`);
  });
  parts.push(`<hr>`);

  // ── Bonus Resources ──
  if (c.bonusResources && c.bonusResources.length > 0) {
    parts.push(`<h2>🎁 Bonus Resources</h2>`);
    parts.push(`<table><thead><tr>
      <th>Resource</th><th>Type</th><th>Link</th>
    </tr></thead><tbody>`);
    c.bonusResources.forEach((r) => {
      parts.push(`<tr>
        <td>${esc(r.title)}</td>
        <td>${esc(r.type)}</td>
        <td><a href="${esc(r.url)}">${esc(r.url)}</a></td>
      </tr>`);
    });
    parts.push(`</tbody></table>`);
    parts.push(`<hr>`);
  }

  // ── Footer ──
  parts.push(`<p><em>Generated with <a href="https://www.syllabi.online">Syllabi</a> — AI-powered course generator</em></p>`);

  return parts.join("\n");
}

/**
 * Copy HTML to clipboard so it pastes into Notion as native blocks.
 * Falls back to plain text clipboard if ClipboardItem is not supported.
 */
export async function copyNotionHtmlToClipboard(
  curriculum: Curriculum,
  opts?: { teachingStyle?: TeachingStyle | null }
): Promise<boolean> {
  const html = generateNotionHtml(curriculum, opts);

  try {
    // Modern clipboard API — writes HTML that Notion converts to native blocks
    const blob = new Blob([html], { type: "text/html" });
    await navigator.clipboard.write([
      new ClipboardItem({ "text/html": blob }),
    ]);
    return true;
  } catch {
    // Fallback: copy as plain text (less ideal but still works)
    try {
      await navigator.clipboard.writeText(html);
      return true;
    } catch {
      return false;
    }
  }
}

// ── Helpers ──

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
