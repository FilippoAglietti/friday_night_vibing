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
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { generateCurriculumPDF } from "@/lib/pdf/generatePDF";
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = (lesson.keyPoints && lesson.keyPoints.length > 0) ||
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

          {/* Expanded: Key Points + Suggested Resources */}
          {expanded && hasDetails && (
            <div className="mt-3 space-y-3">
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

  const totalLessons = curriculum.modules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  );
  const totalQuizzes = curriculum.modules.reduce(
    (acc, m) => acc + (m.quiz?.length || 0),
    0
  );

  // ── Copy as Markdown ──
  const handleCopy = async () => {
    await navigator.clipboard.writeText(toMarkdown(curriculum));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = generateCurriculumPDF(curriculum);
      pdf.save(`${curriculum.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_syllabus.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
    }
  };


  const handleExportNotion = () => {
    // Generate a rich markdown formatted for Notion import
    const c = curriculum;
    let md = `# ${c.title}\n\n`;
    md += `> ${c.description}\n\n`;
    md += `**Difficulty:** ${c.difficulty} · **Duration:** ${c.pacing?.totalHours || "N/A"}h · **Modules:** ${c.modules.length}\n\n`;
    md += `---\n\n`;
    if (c.objectives?.length) {
      md += `## 🎯 Learning Objectives\n\n`;
      c.objectives.forEach((obj: string) => { md += `- ${obj}\n`; });
      md += `\n`;
    }
    if (c.prerequisites?.length) {
      md += `## 📋 Prerequisites\n\n`;
      c.prerequisites.forEach((p: string) => { md += `- ${p}\n`; });
      md += `\n`;
    }
    c.modules.forEach((m: Module, mi: number) => {
      md += `## Module ${mi + 1}: ${m.title}\n\n`;
      if (m.description) md += `${m.description}\n\n`;
      if (m.lessons?.length) {
        m.lessons.forEach((l: Lesson, li: number) => {
          md += `### ${mi + 1}.${li + 1} ${l.title}\n\n`;
          if (l.content) md += `${l.content}\n\n`;
          if (l.keyPoints?.length) {
            md += `**Key Takeaways:**\n`;
            l.keyPoints.forEach((kt: string) => { md += `- ${kt}\n`; });
            md += `\n`;
          }
        });
      }
      if (m.quiz?.length) {
        md += `### 📝 Quiz\n\n`;
        m.quiz.forEach((q: QuizQuestion, qi: number) => {
          md += `**Q${qi + 1}: ${q.question}**\n`;
          q.options?.forEach((opt: string, oi: number) => {
            md += `${oi === q.correctAnswer ? '✅' : '⬜'} ${opt}\n`;
          });
          md += `\n`;
        });
      }
      md += `---\n\n`;
    });
    if (c.bonusResources?.length) {
      md += `## 📚 Bonus Resources\n\n`;
      c.bonusResources.forEach((r: BonusResource) => {
        md += `- **${r.title}** (${r.type}) — ${r.description}\n`;
      });
    }

    // Create a downloadable .md file optimized for Notion import
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notion.md`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        <Button
          onClick={handleDownloadPDF}
          className="flex-1 gap-2"
          size="lg"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex-1 gap-2"
          size="lg"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy as Markdown"}
        </Button>
        <Button
          onClick={handleExportNotion}
          variant="outline"
          className="flex-1 gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          size="lg"
        >
          <FileText className="h-4 w-4" />
          Export for Notion
        </Button>
        <Button
          onClick={onGenerateAnother}
          variant="ghost"
          className="flex-1 gap-2"
          size="lg"
        >
          <RefreshCw className="h-4 w-4" />
          Generate Another
        </Button>
      </div>
    </div>
  );
}
