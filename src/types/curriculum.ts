// ─────────────────────────────────────────────────────────
// Syllabi.ai — Shared Curriculum Types (Frontend ↔ Backend)
// ─────────────────────────────────────────────────────────
// This file is the CONTRACT between the frontend (page.tsx / components/)
// and the backend (lib/ / app/api/). Do NOT change these interfaces
// without coordinating with the other side.
// ─────────────────────────────────────────────────────────

// ── Enums & Literals ──────────────────────────────────────

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

/** Alias used by the API and prompt engine (same as DifficultyLevel) */
export type AudienceLevel = DifficultyLevel;

export type LessonFormat =
  | "video"
  | "reading"
  | "interactive"
  | "discussion"
  | "project"
  | "live-session";

export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "short-answer"
  | "fill-in-the-blank";

export type ResourceType =
  | "article"
  | "video"
  | "podcast"
  | "book"
  | "tool"
  | "template"
  | "cheatsheet";

export type PacingStyle =
  | "self-paced"
  | "cohort"
  | "instructor-led"
  | "blended";

/**
 * Desired course length sent from the generation form.
 *   crash      → ~5 lessons (1-2 modules)
 *   short      → 8-12 lessons (3-4 modules)
 *   full       → 12-18 lessons (4-6 modules)
 *   masterclass → 20+ lessons (6-10 modules)
 */
export type CourseLength = "crash" | "short" | "full" | "masterclass";

/** Teaching style / tone for the generated course */
export type TeachingStyle = "academic" | "conversational" | "hands-on" | "storytelling";

/** Output structure — how the course is organized */
export type OutputStructure = "modules" | "workshop" | "bootcamp";

/**
 * Controls how deep the generation pipeline goes:
 *   structure_only → skeleton only (syllabus/outline, no lesson content)
 *   full_content   → skeleton + per-module content fill (default)
 */
export type ContentDepth = "structure_only" | "full_content";

/** Supported languages for course generation */
export type CourseLanguage =
  | "en" | "es" | "pt" | "fr" | "de" | "it"
  | "nl" | "pl" | "ja" | "ko" | "zh" | "ar"
  | "hi" | "ru" | "tr" | "sv";

// ── Core Entities ─────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  /** Available options for multiple-choice / true-false */
  options?: string[];
  /** Index of the correct option, or the correct string for short-answer */
  correctAnswer: number | string;
  /** Why this answer is correct — shown after submission */
  explanation?: string;
  /** Points awarded for a correct answer (default: 1) */
  points?: number;
}

export interface BonusResource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  /** Brief description of what the learner will get */
  description?: string;
  /** Estimated consumption time in minutes */
  durationMinutes?: number;
  /** Is this resource free or paid? */
  isFree?: boolean;
}

/** Lightweight resource suggestion attached to a lesson */
export interface SuggestedResource {
  title: string;
  url: string;
  type: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  format: LessonFormat;
  /** Estimated duration in minutes */
  durationMinutes: number;
  /** Learning objectives for this specific lesson */
  objectives?: string[];
  /** 3-5 key talking points covering core concepts and practical tips */
  keyPoints?: string[];
  /** 1-3 suggested external resources with real URLs */
  suggestedResources?: SuggestedResource[];
  /** Content body — markdown string rendered by the frontend */
  content?: string;
  /** Optional quiz attached to this lesson */
  quiz?: QuizQuestion[];
  /** Supplemental resources for deeper learning */
  resources?: BonusResource[];
  /** Order within the parent module (0-indexed) */
  order: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  /** Learning objectives for the entire module */
  objectives: string[];
  /** Ordered list of lessons inside this module */
  lessons: Lesson[];
  /** Optional module-level quiz (e.g. end-of-module assessment) */
  quiz?: QuizQuestion[];
  /** Order within the parent curriculum (0-indexed) */
  order: number;
  /** Estimated total duration in minutes (sum of lessons) */
  durationMinutes: number;
}

export interface PacingSchedule {
  /** How the course is delivered */
  style: PacingStyle;
  /** Total estimated hours to complete the full curriculum */
  totalHours: number;
  /** Recommended hours per week */
  hoursPerWeek: number;
  /** Suggested number of weeks to complete */
  totalWeeks: number;
  /** Optional per-week breakdown mapping week number → module/lesson IDs */
  weeklyPlan?: WeekPlan[];
}

export interface WeekPlan {
  week: number;
  /** Human-readable label, e.g. "Foundations" */
  label?: string;
  /** Module IDs to cover this week */
  moduleIds: string[];
  /** Specific lesson IDs if more granular than full modules */
  lessonIds?: string[];
}

// ── Top-Level Curriculum ──────────────────────────────────

export interface Curriculum {
  id: string;
  title: string;
  /** One-liner shown in cards & search results */
  subtitle: string;
  description: string;
  /** Target audience description */
  targetAudience: string;
  difficulty: DifficultyLevel;
  /** High-level learning objectives for the whole curriculum */
  objectives: string[];
  /** Prerequisite knowledge or courses */
  prerequisites?: string[];
  /** Tags for search & filtering */
  tags?: string[];
  /** Ordered list of modules */
  modules: Module[];
  /** Recommended pacing */
  pacing: PacingSchedule;
  /** Extra resources not tied to a specific lesson */
  bonusResources?: BonusResource[];

  // ── Metadata ──────────────────────────────────────────
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  /** Curriculum schema version for future migrations */
  version: string;
}

// ── API Response Wrappers ─────────────────────────────────

export interface CurriculumResponse {
  success: boolean;
  data?: Curriculum;
  error?: string;
}

export interface CurriculumListResponse {
  success: boolean;
  data?: CurriculumSummary[];
  error?: string;
}

/** Lightweight version for list views — no nested modules/lessons */
export interface CurriculumSummary {
  id: string;
  title: string;
  subtitle: string;
  difficulty: DifficultyLevel;
  tags?: string[];
  totalModules: number;
  totalLessons: number;
  totalHours: number;
  createdAt: string;
  updatedAt: string;
}

// ── Generation API Types (POST /api/generate) ─────────────

/** Request body from the CurriculumForm to POST /api/generate */
export interface GenerateRequest {
  topic: string;
  audience: AudienceLevel;
  length: CourseLength;
  niche?: string;
  /** Optional abstract or course description text (plain text or extracted from PDF) */
  abstract?: string;
  /** Optional learner profile — who they are and what they want to achieve */
  learnerProfile?: string;
  /** Language for the generated course (ISO 639-1 code, default "en") */
  language?: CourseLanguage;
  /** Whether to include quiz questions in each module (default true) */
  includeQuizzes?: boolean;
  /** Teaching style / tone (default "conversational") */
  teachingStyle?: TeachingStyle;
  /** How the course is structured (default "modules") */
  outputStructure?: OutputStructure;
  /** Whether the user uploaded attachments (PDF/files) during generation */
  hasAttachments?: boolean;
  /** How deep the generation goes: structure_only = syllabus only, full_content = complete course (default) */
  contentDepth?: ContentDepth;
}

/** Success response from POST /api/generate (synchronous) */
export interface GenerateResponse {
  success: true;
  data: Curriculum;
}

/** Async success response from POST /api/generate with polling support */
export interface GenerateAsyncResponse {
  success: true;
  courseId: string;
}

/** Error response from POST /api/generate */
export interface GenerateErrorResponse {
  success: false;
  error: string;
  details?: string;
}

/** Status response from GET /api/courses/[id]/status */
export interface CourseStatusResponse {
  status: "pending" | "generating" | "ready" | "failed";
  curriculum?: Curriculum;
  error_message?: string;
  /** Human-readable progress message during chunked generation */
  generation_progress?: string;
  /** Total modules to generate (set after skeleton phase) */
  generation_total_modules?: number;
  /** Modules fully generated so far */
  generation_completed_modules?: number;
}
