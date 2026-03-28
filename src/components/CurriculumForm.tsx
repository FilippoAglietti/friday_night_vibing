"use client";

import { useState, useCallback } from "react";
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
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import type { DifficultyLevel, Curriculum } from "@/types/curriculum";

/* ─── Types ──────────────────────────────────────────────── */

export type CourseLength = "mini" | "standard" | "bootcamp";

export interface CurriculumFormData {
  topic: string;
  difficulty: DifficultyLevel;
  courseLength: CourseLength;
  niche: string;
}

export interface CurriculumFormProps {
  /** Called with the generated curriculum on success */
  onGenerated?: (curriculum: Curriculum) => void;
  /** Called when generation starts */
  onLoadingChange?: (loading: boolean) => void;
  /** Called when the user has hit their free generation limit (403) */
  onLimitReached?: () => void;
}

/* ─── Constants ──────────────────────────────────────────── */

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "No prior knowledge assumed" },
  { value: "intermediate", label: "Intermediate", desc: "Some foundational skills expected" },
  { value: "advanced", label: "Advanced", desc: "Deep expertise & complex topics" },
];

const COURSE_LENGTH_OPTIONS: { value: CourseLength; label: string; desc: string }[] = [
  { value: "mini", label: "Mini-Course", desc: "~5 lessons · Quick win" },
  { value: "standard", label: "Standard", desc: "10–15 lessons · Complete coverage" },
  { value: "bootcamp", label: "Bootcamp", desc: "20+ lessons · Deep dive" },
];

const INITIAL_FORM: CurriculumFormData = {
  topic: "",
  difficulty: "beginner",
  courseLength: "standard",
  niche: "",
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
}: CurriculumFormProps) {
  const [form, setForm] = useState<CurriculumFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  /* ── Submit ────────────────────────────────────────────── */

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setApiError(null);

      // Mark all fields as touched
      setTouched({ topic: true, difficulty: true, courseLength: true, niche: true });

      const validationErrors = validate(form);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) return;

      setIsSubmitting(true);
      onLoadingChange?.(true);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: form.topic.trim(),
            difficulty: form.difficulty,
            courseLength: form.courseLength,
            niche: form.niche.trim() || undefined,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          if (res.status === 403) {
            // Generation limit reached — show paywall
            onLimitReached?.();
            return;
          }
          throw new Error(
            body?.error || `Generation failed (${res.status})`
          );
        }

        const { data } = await res.json();
        onGenerated?.(data);
      } catch (err) {
        setApiError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      } finally {
        setIsSubmitting(false);
        onLoadingChange?.(false);
      }
    },
    [form, onGenerated, onLoadingChange, onLimitReached]
  );

  /* ── Render ────────────────────────────────────────────── */

  const topicError = touched.topic ? errors.topic : undefined;

  return (
    <Card className="w-full max-w-xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-violet-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="size-5 text-violet-500" />
          Generate Curriculum
        </CardTitle>
        <CardDescription>
          Describe your course and we&apos;ll build the full curriculum — modules,
          lessons, quizzes, and pacing — in seconds.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

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
                  {DIFFICULTY_OPTIONS.map((opt) => (
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
              </Label>
              <Select
                value={form.courseLength}
                onValueChange={(val) => updateField("courseLength", val as CourseLength)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="curriculum-length"
                  className="h-10 w-full"
                >
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_LENGTH_OPTIONS.map((opt) => (
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

          {/* ── API Error ─────────────────────────────────── */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{apiError}</span>
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
                Generating curriculum…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Generate Curriculum
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Takes about 15–30 seconds · Your first generation is free
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
