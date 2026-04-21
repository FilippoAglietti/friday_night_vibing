/**
 * app/api/quiz-attempts/route.ts
 * ─────────────────────────────────────────────────────────────
 * Student quiz-attempt capture + owner listing.
 *
 *   POST /api/quiz-attempts
 *     body: {
 *       course_id:       uuid,      // public course being attempted
 *       student_name:    string,    // anonymous student handle
 *       student_email?:  string,    // optional
 *       module_index:    number,
 *       module_title?:   string,
 *       total_questions: number,
 *       correct_answers: number,
 *       answers:         Array<{ questionId: string; chosen: number|string; isCorrect: boolean }>,
 *       duration_seconds?: number,
 *     }
 *     returns 200 { success: true, attempt_id, score_percent }
 *
 *   GET /api/quiz-attempts?course_id=uuid
 *     Owner-only listing. RLS enforces ownership.
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

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
        set() { /* read-only */ },
        remove() { /* read-only */ },
      },
    }
  );
}

function clampInt(v: unknown, min: number, max: number): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const n = Math.round(v);
  if (n < min || n > max) return null;
  return n;
}

function sanitizeText(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (t.length === 0) return null;
  return t.slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const courseId = sanitizeText(body?.course_id, 64);
    const studentName = sanitizeText(body?.student_name, 80);
    const studentEmail = sanitizeText(body?.student_email, 200);
    const moduleIndex = clampInt(body?.module_index, 0, 999);
    const moduleTitle = sanitizeText(body?.module_title, 240);
    const totalQuestions = clampInt(body?.total_questions, 0, 1000);
    const correctAnswers = clampInt(body?.correct_answers, 0, 1000);
    const durationSeconds = clampInt(body?.duration_seconds, 0, 60 * 60 * 24);
    const answers = Array.isArray(body?.answers) ? body.answers.slice(0, 200) : [];

    if (!courseId || !studentName || moduleIndex === null || totalQuestions === null || correctAnswers === null) {
      return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
    }
    if (correctAnswers > totalQuestions) {
      return NextResponse.json({ error: "correct_answers cannot exceed total_questions." }, { status: 400 });
    }

    const supabaseAdmin = adminClient();

    const { data: course, error: courseErr } = await supabaseAdmin
      .from("courses")
      .select("id, is_public, status")
      .eq("id", courseId)
      .maybeSingle();

    if (courseErr) {
      console.error("[/api/quiz-attempts] course lookup error:", courseErr);
      return NextResponse.json({ error: "Could not verify course." }, { status: 500 });
    }
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }
    if (!course.is_public || (course.status !== "ready" && course.status !== "partial")) {
      return NextResponse.json({ error: "Course is not open for attempts." }, { status: 403 });
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("quiz_attempts")
      .insert({
        course_id: courseId,
        student_name: studentName,
        student_email: studentEmail,
        module_index: moduleIndex,
        module_title: moduleTitle,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        answers,
        duration_seconds: durationSeconds,
      })
      .select("id, score_percent")
      .single();

    if (insertErr) {
      console.error("[/api/quiz-attempts] insert error:", insertErr);
      return NextResponse.json({ error: "Could not save the attempt." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      attempt_id: inserted.id,
      score_percent: inserted.score_percent,
    });
  } catch (err) {
    console.error("[/api/quiz-attempts] unexpected:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get("course_id");
    if (!courseId) {
      return NextResponse.json({ error: "course_id is required." }, { status: 400 });
    }

    const supabase = await userClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("id, student_name, student_email, module_index, module_title, total_questions, correct_answers, score_percent, duration_seconds, created_at")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/quiz-attempts] list error:", error);
      return NextResponse.json({ error: "Could not fetch attempts." }, { status: 500 });
    }

    return NextResponse.json({ success: true, attempts: data ?? [], count: data?.length ?? 0 });
  } catch (err) {
    console.error("[/api/quiz-attempts] GET unexpected:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
