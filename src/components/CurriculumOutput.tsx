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
  HelpCircle,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { generateCurriculumPDF } from "@/lib/pdf/generatePDF";
import { curriculumToMarkdown } from "@/lib/exports/toMarkdown";
import type { Curriculum, Lesson, Module, QuizQuestion, BonusResource } from "@/types/curriculum";

interface CurriculumOutputProps {
  curriculum: Curriculum;
  onGenerateAnother: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  return (
    <div className="pl-4 py-3 border-l-2 border-primary/20 hover:border-primary/60 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground leading-snug">
            {index + 1}. {lesson.title}
          </p>
          {lesson.objectives && lesson.objectives.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {lesson.objectives[0]}
            </p>
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
    await navigator.clipboard.writeText(curriculumToMarkdown(curriculum));
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
