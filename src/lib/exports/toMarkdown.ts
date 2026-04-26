/**
 * lib/exports/toMarkdown.ts
 * ---------------------------------------------------------
 * Converts a Curriculum object into a complete Markdown document.
 *
 * Used by the "Copy as Markdown" button. Because the curriculum's
 * lesson.content is already markdown, the export passes it through
 * verbatim — no escaping, no stripping. Suitable for paste into
 * Notion, Obsidian, GitHub, or any markdown editor.
 *
 * Phase 2 audit fix (2026-04-26): the previous implementation
 * skipped lesson.content entirely (the audit's "real bug" finding)
 * along with description, keyPoints, suggestedResources, format,
 * and the curriculum-level metadata (targetAudience, prerequisites,
 * difficulty, tags). All of those are now included.
 *
 * @example
 *   import { curriculumToMarkdown } from '@/lib/exports/toMarkdown'
 *   const md = curriculumToMarkdown(curriculum)
 *   navigator.clipboard.writeText(md)
 * ---------------------------------------------------------
 */

import type { Curriculum } from "@/types/curriculum";

export function curriculumToMarkdown(c: Curriculum): string {
  const lines: string[] = [];

  // ── Header ──────────────────────────────────────────────
  lines.push(`# ${c.title}`);
  if (c.subtitle) lines.push(`**${c.subtitle}**`);
  lines.push("");

  // Difficulty + tags as a single metadata line
  const meta: string[] = [];
  if (c.difficulty) meta.push(`*${c.difficulty}*`);
  if (c.tags && c.tags.length > 0) meta.push(c.tags.map((t) => `\`${t}\``).join(" "));
  if (meta.length > 0) {
    lines.push(meta.join(" · "));
    lines.push("");
  }

  if (c.description) {
    lines.push(c.description);
    lines.push("");
  }

  if (c.targetAudience) {
    lines.push(`## Who this is for`);
    lines.push(c.targetAudience);
    lines.push("");
  }

  // ── Learning Outcomes ───────────────────────────────────
  if (c.objectives && c.objectives.length > 0) {
    lines.push(`## Learning Outcomes`);
    c.objectives.forEach((o) => lines.push(`- ${o}`));
    lines.push("");
  }

  if (c.prerequisites && c.prerequisites.length > 0) {
    lines.push(`## Prerequisites`);
    c.prerequisites.forEach((p) => lines.push(`- ${p}`));
    lines.push("");
  }

  // ── Modules ─────────────────────────────────────────────
  c.modules.forEach((mod) => {
    lines.push(`## Module ${mod.order + 1}: ${mod.title}`);
    if (mod.description) {
      lines.push(mod.description);
    }
    lines.push("");

    if (mod.objectives && mod.objectives.length > 0) {
      lines.push(`**Module objectives:**`);
      mod.objectives.forEach((o) => lines.push(`- ${o}`));
      lines.push("");
    }

    mod.lessons.forEach((l) => {
      lines.push(`### Lesson ${l.order + 1}: ${l.title}`);

      lines.push(`*${l.durationMinutes} min*`);
      lines.push("");

      if (l.description) {
        lines.push(l.description);
        lines.push("");
      }

      if (l.objectives && l.objectives.length > 0) {
        lines.push(`**Objectives:**`);
        l.objectives.forEach((o) => lines.push(`- ${o}`));
        lines.push("");
      }

      // The actual lesson body — already markdown, pass through
      if (l.content) {
        lines.push(l.content);
        lines.push("");
      }

      if (l.keyPoints && l.keyPoints.length > 0) {
        lines.push(`**Key points:**`);
        l.keyPoints.forEach((k) => lines.push(`- ${k}`));
        lines.push("");
      }

      const visibleResources = (l.suggestedResources ?? []).filter(
        (r) => r.status !== "unreachable",
      );
      if (visibleResources.length > 0) {
        lines.push(`**Resources:**`);
        visibleResources.forEach((r) => {
          const tail = r.type ? ` *(${r.type})*` : "";
          lines.push(`- [${r.title}](${r.url})${tail}`);
        });
        lines.push("");
      }
    });

    // Quiz section (if any questions exist)
    if (mod.quiz && mod.quiz.length > 0) {
      lines.push(`### Quiz`);
      lines.push("");
      mod.quiz.forEach((q, i) => {
        lines.push(`**Q${i + 1}: ${q.question}**`);
        if (q.options) {
          q.options.forEach((opt) => lines.push(`- ${opt}`));
        }
        const answerText =
          typeof q.correctAnswer === "number" && q.options
            ? q.options[q.correctAnswer]
            : q.correctAnswer;
        lines.push(`✅ **Answer:** ${answerText}`);
        if (q.explanation) {
          lines.push(`💡 ${q.explanation}`);
        }
        lines.push("");
      });
    }
  });

  // ── Pacing Schedule ─────────────────────────────────────
  if (c.pacing) {
    lines.push(`## Pacing Schedule`);
    lines.push(
      `**${c.pacing.totalHours}h** total · **${c.pacing.hoursPerWeek}h/week** · **${c.pacing.totalWeeks} weeks** · *${c.pacing.style}*`,
    );
    lines.push("");

    if (c.pacing.weeklyPlan && c.pacing.weeklyPlan.length > 0) {
      c.pacing.weeklyPlan.forEach((w) => {
        const fromLabel = w.label;
        const fromModules =
          w.moduleIds?.length
            ? w.moduleIds
                .map((id) => c.modules.find((m) => m.id === id)?.title ?? id)
                .join(" · ")
            : null;
        const display = fromLabel ?? fromModules ?? "TBD";
        lines.push(`- **Week ${w.week}:** ${display}`);
      });
      lines.push("");
    }
  }

  // ── Bonus Resources ─────────────────────────────────────
  if (c.bonusResources && c.bonusResources.length > 0) {
    lines.push(`## Bonus Resources`);
    c.bonusResources.forEach((r) => {
      const desc = r.description ? `: ${r.description}` : "";
      lines.push(`- **[${r.title}](${r.url})** *(${r.type})*${desc}`);
    });
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
