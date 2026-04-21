import type { Curriculum, Lesson, Module } from "@/types/curriculum";

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
 *   • Injects conversational prompts the hosts can latch on to ("why this
 *     matters", "what most people get wrong", "a simple example").
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

function lessonNarrative(lesson: Lesson, lessonNum: string): string {
  const parts: string[] = [];
  parts.push(`**${lessonNum} — ${stripPrefix(lesson.title)}.**`);
  if (lesson.description) parts.push(lesson.description);
  if (lesson.objectives && lesson.objectives.length > 0) {
    parts.push(`By the end of this lesson a learner should be able to ${lesson.objectives.join("; ").toLowerCase()}.`);
  }
  if (lesson.keyPoints && lesson.keyPoints.length > 0) {
    parts.push(`The ideas worth lingering on are: ${lesson.keyPoints.join(" ")}`);
  }
  if (lesson.content) {
    // Content is often long-form markdown; keep but trim excessive blank lines.
    parts.push(lesson.content.replace(/\n{3,}/g, "\n\n").trim());
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

  // Host cues — surfaces the conversation the two narrators should have.
  lines.push(`**Why this matters.** ${title} is worth an episode because it connects ideas most learners meet in isolation. Link back to earlier modules where it makes sense, and flag the common traps early.`);
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

  // Conversation prompts — hosts love these.
  lines.push(`**Prompts for the hosts.** What most people get wrong about ${title.toLowerCase()}; a simple example a beginner could try today; a tension worth debating; and one surprising connection to something outside the topic.`);
  lines.push("");

  return lines;
}

export function generateNotebookLMMarkdown(c: Curriculum): string {
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
    "Generated by Syllabi (https://syllabi.online). Drop this briefing into Google NotebookLM and generate an Audio Overview. The hosts will use each episode section as a conversation scaffold rather than a script.",
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
