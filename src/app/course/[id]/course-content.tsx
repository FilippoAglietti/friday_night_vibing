"use client";

/**
 * app/course/[id]/course-content.tsx
 * ─────────────────────────────────────────────────────────────
 * Client component that renders the FULL curriculum content.
 * Shows every detail: modules, lessons with keyPoints, content,
 * suggested resources, quiz questions, pacing schedule, and
 * learning objectives.
 *
 * Design: premium dark theme with violet/indigo accents,
 * responsive layout, smooth animations.
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Headphones,
  HelpCircle,
  Lightbulb,
  Presentation,
  Share2,
  Sparkles,
  Target,
  Users,
  Calendar,
} from "lucide-react";
import { generateCurriculumPDF } from "@/lib/pdf/generatePDF";
import { generateCurriculumDocx } from "@/lib/exports/generateDocx";
import { generateScormPackage } from "@/lib/exports/generateScorm";
import { generateStudentShareUrl } from "@/lib/exports/generateShareUrl";
import { supabaseBrowser } from "@/lib/supabase";
import { copyNotionHtmlToClipboard } from "@/lib/exports/generateNotionHtml";
import {
  generateNotebookLMMarkdown,
  notebookLMFilename,
} from "@/lib/exports/generateNotebookLMMarkdown";
import {
  generateNotebookLMSlidesMarkdown,
  notebookLMSlidesFilename,
  type SlideStyle,
} from "@/lib/exports/generateNotebookLMSlidesMarkdown";
import SlideStyleModal from "@/components/exports/SlideStyleModal";
import { curriculumToMarkdown } from "@/lib/exports/toMarkdown";
import type { Curriculum, Module, Lesson, QuizQuestion, TeachingStyle } from "@/types/curriculum";
import { normalizePlan } from "@/lib/pricing/tiers";
import { ExportGrid, type ExportFormat } from "@/components/dashboard/ExportGrid";
import { appendExportEvent, summarizeExportHistory, type ExportFormatId } from "@/lib/exports/exportHistory";
import { useRouter } from "next/navigation";
import QuizResultsPanel from "@/components/course/QuizResultsPanel";
import { downloadPdfV2, isExportV2ClientEnabled } from "@/lib/export/client";

// ─── Props ───────────────────────────────────────────────────

interface CourseContentProps {
  curriculum: Curriculum;
  courseId: string;
  createdAt: string;
  teachingStyle?: TeachingStyle | null;
  rawPlan?: string | null;
  isOwner?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────

/** Total lessons across all modules */
function getTotalLessons(c: Curriculum): number {
  return c.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
}

/** Total quiz questions across all modules */
function getTotalQuizzes(c: Curriculum): number {
  return c.modules?.reduce((sum, m) => sum + (m.quiz?.length || 0), 0) || 0;
}

/** Difficulty badge colour */
function getDifficultyStyle(d?: string) {
  switch (d?.toLowerCase()) {
    case "beginner":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "intermediate":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "advanced":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    default:
      return "bg-violet-500/15 text-violet-400 border-violet-500/30";
  }
}

/** Lesson format icon */
function getLessonIcon(format?: string) {
  switch (format?.toLowerCase()) {
    case "video":       return "▶";
    case "reading":     return "📄";
    case "interactive": return "🎮";
    case "project":     return "🛠️";
    case "live-session": return "🔴";
    case "discussion":  return "💬";
    default:            return "📚";
  }
}

/** Render markdown-like content to JSX (basic: bold, inline code, headers, line breaks) */
function renderContent(text: string) {
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((p, i) => {
    const trimmed = p.trim();
    if (!trimmed) return null;

    // Heading: ## or ###
    if (trimmed.startsWith("### ")) {
      return (
        <h4 key={i} className="text-base font-semibold text-white mt-4 mb-2">
          {trimmed.slice(4)}
        </h4>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={i} className="text-lg font-semibold text-white mt-5 mb-2">
          {trimmed.slice(3)}
        </h3>
      );
    }

    // Blockquote: > text
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote
          key={i}
          className="border-l-2 border-violet-500/50 pl-4 py-1 my-3 text-sm text-slate-300 italic"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
    }

    // Regular paragraph
    return (
      <p key={i} className="text-sm text-slate-300 leading-relaxed mb-3">
        {renderInline(trimmed)}
      </p>
    );
  });
}

/** Render inline markdown: **bold**, `code` */
function renderInline(text: string) {
  // Split by bold and code patterns, preserving delimiters
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 bg-violet-500/10 text-violet-300 rounded text-xs font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ─── Sub-components ──────────────────────────────────────────

/** Single lesson with expandable details */
function LessonItem({ lesson, index }: { lesson: Lesson; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails =
    (lesson.keyPoints && lesson.keyPoints.length > 0) ||
    lesson.content ||
    (lesson.suggestedResources && lesson.suggestedResources.length > 0);

  return (
    <div className="group">
      {/* Lesson header — always visible */}
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`w-full text-left flex items-start gap-3 p-4 rounded-lg transition-all ${
          hasDetails ? "cursor-pointer hover:bg-white/5" : "cursor-default"
        } ${expanded ? "bg-white/5" : ""}`}
      >
        {/* Lesson number + icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 text-sm">
            {getLessonIcon(lesson.format)}
          </div>
        </div>

        {/* Lesson info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-white">
              {index + 1}. {lesson.title}
            </h4>
            {lesson.format && (
              <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded capitalize">
                {lesson.format}
              </span>
            )}
          </div>
          {lesson.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {lesson.description}
            </p>
          )}
          {lesson.durationMinutes && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
              <Clock className="size-3" />
              {lesson.durationMinutes} min
            </div>
          )}
        </div>

        {/* Expand chevron */}
        {hasDetails && (
          <ChevronDown
            className={`size-4 text-slate-500 transition-transform mt-1 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Expanded details */}
      {expanded && hasDetails && (
        <div className="px-4 pb-4 ml-11 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Lesson content (markdown body) */}
          {lesson.content && (
            <div className="prose-sm">{renderContent(lesson.content)}</div>
          )}

          {/* Key points */}
          {lesson.keyPoints && lesson.keyPoints.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="size-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                  Key Points
                </span>
              </div>
              <ul className="space-y-2">
                {lesson.keyPoints.map((kp, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <span className="text-violet-400 mt-1 flex-shrink-0">•</span>
                    <span>{renderInline(kp)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested resources */}
          {(() => {
            const visibleRes = (lesson.suggestedResources ?? []).filter(
              (r) => r.status !== "unreachable",
            );
            if (visibleRes.length === 0) return null;
            return (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ExternalLink className="size-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                    Resources
                  </span>
                </div>
                <div className="space-y-1.5">
                  {visibleRes.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                    >
                      <FileText className="size-3 flex-shrink-0" />
                      <span className="group-hover/link:underline">{r.title}</span>
                      {r.type && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-500 rounded">
                          {r.type}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/** Quiz section for a module */
function QuizSection({ questions }: { questions: QuizQuestion[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const toggleReveal = (index: number) => {
    const next = new Set(revealed);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setRevealed(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle className="size-4 text-violet-400" />
        <h4 className="text-sm font-semibold text-violet-300">
          Quiz — {questions.length} question{questions.length !== 1 ? "s" : ""}
        </h4>
      </div>
      {questions.map((q, i) => {
        const isRevealed = revealed.has(i);
        const correctIdx =
          typeof q.correctAnswer === "number" ? q.correctAnswer : -1;
        return (
          <div
            key={q.id || i}
            className="bg-white/3 border border-white/5 rounded-lg p-4"
          >
            <p className="text-sm font-medium text-white mb-3">
              <span className="text-violet-400 mr-1">Q{i + 1}.</span>{" "}
              {q.question}
            </p>

            {/* Options */}
            {q.options && (
              <div className="space-y-1.5 mb-3">
                {q.options.map((opt, oi) => {
                  const isCorrect = isRevealed && oi === correctIdx;
                  return (
                    <div
                      key={oi}
                      className={`flex items-start gap-2 text-sm px-3 py-2 rounded-md transition-colors ${
                        isCorrect
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : "text-slate-400"
                      }`}
                    >
                      <span className="flex-shrink-0 w-5 text-slate-500">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <span>{opt}</span>
                      {isCorrect && (
                        <CheckCircle2 className="size-4 ml-auto flex-shrink-0 text-emerald-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reveal / explanation */}
            {!isRevealed ? (
              <button
                onClick={() => toggleReveal(i)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
              >
                Show answer →
              </button>
            ) : (
              q.explanation && (
                <div className="mt-2 p-3 bg-violet-500/5 border border-violet-500/10 rounded-md">
                  <p className="text-xs text-slate-300">
                    <span className="text-violet-400 font-semibold">
                      Explanation:{" "}
                    </span>
                    {q.explanation}
                  </p>
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Single module accordion */
function ModuleSection({
  module: mod,
  index,
  defaultOpen,
}: {
  module: Module;
  index: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const lessonCount = mod.lessons?.length || 0;
  const quizCount = mod.quiz?.length || 0;
  const duration = mod.durationMinutes || mod.lessons?.reduce((s, l) => s + (l.durationMinutes || 0), 0) || 0;

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-sm">
      {/* Module header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-left"
      >
        {/* Module number badge */}
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
          <span className="text-sm font-bold text-violet-300">{index + 1}</span>
        </div>

        {/* Module info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white">{mod.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen className="size-3" /> {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
            </span>
            {quizCount > 0 && (
              <span className="flex items-center gap-1">
                <HelpCircle className="size-3" /> {quizCount} quiz
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> {duration} min
            </span>
          </div>
        </div>

        {/* Expand indicator */}
        <ChevronDown
          className={`size-5 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Module content — expanded */}
      {open && (
        <div className="border-t border-white/5 px-5 py-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Module description */}
          {mod.description && (
            <p className="text-sm text-slate-400 leading-relaxed italic">
              {mod.description}
            </p>
          )}

          {/* Module objectives */}
          {mod.objectives && mod.objectives.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="size-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">
                  Module Objectives
                </span>
              </div>
              <ul className="space-y-1">
                {mod.objectives.map((obj, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-400"
                  >
                    <CheckCircle2 className="size-3.5 text-violet-500/50 mt-0.5 flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lessons */}
          {mod.lessons && mod.lessons.length > 0 && (
            <div className="space-y-1 -mx-1">
              {mod.lessons.map((lesson, li) => (
                <LessonItem key={lesson.id || li} lesson={lesson} index={li} />
              ))}
            </div>
          )}

          {/* Quiz */}
          {mod.quiz && mod.quiz.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <QuizSection questions={mod.quiz} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────

export default function CourseContent({
  curriculum: c,
  courseId,
  createdAt,
  teachingStyle,
  rawPlan,
  isOwner = false,
}: CourseContentProps) {
  void createdAt;
  const totalLessons = getTotalLessons(c);
  const totalQuizzes = getTotalQuizzes(c);
  const moduleCount = c.modules?.length || 0;
  const totalHours = c.pacing?.totalHours || 0;

  const router = useRouter();
  const plan = normalizePlan(rawPlan);

  const [loadingExports, setLoadingExports] = useState<Record<string, boolean>>({});
  const [historyVersion, setHistoryVersion] = useState(0);
  void loadingExports;

  const recordExport = (format: ExportFormatId) => {
    appendExportEvent(courseId, format);
    setHistoryVersion((v) => v + 1);
  };

  const sanitizeFilename = (title: string) =>
    title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "course";

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (isExportV2ClientEnabled()) {
      try {
        await downloadPdfV2(courseId);
        return;
      } catch (err) {
        console.error("[export v2] failed, using legacy:", err);
      }
    }
    try {
      const pdf = generateCurriculumPDF(c, { teachingStyle });
      pdf.save(`${sanitizeFilename(c.title)}_syllabus.pdf`);
      recordExport("pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const handleExportDocx = async () => {
    try {
      setLoadingExports((p) => ({ ...p, docx: true }));
      const blob = await generateCurriculumDocx(c, { teachingStyle });
      downloadBlob(blob, `${sanitizeFilename(c.title)}.docx`);
      recordExport("word");
    } catch (err) {
      console.error("Word export failed:", err);
    } finally {
      setLoadingExports((p) => ({ ...p, docx: false }));
    }
  };

  const handleExportScorm = async () => {
    try {
      setLoadingExports((p) => ({ ...p, scorm: true }));
      const blob = await generateScormPackage(c, { teachingStyle });
      downloadBlob(blob, `${sanitizeFilename(c.title)}_scorm.zip`);
      recordExport("scorm");
    } catch (err) {
      console.error("SCORM export failed:", err);
    } finally {
      setLoadingExports((p) => ({ ...p, scorm: false }));
    }
  };

  const handleExportNotebookLMAudio = () => {
    try {
      const md = generateNotebookLMMarkdown(c);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      downloadBlob(blob, notebookLMFilename(c));
      recordExport("nlmAudio");
    } catch (err) {
      console.error("NotebookLM audio export failed:", err);
    }
  };

  const [slideModalOpen, setSlideModalOpen] = useState(false);

  const defaultSlideStyle: SlideStyle =
    teachingStyle === "academic"
      ? "academic"
      : teachingStyle === "hands-on"
      ? "executive"
      : "conversational";

  const runSlideExport = (style: SlideStyle) => {
    try {
      const md = generateNotebookLMSlidesMarkdown(c, { style });
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      downloadBlob(blob, notebookLMSlidesFilename(c, style));
      recordExport("nlmSlides");
    } catch (err) {
      console.error("NotebookLM slides export failed:", err);
    }
  };

  const handleExportNotebookLMSlides = () => {
    setSlideModalOpen(true);
  };

  const handleExportNotion = async () => {
    const ok = await copyNotionHtmlToClipboard(c, { teachingStyle });
    if (ok) recordExport("notion");
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(curriculumToMarkdown(c));
      recordExport("markdown");
    } catch (err) {
      console.error("Copy markdown failed:", err);
    }
  };

  const handleShareLink = async () => {
    try {
      const { error } = await supabaseBrowser
        .from("courses")
        .update({ is_public: true })
        .eq("id", courseId);
      if (error) console.error("Failed to make course public:", error);
      const url = generateStudentShareUrl(courseId);
      await navigator.clipboard.writeText(url);
      recordExport("share");
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* ── Navigation bar ──────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="#export-share"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <Download className="size-3" /> Export
            </a>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg transition-colors font-medium"
            >
              <Sparkles className="size-3" /> New Course
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {c.difficulty && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getDifficultyStyle(
                  c.difficulty
                )}`}
              >
                {c.difficulty}
              </span>
            )}
            {c.tags &&
              c.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[10px] bg-white/5 text-slate-400 border border-white/10"
                >
                  {tag}
                </span>
              ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-violet-100 to-violet-200 bg-clip-text text-transparent">
            {c.title}
          </h1>

          {/* Subtitle */}
          {c.subtitle && (
            <p className="text-lg text-violet-200/80 mt-3 max-w-2xl">
              {c.subtitle}
            </p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: "Modules",   value: moduleCount,                icon: BookOpen },
              { label: "Lessons",   value: totalLessons,               icon: FileText },
              { label: "Duration",  value: `${totalHours}h`,           icon: Clock },
              { label: "Quizzes",   value: totalQuizzes,               icon: HelpCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] border border-white/8 rounded-xl"
              >
                <Icon className="size-5 text-violet-400 flex-shrink-0" />
                <div>
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-[11px] text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-12">
        {/* ── Export & Share ──────────────────────────── */}
        <section id="export-share" className="scroll-mt-20">
          <div className="p-5 sm:p-6 bg-gradient-to-br from-violet-500/[0.06] via-white/[0.02] to-indigo-500/[0.06] border border-violet-500/15 rounded-2xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Download className="size-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Export &amp; Share</h2>
                <span className="hidden sm:inline text-[11px] text-slate-500">
                  · 8 formats tier-gated
                </span>
              </div>
            </div>

            {/* Recently-exported chips */}
            {(() => {
              void historyVersion;
              const summary = summarizeExportHistory(courseId);
              if (summary.length === 0) return null;
              const LABELS: Record<ExportFormatId, string> = {
                pdf: "PDF", word: "Word", markdown: "Markdown", notion: "Notion",
                scorm: "SCORM", nlmAudio: "NLM Audio", nlmSlides: "NLM Slides", share: "Share link",
              };
              return (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-3">
                  <span className="font-medium text-slate-200">Recently exported:</span>
                  {summary.map((s) => (
                    <span key={s.format} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                      {LABELS[s.format]}{s.count > 1 && <span className="text-slate-500">×{s.count}</span>}
                    </span>
                  ))}
                </div>
              );
            })()}

            <ExportGrid
              tier={plan.tier}
              onExport={(format: ExportFormat) => {
                switch (format) {
                  case "pdf":       return handleDownloadPDF();
                  case "word":      return handleExportDocx();
                  case "markdown":  return handleCopyMarkdown();
                  case "notion":    return handleExportNotion();
                  case "scorm":     return handleExportScorm();
                  case "nlmAudio":  return handleExportNotebookLMAudio();
                  case "nlmSlides": return handleExportNotebookLMSlides();
                  case "share":     return handleShareLink();
                }
              }}
              onLockedClick={() => router.push("/pricing")}
            />

            <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              PDF &amp; Word for printing · SCORM for LMS upload · NotebookLM Audio for an AI podcast · NotebookLM Slides for a deck · Notion copies formatted · Share generates a public link.
            </p>
          </div>
        </section>

        {isOwner && <QuizResultsPanel courseId={courseId} />}

        {/* ── About + Target Audience ─────────────────── */}
        {(c.description || c.targetAudience) && (
          <section className="grid sm:grid-cols-2 gap-6">
            {c.description && (
              <div className="p-5 bg-white/[0.03] border border-white/8 rounded-xl">
                <h2 className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <GraduationCap className="size-3.5" /> About This Course
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {c.description}
                </p>
              </div>
            )}
            {c.targetAudience && (
              <div className="p-5 bg-white/[0.03] border border-white/8 rounded-xl">
                <h2 className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Users className="size-3.5" /> Who Is This For
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {c.targetAudience}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── Learning Objectives ─────────────────────── */}
        {c.objectives && c.objectives.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="size-5 text-violet-400" />
              Learning Objectives
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {c.objectives.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-violet-300">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{obj}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Prerequisites ───────────────────────────── */}
        {c.prerequisites && c.prerequisites.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-400" />
              Prerequisites
            </h2>
            <div className="flex flex-wrap gap-2">
              {c.prerequisites.map((prereq, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Course Content (Modules) ────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <BookOpen className="size-5 text-violet-400" />
            Course Content
            <span className="text-xs font-normal text-slate-500 ml-1">
              {moduleCount} module{moduleCount !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
            </span>
          </h2>
          <div className="space-y-3">
            {c.modules?.map((mod, i) => (
              <ModuleSection
                key={mod.id || i}
                module={mod}
                index={i}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </section>

        {/* ── Pacing Schedule ─────────────────────────── */}
        {c.pacing && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="size-5 text-violet-400" />
              Pacing Schedule
            </h2>
            <div className="p-5 bg-white/[0.03] border border-white/8 rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-slate-500">Total Hours</div>
                  <div className="text-lg font-bold text-white">
                    {c.pacing.totalHours}h
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Hours/Week</div>
                  <div className="text-lg font-bold text-white">
                    {c.pacing.hoursPerWeek}h
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total Weeks</div>
                  <div className="text-lg font-bold text-white">
                    {c.pacing.totalWeeks}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Style</div>
                  <div className="text-lg font-bold text-white capitalize">
                    {c.pacing.style?.replace("-", " ") || "Self-paced"}
                  </div>
                </div>
              </div>

              {/* Weekly plan */}
              {c.pacing.weeklyPlan && c.pacing.weeklyPlan.length > 0 && (
                <div className="border-t border-white/5 pt-4 mt-4 space-y-2">
                  {c.pacing.weeklyPlan.map((week, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="flex-shrink-0 w-16 text-xs font-semibold text-violet-400">
                        Week {week.week || i + 1}
                      </span>
                      <div className="h-px flex-1 bg-white/5" />
                      <span className="text-slate-400 text-xs">
                        {week.label || `Modules ${week.moduleIds?.join(", ") || "—"}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Footer / CTA ────────────────────────────── */}
        <section className="text-center pt-8 border-t border-white/5">
          <p className="text-xs text-slate-600 mb-4">
            Generated by{" "}
            <a
              href="https://syllabi.online"
              className="text-violet-500 hover:text-violet-400 transition-colors"
            >
              Syllabi
            </a>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-500/10"
          >
            <Sparkles className="size-4" />
            Generate Your Own Course
          </Link>
        </section>
      </main>

      <SlideStyleModal
        open={slideModalOpen}
        defaultStyle={defaultSlideStyle}
        onClose={() => setSlideModalOpen(false)}
        onSelect={(style) => {
          setSlideModalOpen(false);
          runSlideExport(style);
        }}
      />
    </div>
  );
}
