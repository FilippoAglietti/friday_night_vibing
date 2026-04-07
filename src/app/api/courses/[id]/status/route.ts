/**
 * app/api/courses/[id]/status/route.ts
 * ─────────────────────────────────────────────────────────────
 * Next.js App Router API route: GET /api/courses/[id]/status
 *
 * Returns the current status of a course's generation, including:
 * - status: pending | generating | ready | failed
 * - curriculum: The full Curriculum object (only if status="ready")
 * - error_message: Error details (only if status="failed")
 *
 * Used by the frontend to poll during async course generation.
 * The frontend calls this endpoint every 3 seconds after receiving a courseId
 * from POST /api/generate until the course reaches a final state (ready/failed).
 *
 * Auth: Requires user to be authenticated and to be the owner of the course.
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CourseStatusResponse, Curriculum } from "@/types/curriculum";

export const dynamic = "force-dynamic";

/**
 * Creates a Supabase server client using Next.js cookies.
 * Used to authenticate the user and fetch course status.
 */
async function createSupabaseServer() {
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
            // set() can throw in read-only contexts — safe to ignore
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // Same as above — safe to ignore
          }
        },
      },
    }
  );
}

/**
 * GET /api/courses/[id]/status
 *
 * Returns the current generation status of a course.
 * Polls for the client during async generation.
 *
 * @param req - Next.js request
 * @param params - Route parameters { id: string }
 * @returns CourseStatusResponse with status and optionally curriculum or error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CourseStatusResponse | { success: false; error: string; details?: string }>> {
  try {
    // Extract course ID from route parameters
    const { id: courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required." },
        { status: 400 }
      );
    }

    // ── Authenticate user ──────────────────────────────────────
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("[/api/courses/[id]/status] User not authenticated:", authError?.message);
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    // ── Fetch course and verify ownership ───────────────────────
    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("id, status, curriculum, error_message, user_id, generation_progress, generation_total_modules, generation_completed_modules")
      .eq("id", courseId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.warn("[/api/courses/[id]/status] Failed to fetch course:", fetchError.message);
      return NextResponse.json(
        { success: false, error: "Course not found." },
        { status: 404 }
      );
    }

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found." },
        { status: 404 }
      );
    }

    // Verify user is the owner
    if (course.user_id !== user.id) {
      console.warn(
        "[/api/courses/[id]/status] User attempted to access another user's course:",
        courseId
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 403 }
      );
    }

    // ── Build response based on current status ─────────────────

    const baseResponse: CourseStatusResponse = {
      status: course.status as "pending" | "generating" | "ready" | "failed",
    };

    if (course.status === "ready" && course.curriculum) {
      // Include the full curriculum object for ready courses
      baseResponse.curriculum = course.curriculum as Curriculum;
    } else if (course.status === "failed" && course.error_message) {
      // Include error details for failed courses
      baseResponse.error_message = course.error_message;
    }

    // Include generation progress for courses that are still generating
    if (course.status === "generating") {
      if (course.generation_progress) {
        baseResponse.generation_progress = course.generation_progress;
      }
      if (course.generation_total_modules) {
        baseResponse.generation_total_modules = course.generation_total_modules;
      }
      if (course.generation_completed_modules != null) {
        baseResponse.generation_completed_modules = course.generation_completed_modules;
      }
    }

    const res = NextResponse.json(baseResponse, { status: 200 });
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch (err) {
    console.error("[/api/courses/[id]/status] Unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
