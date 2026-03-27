/**
 * types/curriculum.ts
 * ─────────────────────────────────────────────────────────────
 * Shared TypeScript interfaces for the Syllabi.ai curriculum
 * JSON structure produced by the Claude AI engine.
 *
 * This file is the contract between:
 *   - Filippo's backend  (lib/prompts, app/api/generate)
 *   - Gianmarco's frontend (components/CurriculumOutput.tsx)
 *
 * DO NOT change field names without coordinating with both sides.
 * ─────────────────────────────────────────────────────────────
 */

// ─── Input ────────────────────────────────────────────────────

/** Audience level accepted by the generation form */
export type AudienceLevel = "beginner" | "intermediate" | "advanced";

/** Desired course length accepted by the generation form */
export type CourseLength = "mini" | "standard" | "bootcamp";

/** Raw request body sent from the frontend form to POST /api/generate */
export interface GenerateRequest {
  /** The course subject (e.g. "Photography for Instagram") */
  topic: string;
  /** Target student level */
  audience: AudienceLevel;
  /** Desired course length:
   *   mini      → ~5 lessons
   *   standard  → 10-15 lessons
   *   bootcamp  → 20+ lessons
   */
  length: CourseLength;
  /** Optional industry/niche context (e.g. "Health & Wellness") */
  niche?: string;
}

// ─── Output ───────────────────────────────────────────────────

/** A single quiz question inside a module */
export interface QuizQuestion {
  /** The question text */
  question: string;
  /** Four answer options */
  options: [string, string, string, string];
  /** The correct option (must match one of options[]) */
  correctAnswer: string;
  /** Brief explanation of why this answer is correct */
  explanation: string;
}

/** A single lesson inside a module */
export interface Lesson {
  /** 1-based lesson number (resets per module) */
  lessonNumber: number;
  /** Lesson title */
  title: string;
  /** Learning objective using Bloom's Taxonomy verb
   *  e.g. "Students will be able to analyze..."
   */
  objective: string;
  /** Suggested lesson duration, e.g. "20 minutes" */
  duration: string;
  /** 2-5 key topic strings covered in the lesson */
  keyTopics: string[];
}

/** A course module containing several lessons and quiz questions */
export interface Module {
  /** 1-based module number */
  moduleNumber: number;
  /** Module title */
  title: string;
  /** One-paragraph description of what this module covers */
  description: string;
  /** Ordered list of lessons in this module */
  lessons: Lesson[];
  /** 2-3 quiz questions that test module understanding */
  quizQuestions: QuizQuestion[];
}

/** Weekly pacing entry */
export interface WeeklyPacing {
  /** Week number, e.g. 1 */
  week: number;
  /** Module numbers covered this week, e.g. [1, 2] */
  modules: number[];
  /** Recommended hours of study per week */
  hoursPerWeek: number;
}

/** Pacing schedule for the full course */
export interface PacingSchedule {
  /** Human-readable total duration, e.g. "6 weeks" */
  totalDuration: string;
  /** Week-by-week breakdown */
  weeklyBreakdown: WeeklyPacing[];
}

/** Bonus learning resource */
export interface BonusResource {
  /** Resource name */
  title: string;
  /** Resource type */
  type: "book" | "video" | "tool" | "website" | "course" | "article";
  /** Short description of why it helps */
  description: string;
}

/**
 * The full curriculum object returned by the AI engine.
 * This is what gets stored in Supabase and rendered by the frontend.
 */
export interface Curriculum {
  /** Compelling, marketable course title */
  title: string;
  /** One-line course subtitle */
  subtitle: string;
  /** 2-3 sentence course description */
  description: string;
  /** 3-5 student learning outcomes (Bloom's Taxonomy phrasing) */
  learningOutcomes: string[];
  /** Ordered modules (length depends on CourseLength requested) */
  modules: Module[];
  /** Suggested pacing schedule */
  pacingSchedule: PacingSchedule;
  /** Optional bonus resources */
  bonusResources: BonusResource[];
}

// ─── API Response ─────────────────────────────────────────────

/** Successful response from POST /api/generate */
export interface GenerateResponse {
  curriculum: Curriculum;
}

/** Error response from POST /api/generate */
export interface GenerateErrorResponse {
  error: string;
  details?: string;
}
