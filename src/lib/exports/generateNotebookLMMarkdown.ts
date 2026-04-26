import type { Curriculum, Lesson, Module } from "@/types/curriculum";
import { markdownToProse } from "@/lib/export/markdown";

/**
 * Generates a "Deep Dive" briefing document optimised for Google NotebookLM's
 * Audio Overview (the conversational two-host podcast).
 *
 * NotebookLM's hosts produce a better, more natural-sounding podcast when the
 * source document reads like a narrative briefing rather than a structured
 * outline. Bulleted syllabi tend to produce stilted "and then… and then…"
 * narration. So this export:
 *
 *   • Opens with an episode brief (title, angle, runtime, host notes)
 *   • Reframes every module as an episode arc: hook → core ideas → tensions →
 *     takeaways — written in prose, not bullets.
 *   • Cycles host prompts by module index so an 8-module course doesn't get
 *     "what most people get wrong about X" eight times in a row.
 *   • Flattens lesson.content markdown to prose before inlining it; raw
 *     headings/bullets in the briefing pull hosts back into list-reading.
 *   • Keeps resources at the end as a reading list, not inline noise.
 */

const MOD_PREFIX_RE = /^(?:module|chapter|session|unit|lesson|scene)\s*\d+\s*[:.\-–—]\s*/i;

function stripPrefix(title: string): string {
  return title.replace(MOD_PREFIX_RE, "").trim();
}

function joinSentences(parts: (string | undefined | null)[]): string {
  return parts
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean)
    .map((p) => (p.endsWith(".") || p.endsWith("?") || p.endsWith("!") ? p : `${p}.`))
    .join(" ");
}

/**
 * Cycle through 4 host-cue archetypes by module position so the briefing
 * doesn't repeat the same "what most people get wrong" prompt every module.
 */
const MODULE_PROMPT_CYCLE = [
  (topic: string) =>
    `the foundational misconception people hold about ${topic} before they study it; a one-line metaphor that lands on first hearing; the simplest concrete example a beginner could try today.`,
  (topic: string) =>
    `the most common pitfall practitioners hit halfway through ${topic}; a tension worth debating between two reasonable approaches; one moment where a listener should pause and re-read.`,
  (topic: string) =>
    `a surprising connection between ${topic} and something outside the topic; a story or named example that made the idea click; what changes for the listener if they internalize this.`,
  (topic: string) =>
    `an edge case that breaks the simple version of ${topic}; the question the hosts should leave hanging at the end; a recommendation for what to read or build next.`,
];

function lessonNarrative(lesson: Lesson, lessonNum: string): string {
  const parts: string[] = [];
  parts.push(`**${lessonNum} — ${stripPrefix(lesson.title)}.**`);
  if (lesson.description) parts.push(lesson.description);
  if (lesson.objectives && lesson.objectives.length > 0) {
    // Drop the "By the end…" boilerplate; treat each objective as a plain
    // declarative the hosts can paraphrase without sounding like a syllabus.
    const objectiveLine = lesson.objectives
      .map((o) => o.trim())
      .filter(Boolean)
      .map((o) => (o.endsWith(".") || o.endsWith("?") || o.endsWith("!") ? o : `${o}.`))
      .join(" ");
    if (objectiveLine) parts.push(objectiveLine);
  }
  if (lesson.keyPoints && lesson.keyPoints.length > 0) {
    // Each key point must end with sentence punctuation; raw `.join(" ")`
    // produced run-on sentences that hosts read as one breathless line.
    const keyPointsLine = lesson.keyPoints
      .map((k) => k.trim())
      .filter(Boolean)
      .map((k) => (k.endsWith(".") || k.endsWith("?") || k.endsWith("!") ? k : `${k}.`))
      .join(" ");
    if (keyPointsLine) parts.push(keyPointsLine);
  }
  if (lesson.content) {
    // Flatten markdown markers (headings/bullets/emphasis) — keep the prose,
    // drop the structure. Raw markdown in the briefing is the #1 cause of
    // stilted "first… second… third…" narration.
    const prose = markdownToProse(lesson.content);
    if (prose) parts.push(prose);
  }
  return joinSentences(parts);
}

function moduleEpisode(module: Module, modNum: number): string[] {
  const lines: string[] = [];
  const title = stripPrefix(module.title);
  lines.push(`## Episode ${modNum}: ${title}`);
  lines.push("");

  // Hook — one or two sentences that set the stakes for the hosts.
  const hook = joinSentences([
    module.description,
    module.objectives?.[0] ? `By the end, a learner should be able to ${module.objectives[0].toLowerCase()}.` : null,
  ]);
  if (hook) {
    lines.push(`**The hook.** ${hook}`);
    lines.push("");
  }

  // Why this matters — pull a real signal from the module rather than a
  // generic "this connects ideas in isolation" filler. Use the module's
  // first lesson title as the concrete touchpoint.
  const firstLessonTitle = module.lessons?.[0]?.title
    ? stripPrefix(module.lessons[0].title)
    : null;
  const moduleDescriptionFirstSentence = module.description?.split(/(?<=[.!?])\s+/)[0]?.trim() ?? null;
  const whyThisMatters = firstLessonTitle
    ? `${title} earns its own episode because it opens on "${firstLessonTitle}" and builds from there. ${moduleDescriptionFirstSentence ?? ""}`.trim()
    : moduleDescriptionFirstSentence
      ?? `${title} is worth an episode because it threads several lessons into one coherent arc.`;
  lines.push(`**Why this matters.** ${whyThisMatters}`);
  lines.push("");

  // Core ideas — the meat, expressed as a narrative walk-through.
  if (module.lessons && module.lessons.length > 0) {
    lines.push(`**Core ideas to unpack, in order.**`);
    lines.push("");
    module.lessons.forEach((lesson, idx) => {
      const n = `${modNum}.${idx + 1}`;
      lines.push(lessonNarrative(lesson, n));
      lines.push("");
    });
  }

  // Objectives and takeaways — closing beat for the episode.
  if (module.objectives && module.objectives.length > 1) {
    const rest = module.objectives.slice(1).join("; ").toLowerCase();
    lines.push(`**Closing takeaways.** A learner who finishes this episode should also be able to ${rest}.`);
    lines.push("");
  }

  // Conversation prompts — cycled by module index so an 8-module season
  // gets four distinct prompt shapes rather than the same one repeated.
  const promptBuilder = MODULE_PROMPT_CYCLE[(modNum - 1) % MODULE_PROMPT_CYCLE.length];
  lines.push(`**Prompts for the hosts.** Discuss: ${promptBuilder(title.toLowerCase())}`);
  lines.push("");

  return lines;
}

export function generateNotebookLMMarkdown(
  c: Curriculum,
  opts?: { creatorName?: string | null },
): string {
  const creatorName = opts?.creatorName?.trim() || "Author";
  const lines: string[] = [];

  // ── Episode brief ───────────────────────────────────────
  lines.push(`# ${c.title} — Podcast Briefing`);
  lines.push("");
  if (c.subtitle) {
    lines.push(`*${c.subtitle}*`);
    lines.push("");
  }

  lines.push("## Briefing for the hosts");
  lines.push("");
  lines.push(
    joinSentences([
      `This document is the source material for a podcast-style Audio Overview on "${c.title}"`,
      `The target listener is ${c.targetAudience.toLowerCase()} at a ${c.difficulty} level`,
      `The course spans ${c.pacing.totalHours} hours across ${c.modules.length} modules over ${c.pacing.totalWeeks} weeks`,
      `Treat each module as a separate episode arc: open with a hook, walk through the core ideas as a conversation, then land on a clear takeaway`,
      `Favour narrative and analogy over list-reading; surface tensions and tradeoffs where they exist; cite examples the listener can try today`,
    ]),
  );
  lines.push("");

  if (c.description) {
    lines.push(`**Show description.** ${c.description.trim()}`);
    lines.push("");
  }

  if (c.objectives.length > 0) {
    lines.push(
      `**What a listener should walk away with.** After the full season, they should be able to ${c.objectives.join("; ").toLowerCase()}.`,
    );
    lines.push("");
  }

  if (c.prerequisites && c.prerequisites.length > 0) {
    lines.push(
      `**Assumed background.** Listeners come in already comfortable with ${c.prerequisites.join("; ").toLowerCase()}.`,
    );
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  // ── Episodes ────────────────────────────────────────────
  c.modules.forEach((mod) => {
    const modNum = (mod.order ?? 0) + 1;
    lines.push(...moduleEpisode(mod, modNum));
  });

  // ── Further reading (end of episode notes) ──────────────
  const readingList: string[] = [];
  c.modules.forEach((mod) => {
    mod.lessons.forEach((l) => {
      (l.suggestedResources ?? []).forEach((r) => {
        if (r.status === "unreachable" || r.status === "blocked") return;
        readingList.push(`- ${r.title} — ${r.url}`);
      });
      (l.resources ?? []).forEach((r) => {
        if (r.status === "unreachable" || r.status === "blocked") return;
        readingList.push(`- ${r.title} — ${r.url}${r.description ? ` (${r.description})` : ""}`);
      });
    });
  });
  (c.bonusResources ?? []).forEach((r) => {
    if (r.status === "unreachable" || r.status === "blocked") return;
    readingList.push(`- ${r.title} — ${r.url}${r.description ? ` (${r.description})` : ""}`);
  });

  if (readingList.length > 0) {
    lines.push("## Show notes — further reading");
    lines.push("");
    // Dedupe while preserving order.
    const seen = new Set<string>();
    for (const entry of readingList) {
      if (seen.has(entry)) continue;
      seen.add(entry);
      lines.push(entry);
    }
    lines.push("");
  }

  // ── Outro for NotebookLM ────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push(
    `Source briefing by ${creatorName}. Drop this document into Google NotebookLM and generate an Audio Overview. The hosts will use each episode section as a conversation scaffold rather than a script.`,
  );

  return lines.join("\n");
}

export function notebookLMFilename(c: Curriculum, length?: string | null): string {
  const slug = c.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "course";
  const date = new Date().toISOString().slice(0, 10);
  const lengthSuffix = length ? `-${length}` : "";
  return `${slug}${lengthSuffix}-${date}-podcast.md`;
}
