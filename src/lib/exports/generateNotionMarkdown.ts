/**
 * lib/exports/generateNotionMarkdown.ts
 * ---------------------------------------------------------
 * Generates a premium, richly-formatted Notion-optimized Markdown
 * document from a Curriculum object.
 *
 * Includes: stats dashboard, course overview, roadmap table,
 * collapsible objectives, detailed lessons with content,
 * quiz questions with toggleable answers, pacing schedule
 * with progress bars, progress tracker checklist, bonus
 * resources table, notes section, and branded footer.
 *
 * Used by both CurriculumOutput (generate page) and
 * the user dashboard (profile page).
 * ---------------------------------------------------------
 */

import type { Curriculum, TeachingStyle } from "@/types/curriculum";

type NotionStyleCfg = {
  subtitleIcon: string;
  detailedHeader: string;
  detailedEmoji: string;
  moduleEmoji: string;
  moduleWord: string;
  quizEmoji: string;
  checkpointWord: string;
  trackerHeader: string;
  trackerIcon: string;
  objectivesIcon: string;
};

const NOTION_STYLE: Record<TeachingStyle, NotionStyleCfg> = {
  conversational: {
    subtitleIcon: "\u{2728}",
    detailedHeader: "Detailed Curriculum",
    detailedEmoji: "\u{1F4DA}",
    moduleEmoji: "\u{1F4D5}",
    moduleWord: "Module",
    quizEmoji: "\u{1F9EA}",
    checkpointWord: "Knowledge Check",
    trackerHeader: "Progress Tracker",
    trackerIcon: "\u{2705}",
    objectivesIcon: "\u{1F3AF}",
  },
  academic: {
    subtitleIcon: "\u{1F393}",
    detailedHeader: "Chapters",
    detailedEmoji: "\u{1F4D6}",
    moduleEmoji: "\u{1F4DC}",
    moduleWord: "Chapter",
    quizEmoji: "\u{1F4DD}",
    checkpointWord: "Examination",
    trackerHeader: "Study Log",
    trackerIcon: "\u{1F4D1}",
    objectivesIcon: "\u{1F9E0}",
  },
  "hands-on": {
    subtitleIcon: "\u{1F6E0}\u{FE0F}",
    detailedHeader: "Session Pack",
    detailedEmoji: "\u{1F527}",
    moduleEmoji: "\u{1F528}",
    moduleWord: "Session",
    quizEmoji: "\u{1F3AF}",
    checkpointWord: "Skill Check",
    trackerHeader: "Build Log",
    trackerIcon: "\u{1F4CB}",
    objectivesIcon: "\u{1F3AF}",
  },
  storytelling: {
    subtitleIcon: "\u{1F4D6}",
    detailedHeader: "The Chapters",
    detailedEmoji: "\u{1F4DC}",
    moduleEmoji: "\u{2728}",
    moduleWord: "Chapter",
    quizEmoji: "\u{1F4AD}",
    checkpointWord: "Reflection",
    trackerHeader: "Reader's Journey",
    trackerIcon: "\u{1F4D6}",
    objectivesIcon: "\u{1F4AB}",
  },
};

const MOD_PREFIX_RE = /^(?:module|chapter|session|unit|lesson|scene)\s*\d+\s*[:.\-–—]\s*/i;

export function generateNotionMarkdown(
  c: Curriculum,
  opts?: { teachingStyle?: TeachingStyle | null }
): string {
  const cfg = NOTION_STYLE[opts?.teachingStyle ?? "conversational"] ?? NOTION_STYLE.conversational;
  const lines: string[] = [];
  const div = "\n---\n";
  const totalLessons = c.modules.reduce((a, m) => a + (m.lessons?.length || 0), 0);
  const totalQuizzes = c.modules.reduce(
    (a, m) => a + (m.quiz?.length || 0) + m.lessons.reduce((b, l) => b + (l.quiz?.length || 0), 0),
    0
  );
  const diffEmoji: Record<string, string> = { beginner: "\u{1F7E2}", intermediate: "\u{1F7E1}", advanced: "\u{1F534}" };

  // ═══════════════════════════════════════════════════
  //  HEADER — Course title & tagline
  // ═══════════════════════════════════════════════════
  lines.push(`# ${c.title}`);
  lines.push("");
  lines.push(`> ${cfg.subtitleIcon} ${c.subtitle}`);
  lines.push(div);

  // ═══════════════════════════════════════════════════
  //  QUICK STATS DASHBOARD
  // ═══════════════════════════════════════════════════
  lines.push("## \u{1F4CA} Course at a Glance");
  lines.push("");
  lines.push("| | | | | |");
  lines.push("|:---:|:---:|:---:|:---:|:---:|");
  lines.push(
    `| **${c.modules.length}** ${cfg.moduleWord}s | **${totalLessons}** Lessons | **${c.pacing.totalHours}** Hours | **${totalQuizzes}** Quizzes | ${diffEmoji[c.difficulty] || "\u{1F7E3}"} ${c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1)} |`
  );
  lines.push("");

  // ═══════════════════════════════════════════════════
  //  COURSE OVERVIEW
  // ═══════════════════════════════════════════════════
  lines.push("## \u{1F4CB} Course Overview");
  lines.push("");
  lines.push(c.description);
  lines.push("");
  lines.push(`> \u{1F464} **Target Audience:** ${c.targetAudience}`);
  lines.push("");
  lines.push("| Detail | Info |");
  lines.push("|---|---|");
  lines.push(`| \u{1F4C6} **Pacing** | ${c.pacing.style.replace("-", " ")} \u2014 ${c.pacing.hoursPerWeek}h/week over ${c.pacing.totalWeeks} weeks |`);
  lines.push(`| \u{23F1}\u{FE0F} **Total Duration** | ${c.pacing.totalHours} hours |`);
  if (c.tags && c.tags.length > 0) {
    lines.push(`| \u{1F3F7}\u{FE0F} **Tags** | ${c.tags.join(", ")} |`);
  }
  lines.push(div);

  // ═══════════════════════════════════════════════════
  //  LEARNING OBJECTIVES — Trackable checklist
  // ═══════════════════════════════════════════════════
  lines.push(`## ${cfg.objectivesIcon} Learning Objectives`);
  lines.push("");
  lines.push("> Track your progress by checking off each objective as you master it.");
  lines.push("");
  c.objectives.forEach((obj) => lines.push(`- [ ] ${obj}`));
  lines.push("");

  // ── Prerequisites
  if (c.prerequisites && c.prerequisites.length > 0) {
    lines.push("### \u{1F4D6} Prerequisites");
    lines.push("");
    c.prerequisites.forEach((p) => lines.push(`- ${p}`));
    lines.push("");
  }
  lines.push(div);

  // ═══════════════════════════════════════════════════
  //  COURSE ROADMAP — Visual module overview
  // ═══════════════════════════════════════════════════
  lines.push("## \u{1F5FA}\u{FE0F} Course Roadmap");
  lines.push("");
  lines.push(`| ${cfg.moduleWord} | Title | Lessons | Duration | Key Focus |`);
  lines.push("|:---:|---|:---:|:---:|---|");
  c.modules.forEach((mod) => {
    const modNum = (mod.order ?? 0) + 1;
    const cleanTitle = mod.title.replace(MOD_PREFIX_RE, "");
    const totalMin = mod.durationMinutes || mod.lessons.reduce((a, l) => a + l.durationMinutes, 0);
    const hrs = Math.round(totalMin / 60 * 10) / 10;
    const focus = mod.objectives?.[0] || mod.description.slice(0, 60) + "...";
    lines.push(`| **${modNum}** | ${cleanTitle} | ${mod.lessons.length} | ${hrs}h | ${focus} |`);
  });
  lines.push(div);

  // ═══════════════════════════════════════════════════
  //  MODULES & LESSONS — Detailed breakdown
  // ═══════════════════════════════════════════════════
  lines.push(`## ${cfg.detailedEmoji} ${cfg.detailedHeader}`);
  lines.push("");

  c.modules.forEach((mod) => {
    const modNum = (mod.order ?? 0) + 1;
    const cleanTitle = mod.title.replace(MOD_PREFIX_RE, "");
    const totalMin = mod.durationMinutes || mod.lessons.reduce((a, l) => a + l.durationMinutes, 0);
    const hrs = Math.round(totalMin / 60 * 10) / 10;

    lines.push(div);
    lines.push(`### ${cfg.moduleEmoji} ${cfg.moduleWord} ${modNum}: ${cleanTitle}`);
    lines.push("");
    lines.push(`> ${mod.description}`);
    lines.push("");
    lines.push(`\u{23F1}\u{FE0F} **Duration:** ${hrs}h \u00A0\u00A0|\u00A0\u00A0 \u{1F4D6} **Lessons:** ${mod.lessons.length}`);
    lines.push("");

    // Module objectives
    if (mod.objectives && mod.objectives.length > 0) {
      lines.push("<details>");
      lines.push(`<summary>${cfg.objectivesIcon} <b>${cfg.moduleWord} Objectives (${mod.objectives.length})</b></summary>`);
      lines.push("");
      mod.objectives.forEach((o) => lines.push(`- \u2713 ${o}`));
      lines.push("");
      lines.push("</details>");
      lines.push("");
    }

    // Lesson overview table
    lines.push("| # | Lesson | Format | Duration |");
    lines.push("|:---:|---|:---:|:---:|");
    const formatEmoji: Record<string, string> = {
      video: "\u{1F3AC}",
      reading: "\u{1F4D6}",
      interactive: "\u{1F579}\u{FE0F}",
      discussion: "\u{1F4AC}",
      project: "\u{1F6E0}\u{FE0F}",
      "live-session": "\u{1F534}",
    };
    mod.lessons?.forEach((l, idx) => {
      const emoji = formatEmoji[l.format] || "\u{1F4D6}";
      lines.push(`| ${idx + 1} | ${l.title} | ${emoji} ${l.format} | ${l.durationMinutes}m |`);
    });
    lines.push("");

    // Detailed lesson breakdowns
    mod.lessons?.forEach((l, idx) => {
      lines.push(`#### Lesson ${idx + 1}: ${l.title}`);
      lines.push("");

      if (l.objectives && l.objectives.length > 0) {
        lines.push("**\u{1F3AF} Objectives:**");
        l.objectives.forEach((o) => lines.push(`- [ ] ${o}`));
        lines.push("");
      }

      if (l.content) {
        lines.push(l.content);
        lines.push("");
      }

      if (l.keyPoints && l.keyPoints.length > 0) {
        lines.push("<details>");
        lines.push("<summary>\u{1F4A1} <b>Key Points</b></summary>");
        lines.push("");
        l.keyPoints.forEach((kp) => lines.push(`- ${kp}`));
        lines.push("");
        lines.push("</details>");
        lines.push("");
      }

      if (l.suggestedResources && l.suggestedResources.length > 0) {
        lines.push("**\u{1F517} Resources:**");
        lines.push("");
        l.suggestedResources.forEach((r) =>
          lines.push(`- [${r.title}](${r.url}) \u2014 *${r.type}*`)
        );
        lines.push("");
      }

      // Lesson-level quizzes
      if (l.quiz && l.quiz.length > 0) {
        lines.push("<details>");
        lines.push(`<summary>\u{2753} <b>Lesson Quiz (${l.quiz.length} questions)</b></summary>`);
        lines.push("");
        l.quiz.forEach((q, qi) => {
          lines.push(`**Q${qi + 1}.** ${q.question}`);
          lines.push("");
          if (q.options) {
            q.options.forEach((opt, optIdx) => {
              const isCorrect = opt === q.correctAnswer || optIdx === q.correctAnswer;
              lines.push(`${isCorrect ? "\u2705" : "\u2B1C"} ${opt}`);
            });
            lines.push("");
          }
          const ansText = typeof q.correctAnswer === "number" && q.options
            ? q.options[q.correctAnswer]
            : q.correctAnswer;
          lines.push(`> \u{1F4A1} **Answer:** ${ansText}${q.explanation ? ` \u2014 ${q.explanation}` : ""}`);
          lines.push("");
        });
        lines.push("</details>");
        lines.push("");
      }
    });

    // Module quiz
    if (mod.quiz && mod.quiz.length > 0) {
      lines.push(`#### ${cfg.quizEmoji} ${cfg.moduleWord} ${modNum} ${cfg.checkpointWord}`);
      lines.push("");
      mod.quiz.forEach((q, i) => {
        lines.push(`**Q${i + 1}.** ${q.question}`);
        lines.push("");
        if (q.options) {
          q.options.forEach((opt, optIdx) => {
            const isCorrect = opt === q.correctAnswer || optIdx === q.correctAnswer;
            lines.push(`${isCorrect ? "\u2705" : "\u2B1C"} ${opt}`);
          });
          lines.push("");
        }
        const answerText = typeof q.correctAnswer === "number" && q.options
          ? q.options[q.correctAnswer]
          : q.correctAnswer;
        lines.push("<details>");
        lines.push(`<summary>\u{1F50D} Show Answer</summary>`);
        lines.push("");
        lines.push(`**Answer:** ${answerText}`);
        if (q.explanation) {
          lines.push("");
          lines.push(`**Explanation:** ${q.explanation}`);
        }
        lines.push("");
        lines.push("</details>");
        lines.push("");
      });
    }
  });

  lines.push(div);

  // ═══════════════════════════════════════════════════
  //  PACING SCHEDULE
  // ═══════════════════════════════════════════════════
  if (c.pacing?.weeklyPlan && c.pacing.weeklyPlan.length > 0) {
    lines.push("## \u{1F4C5} Weekly Pacing Schedule");
    lines.push("");
    lines.push(`> \u{23F0} **Recommended pace:** ${c.pacing.hoursPerWeek} hours/week for ${c.pacing.totalWeeks} weeks`);
    lines.push("");
    lines.push("| Week | Focus | Hours | Progress |");
    lines.push("|:---:|---|:---:|:---:|");
    c.pacing.weeklyPlan.forEach((w, idx) => {
      const label = w.label || (w.moduleIds?.length
        ? w.moduleIds.map((id) => {
            const m = c.modules.find((mod) => mod.id === id);
            return m ? m.title.replace(MOD_PREFIX_RE, "") : id;
          }).join(", ")
        : "Course Content");
      const pctDone = Math.round(((idx + 1) / c.pacing.weeklyPlan!.length) * 100);
      const bar = "\u2588".repeat(Math.round(pctDone / 10)) + "\u2591".repeat(10 - Math.round(pctDone / 10));
      lines.push(`| **${w.week}** | ${label} | ${c.pacing.hoursPerWeek}h | ${bar} ${pctDone}% |`);
    });
    lines.push(div);
  }

  // ═══════════════════════════════════════════════════
  //  PROGRESS TRACKER — Completion checklist
  // ═══════════════════════════════════════════════════
  lines.push(`## ${cfg.trackerIcon} ${cfg.trackerHeader}`);
  lines.push("");
  lines.push("> Check off each lesson as you complete it. Your goal: 100%!");
  lines.push("");
  c.modules.forEach((mod) => {
    const modNum = (mod.order ?? 0) + 1;
    const cleanTitle = mod.title.replace(MOD_PREFIX_RE, "");
    lines.push(`### ${cfg.moduleWord} ${modNum}: ${cleanTitle}`);
    lines.push("");
    mod.lessons.forEach((l) => {
      lines.push(`- [ ] ${l.title} *(${l.durationMinutes}m)*`);
    });
    lines.push("");
  });
  lines.push(div);

  // ═══════════════════════════════════════════════════
  //  BONUS RESOURCES
  // ═══════════════════════════════════════════════════
  if (c.bonusResources && c.bonusResources.length > 0) {
    lines.push("## \u{1F381} Bonus Resources");
    lines.push("");
    lines.push("| Type | Resource | Description |");
    lines.push("|:---:|---|---|");
    const typeEmoji: Record<string, string> = {
      article: "\u{1F4F0}",
      video: "\u{1F3AC}",
      podcast: "\u{1F3A7}",
      book: "\u{1F4D5}",
      tool: "\u{1F6E0}\u{FE0F}",
      template: "\u{1F4C4}",
      cheatsheet: "\u{1F4DD}",
    };
    c.bonusResources.forEach((r) => {
      const emoji = typeEmoji[r.type] || "\u{1F4CE}";
      lines.push(
        `| ${emoji} ${r.type} | **${r.title}** | ${r.description || ""} |`
      );
    });
    lines.push(div);
  }

  // ═══════════════════════════════════════════════════
  //  NOTES SECTION — Space for learner notes
  // ═══════════════════════════════════════════════════
  lines.push("## \u{1F4DD} My Notes");
  lines.push("");
  lines.push("> Use this space for your personal notes, reflections, and ideas as you progress through the course.");
  lines.push("");
  lines.push("");
  lines.push(div);

  // ═══════════════════════════════════════════════════
  //  FOOTER
  // ═══════════════════════════════════════════════════
  lines.push("");
  lines.push(`> \u{1F680} *Generated by [Syllabi](https://syllabi.online) \u2014 AI-Powered Course Design*`);
  lines.push("");

  return lines.join("\n");
}
