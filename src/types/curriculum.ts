// ─────────────────────────────────────────────────────────
// Syllabi.ai — Shared Curriculum Types (Frontend ↔ Backend)
// ─────────────────────────────────────────────────────────
// This file is the CONTRACT between the frontend (page.tsx / components/)
// and the backend (lib/ / app/api/). Do NOT change these interfaces
// without coordinating with the other side.
// ─────────────────────────────────────────────────────────

// ── Enums & Literals ──────────────────────────────────────

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

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

export interface Lesson {
  id: string;
  title: string;
  description: string;
  format: LessonFormat;
  /** Estimated duration in minutes */
  durationMinutes: number;
  /** Learning objectives for this specific lesson */
  objectives?: string[];
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
  /** Who generated / authored this curriculum */
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  /** Curriculum schema version for future migrations */
  version: string;
}

// ── API Response Wrappers ─────────────────────────────────
// Use these in app/api/ route handlers and frontend fetch calls.

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
