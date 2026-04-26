import type { Curriculum, Lesson, Module } from "@/types/curriculum";

// ── Slide style ──────────────────────────────────────────────

export type SlideStyle = "academic" | "conversational" | "executive";

export const SLIDE_STYLES: Array<{
  id: SlideStyle;
  label: string;
  description: string;
}> = [
  {
    id: "academic",
    label: "Academic",
    description: "Formal tone, dense bullets, thesis framing — for universities & conferences.",
  },
  {
    id: "conversational",
    label: "Conversational",
    description: "Question-led openers, light bullets, storytelling — for classrooms & workshops.",
  },
  {
    id: "executive",
    label: "Executive",
    description: "Headline-first, outcome-driven, minimal bullets — for boardrooms & stakeholders.",
  },
];

// ── Constants ────────────────────────────────────────────────

const MOD_PREFIX_RE = /^(?:module|chapter|session|unit|lesson|scene)\s*\d+\s*[:.\-–—]\s*/i;
const SLIDE_SEP = "\n\n---\n\n";
const MAX_SPEAKER_NOTES_CHARS = 900;

interface StyleConfig {
  themeLine: string;
  objectivesHeading: string;
  closingHeading: string;
  closingTagline: (title: string) => string;
  moduleHeading: (num: number, title: string) => string;
  lessonHeading: (num: string, title: string) => string;
  lessonBulletHeader: string | null;
  objectivesBulletPrefix: string;
  maxBulletsPerSlide: number;
  bulletsFromLesson: (lesson: Lesson) => string[];
}

/**
 * Maximum length for a slide bullet. Long lines wrap badly in Marp/Slidev
 * and overwhelm the audience — keep each bullet to roughly one sentence
 * worth of phone-screen reading.
 */
const SLIDE_BULLET_MAX_CHARS = 80;

/**
 * Pull bullet candidates straight from lesson.content when the curriculum
 * doesn't provide rich keyPoints. Looks for (in order):
 *   1. H2/H3 headings — these are explicit topical pivots
 *   2. First sentence of each paragraph — usually the topic sentence
 * Returns up to `max` items, each already stripped of markdown markers.
 */
function extractContentBullets(content: string | undefined, max: number): string[] {
  if (!content) return [];

  const headings: string[] = [];
  const headingRe = /^#{2,3}\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(content)) && headings.length < max) {
    headings.push(stripMarkdown(m[1]));
  }
  if (headings.length >= max) return headings;

  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("#") && !p.startsWith(">") && !/^([*\-]|\d+\.)\s+/.test(p));

  const sentenceLeads = paragraphs
    .map((p) => p.split(/(?<=[.!?])\s+/)[0]?.trim() ?? "")
    .map(stripMarkdown)
    .filter((s) => {
      const wordCount = s.split(/\s+/).length;
      return wordCount >= 4 && wordCount <= 18;
    });

  return [...headings, ...sentenceLeads].slice(0, max);
}

/**
 * Extract blockquote lines from lesson.content; they're often the
 * memorable example or quote — exactly the material slide presenters
 * (and NotebookLM hosts reading speaker notes) want to surface.
 */
function extractBlockquotes(content: string | undefined): string[] {
  if (!content) return [];
  const out: string[] = [];
  const re = /^>\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    const line = stripMarkdown(m[1]).trim();
    if (line) out.push(line);
  }
  return out;
}

/**
 * Take the first ~2 paragraphs of lesson.content as speaker-note material,
 * rather than dumping the entire body and truncating mid-sentence. Hosts /
 * presenters get the lead-in and the first elaboration; the rest of the
 * lesson is for self-study, not for read-aloud.
 */
function leadParagraphs(content: string | undefined, max: number): string {
  if (!content) return "";
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, max)
    .join("\n\n");
}

function defaultBullets(lesson: Lesson): string[] {
  if (lesson.keyPoints?.length) return lesson.keyPoints;
  if (lesson.objectives?.length) return lesson.objectives;
  // No structured bullets? Pull from the prose body before falling back to
  // a one-line description.
  const fromContent = extractContentBullets(lesson.content, 5);
  if (fromContent.length > 0) return fromContent;
  if (lesson.description) return [lesson.description];
  return [];
}

function tightenBullet(text: string): string {
  const stripped = stripMarkdown(text).replace(/\s+/g, " ").trim();
  return shorten(stripped, SLIDE_BULLET_MAX_CHARS);
}

function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.7 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

function executiveBullet(text: string): string {
  // Strip leading "You will…" / "The learner…" / "To…" patterns so each
  // bullet reads as a punchy outcome line on its own.
  return text
    .replace(/^\s*(you will|the learner will|students will|this lesson covers|we will|to)\s+/i, "")
    .replace(/^(be able to|understand|learn|discover|explore)\s+/i, "")
    .trim();
}

const STYLE_CONFIG: Record<SlideStyle, StyleConfig> = {
  academic: {
    themeLine: "theme: gaia",
    objectivesHeading: "Learning Outcomes",
    closingHeading: "Questions & Discussion",
    closingTagline: (title) => `_Thank you — open for questions on ${title}._`,
    moduleHeading: (num, title) => `# Unit ${num}. ${title}`,
    lessonHeading: (num, title) => `# §${num} — ${title}`,
    lessonBulletHeader: "**Key points:**",
    objectivesBulletPrefix: "1.",
    maxBulletsPerSlide: 6,
    bulletsFromLesson: defaultBullets,
  },
  conversational: {
    themeLine: "theme: default",
    objectivesHeading: "What you'll get out of this",
    closingHeading: "Thanks for being here",
    closingTagline: (title) => `_That's ${title} — let's talk._`,
    moduleHeading: (num, title) => `# Module ${num}: ${title}`,
    lessonHeading: (num, title) => `# ${num} · ${title}`,
    lessonBulletHeader: null,
    objectivesBulletPrefix: "-",
    maxBulletsPerSlide: 5,
    bulletsFromLesson: defaultBullets,
  },
  executive: {
    themeLine: "theme: default",
    objectivesHeading: "Outcomes",
    closingHeading: "Decisions & next steps",
    closingTagline: (title) => `_${title} — ready to deploy._`,
    moduleHeading: (num, title) => `# ${num}. ${title}`,
    lessonHeading: (num, title) => `# ${title}`,
    lessonBulletHeader: null,
    objectivesBulletPrefix: "▸",
    maxBulletsPerSlide: 3,
    bulletsFromLesson: (lesson) => defaultBullets(lesson).map(executiveBullet),
  },
};

// ── Helpers ──────────────────────────────────────────────────

function escapeHtmlComment(text: string): string {
  return text.replace(/-->/g, "--&gt;");
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function speakerNotes(parts: (string | null | undefined)[]): string {
  const joined = parts
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" — ");
  if (!joined) return "";
  const clean = stripMarkdown(joined);
  return `<!-- Speaker notes: ${escapeHtmlComment(shorten(clean, MAX_SPEAKER_NOTES_CHARS))} -->`;
}

function cleanTitle(raw: string): string {
  return raw.replace(MOD_PREFIX_RE, "").trim();
}

// ── Slide builders ───────────────────────────────────────────

function coverSlide(c: Curriculum, style: SlideStyle): string {
  const cfg = STYLE_CONFIG[style];
  const lines: string[] = [];
  lines.push(`# ${c.title}`);
  if (c.subtitle) {
    lines.push("");
    lines.push(style === "executive" ? `**${c.subtitle}**` : `## ${c.subtitle}`);
  }
  const stats = [
    `${c.modules?.length ?? 0} modules`,
    c.pacing?.totalHours ? `${c.pacing.totalHours}h total` : null,
    c.difficulty ? c.difficulty : null,
  ]
    .filter(Boolean)
    .join(" · ");
  if (stats) {
    lines.push("");
    lines.push(`_${stats}_`);
  }
  const hostCue =
    style === "academic"
      ? "Opening remarks: situate the work, frame the research question, establish stakes."
      : style === "executive"
      ? "Opening: lead with the bottom line. What changes for the audience when they leave this room?"
      : "Opening: start with a question the room already half-has — then earn the answer over the next few slides.";
  const notes = speakerNotes([c.description, c.targetAudience, hostCue]);
  if (notes) {
    lines.push("");
    lines.push(notes);
  }
  void cfg; // cfg reserved for future cover variants
  return lines.join("\n");
}

function objectivesSlide(c: Curriculum, style: SlideStyle): string | null {
  if (!c.objectives || c.objectives.length === 0) return null;
  const cfg = STYLE_CONFIG[style];
  const lines: string[] = [];
  lines.push(`# ${cfg.objectivesHeading}`);
  lines.push("");
  const visible = c.objectives.slice(0, cfg.maxBulletsPerSlide);
  visible.forEach((o, idx) => {
    const prefix =
      cfg.objectivesBulletPrefix === "1."
        ? `${idx + 1}.`
        : cfg.objectivesBulletPrefix;
    const text = style === "executive" ? executiveBullet(o) : o;
    lines.push(`${prefix} ${tightenBullet(text)}`);
  });
  const overflow = c.objectives.length - cfg.maxBulletsPerSlide;
  if (overflow > 0) {
    lines.push("");
    lines.push(`_+${overflow} more_`);
  }
  const notes = speakerNotes([c.objectives.join(" • ")]);
  if (notes) {
    lines.push("");
    lines.push(notes);
  }
  return lines.join("\n");
}

function moduleIntroSlide(mod: Module, index: number, style: SlideStyle): string {
  const cfg = STYLE_CONFIG[style];
  const num = (mod.order ?? index) + 1;
  const title = cleanTitle(mod.title || `Module ${num}`);
  const lines: string[] = [];
  lines.push(cfg.moduleHeading(num, title));
  if (mod.description) {
    lines.push("");
    lines.push(mod.description);
  }
  if (mod.objectives && mod.objectives.length > 0) {
    lines.push("");
    mod.objectives.slice(0, cfg.maxBulletsPerSlide).forEach((o) => {
      const text = style === "executive" ? executiveBullet(o) : o;
      lines.push(`- ${tightenBullet(text)}`);
    });
  }
  const hostCue =
    style === "academic"
      ? "Situate this unit within the broader literature. Name the foundational scholars or frameworks."
      : style === "executive"
      ? "Lead with the decision this module unblocks."
      : "Open with a story or a question the room has already thought about.";
  const notes = speakerNotes([
    mod.description,
    mod.objectives?.length ? `Objectives: ${mod.objectives.join("; ")}` : null,
    hostCue,
  ]);
  if (notes) {
    lines.push("");
    lines.push(notes);
  }
  return lines.join("\n");
}

function lessonSlide(lesson: Lesson, modIndex: number, lessonIndex: number, style: SlideStyle): string {
  const cfg = STYLE_CONFIG[style];
  const num = `${modIndex + 1}.${lessonIndex + 1}`;
  const title = cleanTitle(lesson.title || `Lesson ${num}`);
  const lines: string[] = [];
  lines.push(cfg.lessonHeading(num, title));

  const allBullets = cfg.bulletsFromLesson(lesson).map(tightenBullet).filter(Boolean);
  const bullets = allBullets.slice(0, cfg.maxBulletsPerSlide);
  if (bullets.length > 0) {
    lines.push("");
    if (cfg.lessonBulletHeader) {
      lines.push(cfg.lessonBulletHeader);
    }
    bullets.forEach((b) => lines.push(`- ${b}`));
  }

  if (lesson.durationMinutes && style !== "executive") {
    lines.push("");
    lines.push(`_${lesson.durationMinutes} min_`);
  }

  const hostCue =
    style === "academic"
      ? "Cite primary sources. Connect to prior units. Surface a counter-example before closing."
      : style === "executive"
      ? "Name the change this slide unlocks for the audience. Skip the background unless asked."
      : "Ground the idea in a concrete example; ask one question before moving on.";

  // Speaker notes: first ~2 paragraphs of body as the read-aloud lead, then
  // any blockquote (often a memorable example/quote), then the overflow
  // bullets, then the host cue. Earlier we shoved the whole body in and
  // truncated at 900 chars mid-word.
  const lead = leadParagraphs(lesson.content, 2) || lesson.description || null;
  const quotes = extractBlockquotes(lesson.content);
  const quoteLine = quotes[0] ? `Quote to land: "${quotes[0]}"` : null;
  const overflow =
    allBullets.length > cfg.maxBulletsPerSlide
      ? `Additional points: ${allBullets.slice(cfg.maxBulletsPerSlide).join("; ")}`
      : null;
  const notes = speakerNotes([lead, quoteLine, overflow, hostCue]);
  if (notes) {
    lines.push("");
    lines.push(notes);
  }

  return lines.join("\n");
}

function closingSlide(c: Curriculum, style: SlideStyle, creatorName: string): string {
  const cfg = STYLE_CONFIG[style];
  const lines: string[] = [];
  lines.push(`# ${cfg.closingHeading}`);
  lines.push("");
  lines.push(cfg.closingTagline(c.title));
  lines.push("");
  lines.push(`_By ${creatorName}_`);
  const hostCue =
    style === "academic"
      ? "Invite questions; reference the bibliography in the next slide."
      : style === "executive"
      ? "Ask for the decision. Name owner, deadline, budget."
      : "Thank the room; point them at follow-up resources.";
  const notes = speakerNotes([
    hostCue,
    "Drop this markdown into Google NotebookLM, Marp, or Slidev for a ready deck.",
  ]);
  if (notes) {
    lines.push("");
    lines.push(notes);
  }
  return lines.join("\n");
}

// ── Entry point ──────────────────────────────────────────────

export interface SlidesOptions {
  style?: SlideStyle;
  creatorName?: string | null;
}

export function generateNotebookLMSlidesMarkdown(c: Curriculum, opts: SlidesOptions = {}): string {
  const style: SlideStyle = opts.style ?? "conversational";
  const cfg = STYLE_CONFIG[style];
  const creatorName = opts.creatorName?.trim() || "Author";

  const frontmatter = [
    "---",
    "marp: true",
    cfg.themeLine,
    "paginate: true",
    `title: ${JSON.stringify(c.title)}`,
    `style: ${JSON.stringify(style)}`,
    "---",
  ].join("\n");

  const slides: string[] = [];
  slides.push(coverSlide(c, style));

  const objSlide = objectivesSlide(c, style);
  if (objSlide) slides.push(objSlide);

  c.modules?.forEach((mod, mi) => {
    slides.push(moduleIntroSlide(mod, mi, style));
    mod.lessons?.forEach((lesson, li) => {
      slides.push(lessonSlide(lesson, mi, li, style));
    });
  });

  slides.push(closingSlide(c, style, creatorName));

  return `${frontmatter}\n\n${slides.join(SLIDE_SEP)}\n`;
}

export function notebookLMSlidesFilename(c: Curriculum, style?: SlideStyle): string {
  const slug =
    c.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "course";
  const date = new Date().toISOString().slice(0, 10);
  const styleSuffix = style ? `-${style}` : "";
  return `${slug}-slides${styleSuffix}-${date}.md`;
}
