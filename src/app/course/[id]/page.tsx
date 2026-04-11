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
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Curriculum } from "@/types/curriculum";
import CourseContent from "./course-content";

// ─── Supabase admin client (server-side only) ────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// ─── Types ───────────────────────────────────────────────────

interface CourseRow {
  id: string;
  title: string;
  topic: string;
  audience: string;
  length: string;
  niche: string | null;
  curriculum: Curriculum | null;
  status: string;
  created_at: string;
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
    return { title: "Course Not Found | Syllabi" };
  }

  const c = data.curriculum as Curriculum;
  return {
    title: `${c.title} | Syllabi`,
    description: c.subtitle || c.description || "AI-generated course on Syllabi",
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

  // Fetch the course by ID
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, topic, audience, length, niche, curriculum, status, created_at")
    .eq("id", id)
    .single();

  // Return 404 if course doesn't exist, is still generating, or has no curriculum
  if (error || !course || course.status !== "ready" || !course.curriculum) {
    notFound();
  }

  return (
    <CourseContent
      curriculum={course.curriculum as Curriculum}
      courseId={course.id}
      createdAt={course.created_at}
    />
  );
}
