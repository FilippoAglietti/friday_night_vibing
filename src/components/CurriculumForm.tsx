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
import { Sparkles, Loader2, AlertCircle, FileText, Upload, X } from "lucide-react";
import type { DifficultyLevel, Curriculum, CourseStatusResponse } from "@/types/curriculum";

/* ─── Types ──────────────────────────────────────────────── */

export type CourseLength = "mini" | "beginner" | "intermediate" | "advanced";

export interface CurriculumFormData {
  topic: string;
  difficulty: DifficultyLevel;
  courseLength: CourseLength;
  niche: string;
  abstract: string;
  learnerProfile: string;
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
  /** When true, restrict to mini course + beginner/intermediate only */
  isFreeUser?: boolean;
}

/* ─── Constants ──────────────────────────────────────────── */

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "No prior knowledge assumed" },
  { value: "intermediate", label: "Intermediate", desc: "Some foundational skills expected" },
  { value: "advanced", label: "Advanced", desc: "Deep expertise & complex topics" },
];

const COURSE_LENGTH_OPTIONS: { value: CourseLength; label: string; desc: string }[] = [
  { value: "mini", label: "Mini", desc: "~5 lessons · Quick overview" },
  { value: "beginner", label: "Beginner", desc: "8–12 lessons · Solid foundation" },
  { value: "intermediate", label: "Intermediate", desc: "12–18 lessons · In-depth coverage" },
  { value: "advanced", label: "Advanced", desc: "20+ lessons · Comprehensive deep dive" },
];

const INITIAL_FORM: CurriculumFormData = {
  topic: "",
  difficulty: "beginner",
  courseLength: "beginner",
  niche: "",
  abstract: "",
  learnerProfile: "",
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

/* ─── Component ──────────────────────────────────────────── */

export default function CurriculumForm({
  onGenerated,
  onLoadingChange,
  onLimitReached,
  onSubmitAttempt,
  isFreeUser = true,
}: CurriculumFormProps) {
  const [form, setForm] = useState<CurriculumFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfExtracting, setPdfExtracting] = useState(false);

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
            courseLength: isFreeUser ? "mini" : form.courseLength,
            niche: form.niche.trim() || undefined,
            abstract: form.abstract.trim() || undefined,
            learnerProfile: form.learnerProfile.trim() || undefined,
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
            <Label htmlFor="curriculum-topic" className="text-sm font-medium">
              Course Topic <span className="text-destructive">*</span>
            </Label>
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
          </div>

          {/* ── Two-column row: Audience + Length ─────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Target Audience */}
            <div className="space-y-1.5">
              <Label htmlFor="curriculum-difficulty" className="text-sm font-medium">
                Target Audience
              </Label>
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
            </div>

            {/* Course Length */}
            <div className="space-y-1.5">
              <Label htmlFor="curriculum-length" className="text-sm font-medium">
                Course Length
                {isFreeUser && (
                  <span className="ml-1.5 text-[10px] font-normal text-violet-400">(Mini only on free plan)</span>
                )}
              </Label>
              <Select
                value={isFreeUser ? "mini" : form.courseLength}
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
                    .filter((opt) => !isFreeUser || opt.value === "mini")
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
            </div>
          </div>

          {/* ── Industry / Niche ──────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="curriculum-niche" className="text-sm font-medium">
              Industry / Niche{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="curriculum-niche"
              type="text"
              placeholder="e.g. Health & Wellness"
              value={form.niche}
              onChange={(e) => updateField("niche", e.target.value)}
              disabled={isSubmitting}
              className="h-10"
            />
          </div>

          {/* ── About You — Learner Profile ────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="course-learner-profile" className="text-sm font-medium">
              About You{" "}
              <span className="text-muted-foreground font-normal">(optional — helps personalize the course)</span>
            </Label>
            <textarea
              id="course-learner-profile"
              placeholder="e.g. I'm a marketing manager with 5 years of experience looking to transition into data science…"
              value={form.learnerProfile}
              onChange={(e) => updateField("learnerProfile", e.target.value)}
              disabled={isSubmitting}
              rows={2}
              maxLength={500}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Describe your background, goals, or learning style so we can tailor the course to you.
            </p>
          </div>

          {/* ── Abstract / PDF Upload ─────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="curriculum-abstract" className="text-sm font-medium">
              Course Abstract{" "}
              <span className="text-muted-foreground font-normal">(optional — paste text or upload PDF)</span>
            </Label>
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
          </div>

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

          {/* ── Submit Button ─────────────────────────────── */}
          <Button
            id="curriculum-submit"
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-base font-semibold text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
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

          <p className="text-center text-xs text-muted-foreground">
            {isSubmitting ? "Don't worry, you can leave this page and come back." : "Takes about 15–30 seconds · Your first generation is free"}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
