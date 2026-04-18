/**
 * app/course/[id]/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Server component for the course detail page.
 * Fetches the course from Supabase by ID and renders the full
 * curriculum with all modules, lessons, keyPoints, content,
 * suggested resources, and quiz questions.
 *
 * Route: /course/:id
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Curriculum, TeachingStyle } from "@/types/curriculum";
import CourseContent from "./course-content";
import GeneratingView from "./generating-view";
import { BodyUnlockButton } from "@/components/BodyUnlockButton";
import { courseHasModuleBodies } from "@/lib/curriculum";

// ─── Supabase admin client (server-side only) ────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// ─── Get current authenticated user ID via cookie-based client ──

async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {
            // read-only in server component
          },
          remove() {
            // read-only in server component
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Dynamic metadata for SEO / social sharing ──────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("courses")
    .select("title, curriculum")
    .eq("id", id)
    .single();

  if (!data?.curriculum) {
    return {
      title: "Course Not Found | Syllabi",
      robots: { index: false, follow: false },
    };
  }

  const c = data.curriculum as Curriculum;
  return {
    title: `${c.title} | Syllabi`,
    description: c.subtitle || c.description || "AI-generated course on Syllabi",
    robots: { index: false, follow: false },
    openGraph: {
      title: c.title,
      description: c.subtitle || c.description || "",
      siteName: "Syllabi",
      type: "article",
    },
  };
}

// ─── Page component ──────────────────────────────────────────

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id, title, topic, curriculum, status, created_at, teaching_style, generation_progress, generation_total_modules, generation_completed_modules, user_id, body_unlock_purchased",
    )
    .eq("id", id)
    .single();

  if (error || !course) {
    notFound();
  }

  // Still being built (or freshly queued) → live progress view.
  if (course.status === "pending" || course.status === "generating") {
    return (
      <GeneratingView
        courseId={course.id}
        topic={course.title || course.topic || "Your course"}
        initialProgress={course.generation_progress ?? null}
        initialTotal={course.generation_total_modules ?? 0}
        initialCompleted={course.generation_completed_modules ?? 0}
        initialStatus={course.status as "pending" | "generating"}
      />
    );
  }

  // Terminal states without curriculum are unrecoverable.
  if (!course.curriculum) {
    notFound();
  }

  // "partial" courses are viewable — finalize wrote whatever it had.
  if (course.status !== "ready" && course.status !== "partial") {
    notFound();
  }

  // Get current user to determine whether to show the body-unlock CTA.
  const currentUserId = await getCurrentUserId();

  const showBodyUnlock =
    course.body_unlock_purchased !== true &&
    course.status === "ready" &&
    !courseHasModuleBodies(course.curriculum) &&
    course.user_id === currentUserId;

  return (
    <>
      {showBodyUnlock && (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <div className="mb-8 rounded-lg border border-violet-200/30 bg-violet-50/5 dark:bg-violet-500/5 dark:border-violet-500/20 p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              This is the skeleton. Unlock full module bodies (~2 min):
            </p>
            <BodyUnlockButton courseId={course.id} />
          </div>
        </div>
      )}
      <CourseContent
        curriculum={course.curriculum as Curriculum}
        courseId={course.id}
        createdAt={course.created_at}
        teachingStyle={(course.teaching_style as TeachingStyle | null) ?? null}
      />
    </>
  );
}
