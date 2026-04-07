"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Loader2, AlertCircle, FileText, Upload, X, Info, ChevronDown, ChevronUp, Eye } from "lucide-react";
import type {
  DifficultyLevel,
  Curriculum,
  CourseStatusResponse,
  TeachingStyle,
  OutputStructure,
  CourseLanguage,
} from "@/types/curriculum";

/* ─── Types ──────────────────────────────────────────────── */

export type CourseLength = "crash" | "short" | "full" | "masterclass";

export interface CurriculumFormData {
  topic: string;
  difficulty: DifficultyLevel;
  courseLength: CourseLength;
  niche: string;
  abstract: string;
  learnerProfile: string;
  language: CourseLanguage;
  includeQuizzes: boolean;
  teachingStyle: TeachingStyle;
  outputStructure: OutputStructure;
}

export interface CurriculumFormProps {
  /** Called with the generated curriculum on success */
  onGenerated?: (curriculum: Curriculum) => void;
  /** Called when generation starts */
  onLoadingChange?: (loading: boolean) => void;
  /** Called when the user hits the free-tier generation limit */
  onLimitReached?: () => void;
  /** Called before submit — return false to block (e.g. for auth gate) */
  onSubmitAttempt?: () => boolean;
  /** Optional initial form values to pre-fill the form (for templates, duplicates, etc.) */
  initialValues?: Partial<CurriculumFormData>;
  /** When true, restrict to mini course + beginner/intermediate only */
  isFreeUser?: boolean;
}

/* ─── Constants ──────────────────────────────────────────── */

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; desc: string; tooltip: string }[] = [
  { value: "beginner", label: "Beginner", desc: "No prior knowledge assumed", tooltip: "Best for intro courses, onboarding content, or audiences new to the subject. The AI will explain every concept from scratch with real-world examples." },
  { value: "intermediate", label: "Intermediate", desc: "Some foundational skills expected", tooltip: "Ideal for students with some background knowledge. Covers advanced techniques and deeper applications without excessive repetition of basics." },
  { value: "advanced", label: "Advanced", desc: "Deep expertise & complex topics", tooltip: "For expert-level learners tackling cutting-edge concepts and nuanced problems. Assumes strong foundational knowledge and high self-sufficiency." },
];

const COURSE_LENGTH_OPTIONS: { value: CourseLength; label: string; desc: string; info: string; tooltip: string }[] = [
  { value: "crash", label: "Crash", desc: "~5 lessons · 1-2 modules", info: "Perfect for a quick overview or lead magnet. Covers one key outcome in a focused, bite-sized format.", tooltip: "Quick introduction or promotional course. Best for lead magnets, webinars, or teasers to larger programs." },
  { value: "short", label: "Short", desc: "8–12 lessons · 3-4 modules", info: "A solid foundation course. Great for teaching a specific skill with room to explore subtopics.", tooltip: "Comprehensive single-skill course. Ideal for bestseller-level content that teaches one topic in depth." },
  { value: "full", label: "Full", desc: "12–18 lessons · 4-6 modules", info: "In-depth coverage balancing breadth and depth. Ideal for flagship courses your students will pay for.", tooltip: "Full curriculum course with multiple topics and applications. Perfect for flagship products with premium pricing." },
  { value: "masterclass", label: "Masterclass", desc: "20+ lessons · 6-10 modules", info: "Comprehensive deep dive from foundation to mastery. Best for premium, high-ticket courses.", tooltip: "Premium, in-depth program from fundamentals to advanced mastery. Best for high-ticket courses and exclusive programs." },
];

const LANGUAGE_OPTIONS: { value: CourseLanguage; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "pt", label: "Português", flag: "🇧🇷" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "nl", label: "Nederlands", flag: "🇳🇱" },
  { value: "pl", label: "Polski", flag: "🇵🇱" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
  { value: "ko", label: "한국어", flag: "🇰🇷" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
  { value: "sv", label: "Svenska", flag: "🇸🇪" },
];

const TEACHING_STYLE_OPTIONS: { value: TeachingStyle; label: string; desc: string; tooltip: string }[] = [
  { value: "conversational", label: "Conversational", desc: "Friendly, approachable tone", tooltip: "Uses casual language and relatable examples. Great for making complex topics feel accessible and approachable." },
  { value: "academic", label: "Academic", desc: "Formal, research-backed style", tooltip: "Rigorous, evidence-based approach with citations and formal structure. Best for credibility and professional audiences." },
  { value: "hands-on", label: "Hands-on", desc: "Project-based, learn by doing", tooltip: "Focuses on practical exercises and real projects. Perfect for skill-building where students learn through direct application." },
  { value: "storytelling", label: "Storytelling", desc: "Narrative-driven, engaging examples", tooltip: "Uses case studies, anecdotes, and narratives to illustrate concepts. Excellent for engagement and memorable learning." },
];

const OUTPUT_STRUCTURE_OPTIONS: { value: OutputStructure; label: string; desc: string; tooltip: string }[] = [
  { value: "modules", label: "Modules & Lessons", desc: "Classic course layout", tooltip: "Traditional course structure with modules containing multiple lessons. Flexible pacing, great for self-paced learning." },
  { value: "workshop", label: "Workshop", desc: "Session-based, interactive", tooltip: "Organized as interactive sessions with live components. Best for instructor-led or cohort-based experiences." },
  { value: "bootcamp", label: "Bootcamp", desc: "Day-by-day, intensive", tooltip: "Structured as daily intensive sessions. Perfect for accelerated learning programs and immersive experiences." },
];

const INITIAL_FORM: CurriculumFormData = {
  topic: "",
  difficulty: "beginner",
  courseLength: "short",
  niche: "",
  abstract: "",
  learnerProfile: "",
  language: "en",
  includeQuizzes: true,
  teachingStyle: "conversational",
  outputStructure: "modules",
};

/* ─── Validation ─────────────────────────────────────────── */

interface FormErrors {
  topic?: string;
}

function validate(data: CurriculumFormData): FormErrors {
  const errors: FormErrors = {};
  const trimmed = data.topic.trim();
  if (!trimmed) {
    errors.topic = "A course topic is required";
  } else if (trimmed.length < 3) {
    errors.topic = "Topic must be at least 3 characters";
  }
  return errors;
}


/* ─── InfoToggle — clickable ⓘ icon placed next to labels ────────────── */

function InfoToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`text-muted-foreground hover:text-violet-400 transition-colors ${open ? "text-violet-400" : ""}`}
      aria-label="Toggle field info"
    >
      <Info className="size-3.5" />
    </button>
  );
}

/* ─── InfoPanel — animated reveal text, shown below field when toggled ── */

function InfoPanel({ tooltip, open }: { tooltip: string | undefined; open: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {open && tooltip && (
        <motion.p
          key={tooltip}
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          transition={{ duration: 0.15 }}
          className="flex items-start gap-1.5 mt-1.5 text-[11px] text-muted-foreground leading-relaxed"
        >
          <Info className="size-3 shrink-0 mt-0.5 text-violet-400/60" />
          <span>{tooltip}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ─── Component ──────────────────────────────────────────── */

export default function CurriculumForm({
  onGenerated,
  onLoadingChange,
  onLimitReached,
  onSubmitAttempt,
  initialValues,
  isFreeUser = true,
}: CurriculumFormProps) {
  const [form, setForm] = useState<CurriculumFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // Sync form with initialValues when they change
  useEffect(() => {
    if (initialValues) {
      setForm((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [lengthInfoOpen, setLengthInfoOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ⓘ info toggle state for each field
  const [infoOpen, setInfoOpen] = useState<Record<string, boolean>>({});
  const toggleInfo = useCallback((field: string) => {
    setInfoOpen((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Async generation state
  const [courseId, setCourseId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<"pending" | "generating" | "ready" | "failed" | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Field handlers ────────────────────────────────────── */

  const updateField = useCallback(
    <K extends keyof CurriculumFormData>(key: K, value: CurriculumFormData[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        // Re-validate on change if field was already touched
        if (touched[key]) {
          setErrors(validate(next));
        }
        return next;
      });
      setApiError(null);
    },
    [touched]
  );

  const handleBlur = useCallback(
    (field: keyof CurriculumFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors(validate(form));
    },
    [form]
  );

  /* ── PDF Upload ────────────────────────────────────────── */

  const handlePdfUpload = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setApiError("Please upload a PDF file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setApiError("PDF must be under 10 MB.");
        return;
      }

      setPdfFile(file);
      setPdfExtracting(true);
      setApiError(null);

      try {
        // Load pdf.js from CDN for client-side PDF text extraction
        const pdfjsLib = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs" as string);
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const textParts: string[] = [];
        const maxPages = Math.min(pdf.numPages, 20); // limit to 20 pages

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((item: any) => item.str)
            .join(" ");
          textParts.push(pageText);
        }

        const text = textParts
          .join("\n\n")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 4000);

        updateField("abstract", text);
      } catch (err) {
        console.error("PDF extraction error:", err);
        setApiError("Failed to extract text from PDF. Try pasting the text directly.");
        setPdfFile(null);
      } finally {
        setPdfExtracting(false);
      }
    },
    [updateField]
  );

  const removePdf = useCallback(() => {
    setPdfFile(null);
    updateField("abstract", "");
  }, [updateField]);

  /* ── Polling logic for async generation ───────────────────── */

  /**
   * Polls the course status endpoint to track generation progress.
   * Called every 3 seconds until the course reaches a final state (ready/failed).
   */
  const pollGenerationStatus = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/courses/${id}/status`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.error || `Status check failed (${res.status})`
          );
        }

        const data: CourseStatusResponse = await res.json();
        setGenerationStatus(data.status);
        setPollError(null);

        // If the course is ready, call the callback with the curriculum
        if (data.status === "ready" && data.curriculum) {
          // Clear the polling interval
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          onGenerated?.(data.curriculum);
          setIsSubmitting(false);
          onLoadingChange?.(false);
          // Reset form and state
          setCourseId(null);
          setGenerationStatus(null);
        }

        // If the course generation failed, show the error
        if (data.status === "failed") {
          // Clear the polling interval
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setApiError(data.error_message || "Generation failed. Please try again.");
          setIsSubmitting(false);
          onLoadingChange?.(false);
          setCourseId(null);
          setGenerationStatus(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to check generation status";
        setPollError(message);
        console.error("[CurriculumForm] Polling error:", message);
      }
    },
    [onGenerated, onLoadingChange]
  );

  /**
   * Cleanup effect: Clear the polling interval when the component unmounts
   * or when the form is reset.
   */
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  /**
   * Start polling when we have a courseId and haven't reached a final state yet.
   */
  useEffect(() => {
    if (courseId && generationStatus && generationStatus !== "ready" && generationStatus !== "failed") {
      // Initial poll immediately
      pollGenerationStatus(courseId);

      // Set up polling interval (every 3 seconds)
      pollIntervalRef.current = setInterval(() => {
        pollGenerationStatus(courseId);
      }, 3000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [courseId, generationStatus, pollGenerationStatus]);

  /* ── Submit ────────────────────────────────────────────── */

  /**
   * Handles form submission for async course generation.
   * Sends the request to POST /api/generate and gets back a courseId.
   * Then starts polling GET /api/courses/[id]/status until generation completes.
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Auth gate — if onSubmitAttempt returns false, block submission
      if (onSubmitAttempt && !onSubmitAttempt()) return;

      setApiError(null);
      setPollError(null);

      // Mark all fields as touched
      setTouched({ topic: true, difficulty: true, courseLength: true, niche: true });

      const validationErrors = validate(form);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) return;

      setIsSubmitting(true);
      onLoadingChange?.(true);

      try {
        // Step 1: Send generation request and get courseId back
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: form.topic.trim(),
            difficulty: isFreeUser && form.difficulty === "advanced" ? "intermediate" : form.difficulty,
            courseLength: isFreeUser ? "crash" : form.courseLength,
            niche: form.niche.trim() || undefined,
            abstract: form.abstract.trim() || undefined,
            learnerProfile: form.learnerProfile.trim() || undefined,
            language: form.language,
            includeQuizzes: form.includeQuizzes,
            teachingStyle: form.teachingStyle,
            outputStructure: form.outputStructure,
            hasAttachments: !!pdfFile,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error || `Generation failed (${res.status})`
          );
        }

        const { courseId: newCourseId } = await res.json();

        // Step 2: Store courseId and start polling
        setCourseId(newCourseId);
        setGenerationStatus("pending");
      } catch (err) {
        setApiError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
        setIsSubmitting(false);
        onLoadingChange?.(false);
      }
    },
    [form, onLoadingChange, onSubmitAttempt, isFreeUser]
  );

  /* ── Render ────────────────────────────────────────────── */

  const topicError = touched.topic ? errors.topic : undefined;

  return (
    <Card className="w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-violet-500/5">
      <CardHeader className="pb-1 px-4 md:px-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold">
          <Sparkles className="size-5 text-violet-500" />
          Generate Course
        </CardTitle>
        <CardDescription>
          Describe your course and we&apos;ll build it in seconds.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 md:px-6">
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4" noValidate>

          {/* ── Course Topic ──────────────────────────────── */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="curriculum-topic" className="text-sm font-medium">
                Course Topic <span className="text-destructive">*</span>
              </Label>
              <InfoToggle open={!!infoOpen.topic} onToggle={() => toggleInfo("topic")} />
            </div>
            <Input
              id="curriculum-topic"
              type="text"
              placeholder="e.g. Photography for Instagram"
              value={form.topic}
              onChange={(e) => updateField("topic", e.target.value)}
              onBlur={() => handleBlur("topic")}
              aria-invalid={!!topicError}
              aria-describedby={topicError ? "topic-error" : undefined}
              disabled={isSubmitting}
              className="h-10"
            />
            <AnimatePresence>
              {topicError && (
                <motion.p
                  id="topic-error"
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 text-xs text-destructive"
                >
                  <AlertCircle className="size-3 shrink-0" />
                  {topicError}
                </motion.p>
              )}
            </AnimatePresence>
            <InfoPanel open={!!infoOpen.topic && !topicError} tooltip="Be specific — 'Photography for Instagram Reels' generates a better course than just 'Photography'. Include your angle or audience for best results." />
          </div>

          {/* ── Two-column row: Audience + Length ─────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Target Audience */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="curriculum-difficulty" className="text-sm font-medium">
                  Target Audience
                </Label>
                <InfoToggle open={!!infoOpen.difficulty} onToggle={() => toggleInfo("difficulty")} />
              </div>
              <Select
                value={form.difficulty}
                onValueChange={(val) => updateField("difficulty", val as DifficultyLevel)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="curriculum-difficulty"
                  className="h-10 w-full"
                >
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS
                    .filter((opt) => !isFreeUser || opt.value !== "advanced")
                    .map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex flex-col">
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {opt.desc}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InfoPanel open={!!infoOpen.difficulty} tooltip={DIFFICULTY_OPTIONS.find((o) => o.value === form.difficulty)?.tooltip} />
            </div>

            {/* Course Length */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="curriculum-length" className="text-sm font-medium">
                  Course Length
                  {isFreeUser && (
                    <span className="ml-1.5 text-[10px] font-normal text-violet-400">(Crash only on free plan)</span>
                  )}
                </Label>
                <button
                  type="button"
                  onClick={() => setLengthInfoOpen((prev) => !prev)}
                  className="text-muted-foreground hover:text-violet-400 transition-colors"
                  aria-label="Course length info"
                >
                  <Info className="size-3.5" />
                </button>
              </div>

              {/* Info panel */}
              <AnimatePresence>
                {lengthInfoOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 space-y-2 mb-1.5">
                      {COURSE_LENGTH_OPTIONS.map((opt) => (
                        <div key={opt.value} className="flex gap-2">
                          <span className="text-xs font-semibold text-violet-400 min-w-[80px] shrink-0">{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.info}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Select
                value={isFreeUser ? "crash" : form.courseLength}
                onValueChange={(val) => updateField("courseLength", val as CourseLength)}
                disabled={isSubmitting || isFreeUser}
              >
                <SelectTrigger
                  id="curriculum-length"
                  className="h-10 w-full"
                >
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_LENGTH_OPTIONS
                    .filter((opt) => !isFreeUser || opt.value === "crash")
                    .map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex flex-col">
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {opt.desc}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InfoPanel open={lengthInfoOpen} tooltip={COURSE_LENGTH_OPTIONS.find((o) => o.value === (isFreeUser ? "crash" : form.courseLength))?.tooltip} />
            </div>
          </div>

          {/* ── Industry / Niche ──────────────────────────── */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="curriculum-niche" className="text-sm font-medium">
                Industry / Niche{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <InfoToggle open={!!infoOpen.niche} onToggle={() => toggleInfo("niche")} />
            </div>
            <Input
              id="curriculum-niche"
              type="text"
              placeholder="e.g. Health & Wellness"
              value={form.niche}
              onChange={(e) => updateField("niche", e.target.value)}
              disabled={isSubmitting}
              className="h-10"
            />
            <InfoPanel open={!!infoOpen.niche} tooltip="Adding a niche helps the AI use industry-specific language, examples, and frameworks your audience already knows." />
          </div>

          {/* ── Advanced Options Toggle ────────────────────── */}
          <button
            type="button"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            className="flex items-center gap-2 w-full text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors py-1"
          >
            {advancedOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            Advanced Options
            {!advancedOpen && (
              <span className="text-[10px] text-muted-foreground font-normal ml-1">
                Language, style, quizzes & more
              </span>
            )}
          </button>

          <AnimatePresence>
            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden space-y-3 md:space-y-4"
              >
                {/* ── Language + Teaching Style row ──────────── */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Language */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="curriculum-language" className="text-sm font-medium">
                        Language
                      </Label>
                      <InfoToggle open={!!infoOpen.language} onToggle={() => toggleInfo("language")} />
                    </div>
                    <Select
                      value={form.language}
                      onValueChange={(val) => updateField("language", val as CourseLanguage)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="curriculum-language" className="h-10 w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              <span>{opt.flag}</span>
                              <span className="font-medium">{opt.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <InfoPanel open={!!infoOpen.language} tooltip="Your entire course — titles, lessons, quizzes, and resources — will be generated natively in this language, not translated." />
                  </div>

                  {/* Teaching Style */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="curriculum-style" className="text-sm font-medium">
                        Teaching Style
                      </Label>
                      <InfoToggle open={!!infoOpen.style} onToggle={() => toggleInfo("style")} />
                    </div>
                    <Select
                      value={form.teachingStyle}
                      onValueChange={(val) => updateField("teachingStyle", val as TeachingStyle)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="curriculum-style" className="h-10 w-full">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEACHING_STYLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex flex-col">
                              <span className="font-medium">{opt.label}</span>
                              <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <InfoPanel open={!!infoOpen.style} tooltip={TEACHING_STYLE_OPTIONS.find((o) => o.value === form.teachingStyle)?.tooltip} />
                  </div>
                </div>

                {/* ── Output Structure + Quizzes row ────────── */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Output Structure */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="curriculum-structure" className="text-sm font-medium">
                        Output Structure
                      </Label>
                      <InfoToggle open={!!infoOpen.structure} onToggle={() => toggleInfo("structure")} />
                    </div>
                    <Select
                      value={form.outputStructure}
                      onValueChange={(val) => updateField("outputStructure", val as OutputStructure)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="curriculum-structure" className="h-10 w-full">
                        <SelectValue placeholder="Select structure" />
                      </SelectTrigger>
                      <SelectContent>
                        {OUTPUT_STRUCTURE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex flex-col">
                              <span className="font-medium">{opt.label}</span>
                              <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <InfoPanel open={!!infoOpen.structure} tooltip={OUTPUT_STRUCTURE_OPTIONS.find((o) => o.value === form.outputStructure)?.tooltip} />
                  </div>

                  {/* Include Quizzes Toggle */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-sm font-medium">Include Quizzes</Label>
                      <InfoToggle open={!!infoOpen.quizzes} onToggle={() => toggleInfo("quizzes")} />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField("includeQuizzes", !form.includeQuizzes)}
                      disabled={isSubmitting}
                      className={`flex items-center gap-3 h-10 w-full rounded-md border px-3 transition-colors ${
                        form.includeQuizzes
                          ? "border-violet-500/50 bg-violet-500/10 text-foreground"
                          : "border-input bg-background text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`relative w-9 h-5 rounded-full transition-colors ${
                          form.includeQuizzes ? "bg-violet-500" : "bg-muted"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                            form.includeQuizzes ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                      <span className="text-sm">
                        {form.includeQuizzes ? "Quizzes included" : "No quizzes"}
                      </span>
                    </button>
                    <InfoPanel open={!!infoOpen.quizzes} tooltip={form.includeQuizzes ? "Each module will include multiple-choice and short-answer questions to reinforce learning and boost completion rates." : "No quizzes will be generated. You can always add them later from the course editor."} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Target Audience — Who is this course for? ──── */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="course-learner-profile" className="text-sm font-medium">
                Who is this course for?{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <InfoToggle open={!!infoOpen.learner} onToggle={() => toggleInfo("learner")} />
            </div>
            <textarea
              id="course-learner-profile"
              placeholder="e.g. Medical residents in cardiology with basic ECG knowledge, or Marketing managers transitioning into data science…"
              value={form.learnerProfile}
              onChange={(e) => updateField("learnerProfile", e.target.value)}
              disabled={isSubmitting}
              rows={2}
              maxLength={500}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <InfoPanel open={!!infoOpen.learner} tooltip="Describe who will take this course — their background, experience level, and goals. The more context you give, the more tailored and relevant the course content will be." />
          </div>

          {/* ── Abstract / PDF Upload ─────────────────────── */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="curriculum-abstract" className="text-sm font-medium">
                Course Abstract{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <InfoToggle open={!!infoOpen.abstract} onToggle={() => toggleInfo("abstract")} />
            </div>
            <textarea
              id="curriculum-abstract"
              placeholder="Paste a course description, abstract, or outline to guide the course generation…"
              value={form.abstract}
              onChange={(e) => updateField("abstract", e.target.value)}
              disabled={isSubmitting || pdfExtracting}
              rows={2}
              maxLength={4000}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[72px]"
            />

            {/* PDF upload zone */}
            <div className="flex items-center gap-2 mt-2">
              {!pdfFile ? (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-dashed border-border hover:border-primary/40">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload PDF</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    disabled={isSubmitting || pdfExtracting}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-2 text-xs bg-primary/5 border border-primary/20 rounded-md px-3 py-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="text-foreground truncate max-w-[180px]">{pdfFile.name}</span>
                  {pdfExtracting ? (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  ) : (
                    <button
                      type="button"
                      onClick={removePdf}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
              <span className="text-[11px] text-muted-foreground">
                {form.abstract.length > 0 && `${form.abstract.length}/4000 chars`}
              </span>
            </div>
            <InfoPanel open={!!infoOpen.abstract} tooltip="Paste a syllabus, outline, or course description and the AI will use it as a blueprint. Upload a PDF to auto-extract the text." />
          </div>

          {/* ── Generation Preview ─────────────────────────── */}
          <AnimatePresence>
            {previewOpen && form.topic.trim().length >= 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-indigo-500/3 to-violet-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5 text-violet-400">
                      <Eye className="size-3.5" />
                      Generation Preview
                    </h4>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Topic */}
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold min-w-[70px] mt-0.5">Topic</span>
                      <span className="text-sm font-medium">{form.topic.trim()}</span>
                    </div>

                    {/* Config summary */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {DIFFICULTY_OPTIONS.find((o) => o.value === form.difficulty)?.label || form.difficulty}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {COURSE_LENGTH_OPTIONS.find((o) => o.value === (isFreeUser ? "crash" : form.courseLength))?.label || form.courseLength}
                        {" · "}
                        {COURSE_LENGTH_OPTIONS.find((o) => o.value === (isFreeUser ? "crash" : form.courseLength))?.desc || ""}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {TEACHING_STYLE_OPTIONS.find((o) => o.value === form.teachingStyle)?.label || form.teachingStyle}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {OUTPUT_STRUCTURE_OPTIONS.find((o) => o.value === form.outputStructure)?.label || form.outputStructure}
                      </span>
                      {form.includeQuizzes && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Quizzes included
                        </span>
                      )}
                      {form.language !== "en" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {LANGUAGE_OPTIONS.find((o) => o.value === form.language)?.flag}{" "}
                          {LANGUAGE_OPTIONS.find((o) => o.value === form.language)?.label}
                        </span>
                      )}
                    </div>

                    {/* Estimated output */}
                    <div className="rounded-lg bg-muted/10 border border-border/20 p-3 space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Estimated output</p>
                      {(() => {
                        const len = isFreeUser ? "crash" : form.courseLength;
                        const estimates: Record<string, { modules: string; lessons: string; hours: string }> = {
                          crash: { modules: "1–2", lessons: "~5", hours: "1–2" },
                          short: { modules: "3–4", lessons: "8–12", hours: "4–8" },
                          full: { modules: "4–6", lessons: "12–18", hours: "10–20" },
                          masterclass: { modules: "6–10", lessons: "20+", hours: "20–40" },
                        };
                        const est = estimates[len] || estimates.short;
                        return (
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>{est.modules} modules</span>
                            <span>{est.lessons} lessons</span>
                            <span>{est.hours} hours</span>
                          </div>
                        );
                      })()}
                    </div>

                    {form.niche && (
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold min-w-[70px] mt-0.5">Niche</span>
                        <span className="text-xs text-muted-foreground">{form.niche}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── API Error ─────────────────────────────────── */}
          <AnimatePresence>
            {(apiError || pollError) && (
              <motion.div
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{apiError || pollError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Action Buttons ─────────────────────────────── */}
          <div className="flex gap-2">
            {!isSubmitting && form.topic.trim().length >= 3 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen((prev) => !prev)}
                className="h-11 rounded-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 transition-all"
              >
                <Eye className="mr-2 size-4" />
                {previewOpen ? "Hide" : "Preview"}
              </Button>
            )}
            <Button
              id="curriculum-submit"
              type="submit"
              disabled={isSubmitting}
              className="h-11 flex-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-base font-semibold text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {generationStatus === "pending" && "Starting generation…"}
                  {generationStatus === "generating" && "Generating course…"}
                  {!generationStatus && "Submitting…"}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generate Course
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {isSubmitting ? "Don't worry, you can leave this page and come back." : "Takes about 15–30 seconds · Your first generation is free"}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
