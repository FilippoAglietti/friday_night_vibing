"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutGrid,
  Lightbulb,
  RefreshCw,
  Share2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { generateCurriculumPDF } from "@/lib/pdf/generatePDF";
import { generateCurriculumDocx } from "@/lib/exports/generateDocx";
import { generateCurriculumPptx } from "@/lib/exports/generatePptx";
import { generateScormPackage } from "@/lib/exports/generateScorm";
import { generateShareableUrl } from "@/lib/exports/generateShareUrl";
import type { Curriculum, Lesson, Module, QuizQuestion, BonusResource } from "@/types/curriculum";

interface CurriculumOutputProps {
  curriculum: Curriculum;
  onGenerateAnother: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMarkdown(c: Curriculum): string {
  const lines: string[] = [];

  lines.push(`# ${c.title}`);
  lines.push(`**${c.subtitle}**\n`);
  lines.push(`${c.description}\n`);

  lines.push(`## Learning Outcomes`);
  c.objectives.forEach((o) => lines.push(`- ${o}`));
  lines.push("");

  c.modules.forEach((mod) => {
    lines.push(`## Module ${mod.order + 1}: ${mod.title}`);
    lines.push(`${mod.description}\n`);
    mod.lessons.forEach((l) => {
      lines.push(`### Lesson ${l.order + 1}: ${l.title}`);
      if (l.objectives && l.objectives.length > 0) {
        lines.push(`**Objectives:** ${l.objectives.join(", ")}`);
      }
      lines.push(`**Duration:** ${l.durationMinutes} mins`);
      if (l.keyPoints && l.keyPoints.length > 0) {
        lines.push(`\n**Key Points:**`);
        l.keyPoints.forEach((kp) => lines.push(`- ${kp}`));
      }
      if (l.suggestedResources && l.suggestedResources.length > 0) {
        lines.push(`\n**Suggested Resources:**`);
        l.suggestedResources.forEach((r) => lines.push(`- [${r.title}](${r.url}) *(${r.type})*`));
      }
      lines.push("");
    });
    if (mod.quiz && mod.quiz.length > 0) {
      lines.push(`### Quiz`);
      mod.quiz.forEach((q, i) => {
        lines.push(`**Q${i + 1}: ${q.question}**`);
        if (q.options) {
          q.options.forEach((opt) => lines.push(`- ${opt}`));
        }
        const answerText = typeof q.correctAnswer === "number" && q.options 
          ? q.options[q.correctAnswer] 
          : q.correctAnswer;
        lines.push(`✅ **Answer:** ${answerText}`);
        if (q.explanation) {
          lines.push(`💡 ${q.explanation}\n`);
        }
      });
    }
  });

  lines.push(`## Pacing Schedule`);
  if (c.pacing) {
    lines.push(`**Total Duration:** ${c.pacing.totalHours} hours\n`);
    if (c.pacing.weeklyPlan) {
      c.pacing.weeklyPlan.forEach((w) => {
        lines.push(
          `- **Week ${w.week}:** Modules ${w.moduleIds?.length ? w.moduleIds.join(", ") : w.label || "TBD"} — ${c.pacing.hoursPerWeek}h/week`
        );
      });
    }
  }
  lines.push("");

  if (c.bonusResources && c.bonusResources.length > 0) {
    lines.push(`## Bonus Resources`);
    c.bonusResources.forEach((r) =>
      lines.push(`- **${r.title}** *(${r.type})*: ${r.description}`)
    );
  }

  return lines.join("\n");
}

function toNotionMarkdown(c: Curriculum): string {
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
  lines.push(`> \u{2728} ${c.subtitle}`);
  lines.push(div);

  // ═══════════════════════════════════════════════════
  //  QUICK STATS DASHBOARD
  // ═══════════════════════════════════════════════════
  lines.push("## \u{1F4CA} Course at a Glance");
  lines.push("");
  lines.push("| | | | | |");
  lines.push("|:---:|:---:|:---:|:---:|:---:|");
  lines.push(
    `| **${c.modules.length}** Modules | **${totalLessons}** Lessons | **${c.pacing.totalHours}** Hours | **${totalQuizzes}** Quizzes | ${diffEmoji[c.difficulty] || "\u{1F7E3}"} ${c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1)} |`
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
  lines.push("## \u{1F3AF} Learning Objectives");
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
  lines.push("| Module | Title | Lessons | Duration | Key Focus |");
  lines.push("|:---:|---|:---:|:---:|---|");
  c.modules.forEach((mod) => {
    const modNum = (mod.order ?? 0) + 1;
    const cleanTitle = mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "");
    const totalMin = mod.durationMinutes || mod.lessons.reduce((a, l) => a + l.durationMinutes, 0);
    const hrs = Math.round(totalMin / 60 * 10) / 10;
    const focus = mod.objectives?.[0] || mod.description.slice(0, 60) + "...";
    lines.push(`| **${modNum}** | ${cleanTitle} | ${mod.lessons.length} | ${hrs}h | ${focus} |`);
  });
  lines.push(div);

  // ═══════════════════════════════════════════════════
  //  MODULES & LESSONS — Detailed breakdown
  // ═══════════════════════════════════════════════════
  lines.push("## \u{1F4DA} Detailed Curriculum");
  lines.push("");

  c.modules.forEach((mod) => {
    const modNum = (mod.order ?? 0) + 1;
    const cleanTitle = mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "");
    const totalMin = mod.durationMinutes || mod.lessons.reduce((a, l) => a + l.durationMinutes, 0);
    const hrs = Math.round(totalMin / 60 * 10) / 10;

    lines.push(div);
    lines.push(`### \u{1F4D5} Module ${modNum}: ${cleanTitle}`);
    lines.push("");
    lines.push(`> ${mod.description}`);
    lines.push("");
    lines.push(`\u{23F1}\u{FE0F} **Duration:** ${hrs}h \u00A0\u00A0|\u00A0\u00A0 \u{1F4D6} **Lessons:** ${mod.lessons.length}`);
    lines.push("");

    // Module objectives
    if (mod.objectives && mod.objectives.length > 0) {
      lines.push("<details>");
      lines.push(`<summary>\u{1F3AF} <b>Module Objectives (${mod.objectives.length})</b></summary>`);
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
      lines.push(`#### \u{1F9EA} Module ${modNum} Knowledge Check`);
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
            return m ? m.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "") : id;
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
  lines.push("## \u{2705} Progress Tracker");
  lines.push("");
  lines.push("> Check off each lesson as you complete it. Your goal: 100%!");
  lines.push("");
  c.modules.forEach((mod) => {
    const modNum = (mod.order ?? 0) + 1;
    const cleanTitle = mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "");
    lines.push(`### Module ${modNum}: ${cleanTitle}`);
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!lesson.content ||
                     (lesson.keyPoints && lesson.keyPoints.length > 0) ||
                     (lesson.suggestedResources && lesson.suggestedResources.length > 0);

  return (
    <div className="pl-4 py-3 border-l-2 border-primary/20 hover:border-primary/60 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-foreground leading-snug">
              {index + 1}. {lesson.title}
            </p>
            {hasDetails && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:text-primary/80 underline-offset-2 hover:underline shrink-0"
              >
                {expanded ? "Less" : "Details"}
              </button>
            )}
          </div>
          {lesson.objectives && lesson.objectives.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {lesson.objectives[0]}
            </p>
          )}

          {/* Expanded: Content + Key Points + Suggested Resources */}
          {expanded && hasDetails && (
            <div className="mt-3 space-y-3">
              {lesson.content && (
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-muted-foreground leading-relaxed">
                  {lesson.content.split(/\n\n+/).filter(p => p.trim()).slice(0, 4).map((paragraph, i) => {
                    const stripped = paragraph
                      .replace(/^#{1,4}\s+/gm, "")
                      .replace(/\*\*(.*?)\*\*/g, "$1")
                      .replace(/\*(.*?)\*/g, "$1")
                      .replace(/`([^`]+)`/g, "$1")
                      .replace(/>\s*/g, "")
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
                      .trim();
                    if (!stripped) return null;
                    return <p key={i} className="mb-1.5 last:mb-0">{stripped}</p>;
                  })}
                </div>
              )}

              {lesson.keyPoints && lesson.keyPoints.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Points</span>
                  </div>
                  <ul className="space-y-1">
                    {lesson.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-primary mt-0.5 shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {lesson.suggestedResources && lesson.suggestedResources.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ExternalLink className="h-3 w-3 text-violet-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</span>
                  </div>
                  <ul className="space-y-1">
                    {lesson.suggestedResources.map((res, i) => (
                      <li key={i} className="text-xs">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline underline-offset-2"
                        >
                          {res.title}
                        </a>
                        <span className="text-muted-foreground ml-1">({res.type})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Clock className="h-3 w-3" />
          <span>{lesson.durationMinutes}m</span>
        </div>
      </div>
    </div>
  );
}

function QuizCard({ question, index }: { question: QuizQuestion; index: number }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-start gap-2">
        <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            Q{index + 1}: {question.question}
          </p>
          {question.options && question.options.length > 0 && (
            <ul className="mt-2 space-y-1">
              {question.options.map((opt, optIndex) => (
                <li
                  key={optIndex}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                    revealed && (opt === question.correctAnswer || optIndex === question.correctAnswer)
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
          {revealed ? (
            <div className="mt-2">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                ✅ Answer: {typeof question.correctAnswer === "number" && question.options
                  ? question.options[question.correctAnswer]
                  : question.correctAnswer}
              </p>
              {question.explanation && (
                <p className="text-xs text-muted-foreground italic">
                  💡 {question.explanation}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="mt-2 text-xs text-primary underline-offset-2 hover:underline"
            >
              Reveal answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CurriculumOutput({
  curriculum,
  onGenerateAnother,
}: CurriculumOutputProps) {
  const [copied, setCopied] = useState(false);
  const [loadingExports, setLoadingExports] = useState<Record<string, boolean>>({});

  const totalLessons = curriculum.modules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  );
  const totalQuizzes = curriculum.modules.reduce(
    (acc, m) => acc + (m.quiz?.length || 0),
    0
  );

  const sanitizeFilename = (title: string) => title.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  // ── Copy as Markdown ──
  const handleCopy = async () => {
    await navigator.clipboard.writeText(toMarkdown(curriculum));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = generateCurriculumPDF(curriculum);
      pdf.save(`${sanitizeFilename(curriculum.title)}_syllabus.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
    }
  };

  const handleExportNotion = () => {
    const md = toNotionMarkdown(curriculum);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(curriculum.title)}_notion.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportDocx = async () => {
    try {
      setLoadingExports((prev) => ({ ...prev, docx: true }));
      const blob = await generateCurriculumDocx(curriculum);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(curriculum.title)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate Word document:", e);
    } finally {
      setLoadingExports((prev) => ({ ...prev, docx: false }));
    }
  };

  const handleExportPptx = async () => {
    try {
      setLoadingExports((prev) => ({ ...prev, pptx: true }));
      const blob = await generateCurriculumPptx(curriculum);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(curriculum.title)}_slides.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate presentation:", e);
    } finally {
      setLoadingExports((prev) => ({ ...prev, pptx: false }));
    }
  };

  const handleExportScorm = async () => {
    try {
      setLoadingExports((prev) => ({ ...prev, scorm: true }));
      const blob = await generateScormPackage(curriculum);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(curriculum.title)}_scorm.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate SCORM package:", e);
    } finally {
      setLoadingExports((prev) => ({ ...prev, scorm: false }));
    }
  };

  const handleShareLink = async () => {
    try {
      const shareUrl = generateShareableUrl(curriculum);
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to generate share link:", e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">

      {/* ── Header card ── */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-tight">{curriculum.title}</h1>
              <p className="text-sm text-primary font-medium mt-0.5">{curriculum.subtitle}</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{curriculum.description}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { icon: BookOpen, label: `${curriculum.modules.length} Modules` },
              { icon: Target, label: `${totalLessons} Lessons` },
              { icon: HelpCircle, label: `${totalQuizzes} Quiz Questions` },
              { icon: Clock, label: `${curriculum.pacing?.totalHours || 0} Hours` },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* ── Learning Outcomes ── */}
      {curriculum.objectives && curriculum.objectives.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-base">Learning Outcomes</h2>
            </div>
            <ul className="space-y-2">
              {curriculum.objectives.map((outcome, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Modules ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-base">Course Modules</h2>
          </div>
          <Accordion className="space-y-2">
            {curriculum.modules.map((mod, index) => (
              <AccordionItem
                key={mod.id || index}
                value={`module-${mod.id || index}`}
                className="border rounded-lg px-4 data-[state=open]:border-primary/40 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {(mod.order !== undefined ? mod.order : index) + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{mod.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mod.lessons?.length || 0} lessons
                        {mod.quiz && mod.quiz.length > 0 &&
                          ` · ${mod.quiz.length} quiz questions`}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-sm text-muted-foreground mb-4">{mod.description}</p>

                  <div className="space-y-2 mb-4">
                    {mod.lessons?.map((lesson, idx) => (
                      <LessonCard key={lesson.id || idx} lesson={lesson} index={idx} />
                    ))}
                  </div>

                  {mod.quiz && mod.quiz.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Module Quiz
                      </p>
                      <div className="space-y-3">
                        {mod.quiz.map((q, i) => (
                          <QuizCard key={q.id || i} question={q} index={i} />
                        ))}
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* ── Pacing Schedule ── */}
      {curriculum.pacing && curriculum.pacing.weeklyPlan && curriculum.pacing.weeklyPlan.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-base">
                Pacing Schedule
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  — {curriculum.pacing.totalHours} Hours Total
                </span>
              </h2>
            </div>
            <div className="space-y-2">
              {curriculum.pacing.weeklyPlan.map((week, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-primary w-16 shrink-0">
                    Week {week.week}
                  </span>
                  <span className="text-muted-foreground flex-1">
                    {week.label || (week.moduleIds && week.moduleIds.length > 0 ? `Modules ${week.moduleIds.join(", ")}` : "Course Content")}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {curriculum.pacing.hoursPerWeek}h / week
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Bonus Resources ── */}
      {curriculum.bonusResources && curriculum.bonusResources.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-base mb-4">✨ Bonus Resources</h2>
            <div className="space-y-3">
              {curriculum.bonusResources.map((r, i) => (
                <div key={r.id || i} className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5 shrink-0">
                    {r.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Action Buttons ── */}
      <div className="space-y-3 pb-8">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Button
            onClick={handleDownloadPDF}
            className="flex-1 gap-2 min-w-[140px]"
            size="lg"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            onClick={handleExportNotion}
            className="flex-1 gap-2 min-w-[140px] bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 hover:from-violet-700 hover:to-purple-700"
            size="lg"
          >
            <FileText className="h-4 w-4" />
            Export for Notion
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 gap-2 min-w-[140px]"
            size="lg"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy Markdown"}
          </Button>
          <Button
            onClick={onGenerateAnother}
            variant="ghost"
            className="flex-1 gap-2 min-w-[140px]"
            size="lg"
          >
            <RefreshCw className="h-4 w-4" />
            Generate Another
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Button
            onClick={handleExportDocx}
            disabled={loadingExports.docx}
            className="flex-1 gap-2 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white border-0"
            size="lg"
          >
            <FileText className="h-4 w-4" />
            {loadingExports.docx ? "Generating..." : "Word"}
          </Button>
          <Button
            onClick={handleExportPptx}
            disabled={loadingExports.pptx}
            className="flex-1 gap-2 min-w-[140px] bg-orange-600 hover:bg-orange-700 text-white border-0"
            size="lg"
          >
            <LayoutGrid className="h-4 w-4" />
            {loadingExports.pptx ? "Generating..." : "Slides"}
          </Button>
          <Button
            onClick={handleExportScorm}
            disabled={loadingExports.scorm}
            className="flex-1 gap-2 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white border-0"
            size="lg"
          >
            <GraduationCap className="h-4 w-4" />
            {loadingExports.scorm ? "Generating..." : "SCORM"}
          </Button>
          <Button
            onClick={handleShareLink}
            className="flex-1 gap-2 min-w-[140px] bg-cyan-600 hover:bg-cyan-700 text-white border-0"
            size="lg"
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Link Copied!" : "Share"}
          </Button>
        </div>
      </div>
    </div>
  );
}
