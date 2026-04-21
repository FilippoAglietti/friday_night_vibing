/**
 * app/s/[id]/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Public student-facing page for a shared course.
 * Route: /s/:id
 *
 * The page fetches a course only if it's both `ready`/`partial` AND
 * `is_public = true`. Students see the course outline and can take
 * an interactive quiz — their results are POSTed to /api/quiz-attempts
 * and collected for the course owner.
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Curriculum } from "@/types/curriculum";
import StudentContent from "./student-content";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("courses")
    .select("title, curriculum, is_public, status")
    .eq("id", id)
    .maybeSingle();

  if (!data?.is_public || !data?.curriculum) {
    return {
      title: "Course | Syllabi",
      robots: { index: false, follow: false },
    };
  }

  const c = data.curriculum as Curriculum;
  return {
    title: `${c.title} | Syllabi`,
    description: c.subtitle || c.description || "Take this course on Syllabi",
    robots: { index: false, follow: true },
    openGraph: {
      title: c.title,
      description: c.subtitle || c.description || "",
      siteName: "Syllabi",
      type: "article",
    },
  };
}

export default async function StudentSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, curriculum, is_public, status")
    .eq("id", id)
    .maybeSingle();

  if (error || !course) notFound();
  if (!course.is_public) notFound();
  if (course.status !== "ready" && course.status !== "partial") notFound();
  if (!course.curriculum) notFound();

  return (
    <StudentContent
      courseId={course.id}
      curriculum={course.curriculum as Curriculum}
    />
  );
}
