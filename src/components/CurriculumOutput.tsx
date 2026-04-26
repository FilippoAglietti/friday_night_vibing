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
  Headphones,
  HelpCircle,
  Lightbulb,
  Lock,
  Mail,
  Pencil,
  RefreshCw,
  RotateCcw,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Wand2,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import { generateCurriculumPDF } from "@/lib/pdf/generatePDF";
import { generateCurriculumDocx } from "@/lib/exports/generateDocx";
import { generateScormPackage } from "@/lib/exports/generateScorm";
import { generateShareableUrl, type LeadMagnetSettings } from "@/lib/exports/generateShareUrl";
import { generateNotionMarkdown } from "@/lib/exports/generateNotionMarkdown";
import { copyNotionHtmlToClipboard } from "@/lib/exports/generateNotionHtml";
import {
  generateNotebookLMMarkdown,
  notebookLMFilename,
} from "@/lib/exports/generateNotebookLMMarkdown";
import type { Curriculum, Lesson, Module, QuizQuestion, BonusResource, TeachingStyle } from "@/types/curriculum";

interface CurriculumOutputProps {
  curriculum: Curriculum;
  onGenerateAnother: () => void;
  teachingStyle?: TeachingStyle | null;
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
      const visibleLessonResources = (l.suggestedResources ?? []).filter(
        (r) => r.status !== "unreachable",
      );
      if (visibleLessonResources.length > 0) {
        lines.push(`\n**Suggested Resources:**`);
        visibleLessonResources.forEach((r) => lines.push(`- [${r.title}](${r.url}) *(${r.type})*`));
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

  const visibleBonusResources = (c.bonusResources ?? []).filter(
    (r) => r.status !== "unreachable",
  );
  if (visibleBonusResources.length > 0) {
    lines.push(`## Bonus Resources`);
    visibleBonusResources.forEach((r) =>
      lines.push(`- **${r.title}** *(${r.type})*: ${r.description}`)
    );
  }

  return lines.join("\n");
}

// toNotionMarkdown extracted to @/lib/exports/generateNotionMarkdown.ts
// (see: src/lib/exports/generateNotionMarkdown.ts)

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

              {(() => {
                const visibleRes = (lesson.suggestedResources ?? []).filter(
                  (r) => r.status !== "unreachable",
                );
                if (visibleRes.length === 0) return null;
                return (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ExternalLink className="h-3 w-3 text-violet-500" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</span>
                    </div>
                    <ul className="space-y-1">
                      {visibleRes.map((res, i) => (
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
                );
              })()}
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
  teachingStyle,
}: CurriculumOutputProps) {
  const [copied, setCopied] = useState(false);
  const [notionCopied, setNotionCopied] = useState(false);
  const [loadingExports, setLoadingExports] = useState<Record<string, boolean>>({});
  const [creatorName, setCreatorName] = useState<string>("Author");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (cancelled || !user) return;
      const meta = user.user_metadata as { full_name?: string } | undefined;
      const fromName = meta?.full_name?.trim();
      const fromEmail = user.email?.split("@")[0];
      setCreatorName(fromName || fromEmail || "Author");
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [leadMagnet, setLeadMagnet] = useState<LeadMagnetSettings>({
    enabled: false,
    headline: "Get free access to this course",
    ctaText: "Unlock Course",
  });
  const [showLeadMagnetPanel, setShowLeadMagnetPanel] = useState(false);

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
      const pdf = generateCurriculumPDF(curriculum, { teachingStyle, creatorName });
      pdf.save(`${sanitizeFilename(curriculum.title)}_syllabus.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
    }
  };

  const handleExportNotion = async () => {
    const ok = await copyNotionHtmlToClipboard(curriculum, { teachingStyle, creatorName });
    if (ok) {
      setNotionCopied(true);
      setTimeout(() => setNotionCopied(false), 3000);
    }
  };

  const handleExportDocx = async () => {
    try {
      setLoadingExports((prev) => ({ ...prev, docx: true }));
      const blob = await generateCurriculumDocx(curriculum, { teachingStyle, creatorName });
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

  const handleExportScorm = async () => {
    try {
      setLoadingExports((prev) => ({ ...prev, scorm: true }));
      const blob = await generateScormPackage(curriculum, { teachingStyle, creatorName });
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

  const handleExportNotebookLM = () => {
    const md = generateNotebookLMMarkdown(curriculum, { creatorName });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = notebookLMFilename(curriculum);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareLink = async () => {
    try {
      const shareUrl = generateShareableUrl(
        curriculum,
        leadMagnet.enabled ? leadMagnet : undefined,
      );
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
      {(() => {
        const visibleBonus = (curriculum.bonusResources ?? []).filter(
          (r) => r.status !== "unreachable",
        );
        if (visibleBonus.length === 0) return null;
        return (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-base mb-4">✨ Bonus Resources</h2>
              <div className="space-y-3">
                {visibleBonus.map((r, i) => (
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
        );
      })()}

      {/* ── Edit & Refine ── */}
      <Card className="border-dashed border-violet-500/20 bg-violet-500/[0.02]">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="h-5 w-5 text-violet-500" />
            <h2 className="font-semibold text-base">Edit & Refine</h2>
            <Badge variant="outline" className="text-[10px] ml-1 border-violet-500/30 text-violet-400">
              Beta
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Fine-tune your course — edit the title, regenerate lessons, or adjust the structure.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card/50 p-3 text-center transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
              onClick={() => {
                const newTitle = prompt("Edit course title:", curriculum.title);
                if (newTitle && newTitle !== curriculum.title) {
                  // TODO: Filippo — API endpoint to update course title
                  alert("Title editing will be available soon — saved locally for now.");
                }
              }}
            >
              <Pencil className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium">Edit Title</span>
            </button>
            <button
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card/50 p-3 text-center transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
              onClick={() => {
                // TODO: Filippo — API endpoint to regenerate specific module
                alert("Module regeneration coming soon — Filippo is building the API.");
              }}
            >
              <RotateCcw className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium">Regen Module</span>
            </button>
            <button
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card/50 p-3 text-center transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
              onClick={() => {
                // TODO: Filippo — API endpoint to add a module
                alert("Adding modules coming soon — Filippo is building the API.");
              }}
            >
              <Sparkles className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium">Add Module</span>
            </button>
            <button
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card/50 p-3 text-center transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
              onClick={() => {
                // TODO: Filippo — API endpoint to adjust difficulty/depth
                alert("Depth adjustment coming soon — Filippo is building the API.");
              }}
            >
              <Target className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium">Adjust Depth</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Lead Magnet Mode ── */}
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/[0.03] to-cyan-500/[0.03]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-violet-500" />
              <h2 className="font-semibold text-base">Lead Magnet Mode</h2>
              <Badge variant="outline" className="text-[10px] ml-1 border-cyan-500/30 text-cyan-400">
                Growth
              </Badge>
            </div>
            <button
              onClick={() => {
                const next = !leadMagnet.enabled;
                setLeadMagnet((prev) => ({ ...prev, enabled: next }));
                if (next) setShowLeadMagnetPanel(true);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                leadMagnet.enabled ? "bg-violet-600" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  leadMagnet.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Gate your course behind an email capture — turn every share link into a lead generation machine.
          </p>

          {leadMagnet.enabled && (
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Gate Headline
                </label>
                <input
                  type="text"
                  value={leadMagnet.headline || ""}
                  onChange={(e) =>
                    setLeadMagnet((prev) => ({ ...prev, headline: e.target.value }))
                  }
                  placeholder="Get free access to this course"
                  className="w-full rounded-lg border border-border/40 bg-card/50 px-3 py-2 text-sm focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={leadMagnet.description || ""}
                  onChange={(e) =>
                    setLeadMagnet((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter your email to unlock all modules, quizzes, and the NotebookLM-ready podcast export"
                  className="w-full rounded-lg border border-border/40 bg-card/50 px-3 py-2 text-sm focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Button Text
                </label>
                <input
                  type="text"
                  value={leadMagnet.ctaText || ""}
                  onChange={(e) =>
                    setLeadMagnet((prev) => ({ ...prev, ctaText: e.target.value }))
                  }
                  placeholder="Unlock Course"
                  className="w-full rounded-lg border border-border/40 bg-card/50 px-3 py-2 text-sm focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                />
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <Lock className="size-3" />
                <span>
                  Visitors will see the course preview (title, stats, first module) but must enter their email to unlock the full content.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
            {notionCopied ? "Copied! Paste in Notion →" : "Copy for Notion"}
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
            onClick={handleExportScorm}
            disabled={loadingExports.scorm}
            className="flex-1 gap-2 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white border-0"
            size="lg"
          >
            <GraduationCap className="h-4 w-4" />
            {loadingExports.scorm ? "Generating..." : "SCORM"}
          </Button>
          <Button
            onClick={handleExportNotebookLM}
            title="Download a Markdown file and drop it into Google NotebookLM to generate a conversational podcast of your course."
            className="flex-1 gap-2 min-w-[140px] bg-orange-600 hover:bg-orange-700 text-white border-0"
            size="lg"
          >
            <Headphones className="h-4 w-4" />
            Download for NotebookLM
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
