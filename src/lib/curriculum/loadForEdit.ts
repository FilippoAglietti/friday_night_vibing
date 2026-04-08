/**
 * lib/curriculum/loadForEdit.ts
 * ─────────────────────────────────────────────────────────────
 * Shared Supabase loader for the curriculum editing endpoints.
 *
 * Every edit endpoint needs the same three things:
 *   1. Authenticated user (from cookies)
 *   2. The target course row
 *   3. A confirmed ownership check
 *
 * Centralising this logic here keeps the individual route files
 * focused on the actual edit semantics.
 * ─────────────────────────────────────────────────────────────
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Curriculum } from "@/types/curriculum";

/** Shape of the course row we fetch for editing operations. */
export interface CourseForEdit {
  id: string;
  user_id: string;
  title: string | null;
  curriculum: Curriculum | null;
  status: string;
  topic: string;
  audience: string;
  length: string;
  niche: string | null;
  language: string | null;
  level: string | null;
  content_type: string;
  teaching_style: string | null;
  output_structure: string | null;
  include_quizzes: boolean | null;
  learner_profile: string | null;
  course_abstract: string | null;
}

/** Result of a successful load: both course + admin client for writes. */
export interface LoadResult {
  kind: "ok";
  userId: string;
  course: CourseForEdit;
  admin: ReturnType<typeof getSupabaseAdmin>;
}

/** Well-typed failure payload that each route turns into an HTTP response. */
export interface LoadError {
  kind: "error";
  status: number;
  error: string;
}

/**
 * Creates a cookie-bound Supabase client so we can identify the caller.
 */
async function userClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* read-only context */
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            /* read-only context */
          }
        },
      },
    }
  );
}

/**
 * Authenticates the caller, loads the course row, and verifies the caller
 * owns the course. Returns a discriminated union so the caller can cleanly
 * turn failures into NextResponse without try/catch.
 */
export async function loadCourseForEdit(courseId: string): Promise<LoadResult | LoadError> {
  if (!courseId || typeof courseId !== "string") {
    return { kind: "error", status: 400, error: "Invalid course id." };
  }

  const supabase = await userClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { kind: "error", status: 401, error: "Authentication required." };
  }

  // Admin client writes past RLS — we'll use it for UPDATE queries.
  const admin = getSupabaseAdmin();

  const { data: course, error: fetchError } = await admin
    .from("courses")
    .select(
      "id, user_id, title, curriculum, status, topic, audience, length, niche, language, level, content_type, teaching_style, output_structure, include_quizzes, learner_profile, course_abstract"
    )
    .eq("id", courseId)
    .maybeSingle();

  if (fetchError) {
    console.error("[loadCourseForEdit] fetch error:", fetchError);
    return { kind: "error", status: 500, error: "Could not load course." };
  }
  if (!course) {
    return { kind: "error", status: 404, error: "Course not found." };
  }
  if (course.user_id !== user.id) {
    return { kind: "error", status: 403, error: "You do not own this course." };
  }
  if (course.status !== "ready" || !course.curriculum) {
    return {
      kind: "error",
      status: 409,
      error: "Course is not yet ready for editing.",
    };
  }

  return {
    kind: "ok",
    userId: user.id,
    course: course as CourseForEdit,
    admin,
  };
}
