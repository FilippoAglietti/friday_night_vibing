"use client";

/**
 * /generating/[courseId]
 * ─────────────────────────────────────────────────────────────
 * Full-screen takeover while a course is being generated.
 *
 * Both entry points (landing-page form + dashboard "new course" tab)
 * redirect here after POST /api/generate, so there's a single loader
 * surface with a single premium design. No sidebar, no tabs, no chrome.
 *
 * Flow:
 *   1. Read courseId (route param) + topic (query param).
 *   2. Poll GET /api/courses/[id]/status every 3s.
 *   3. status === "ready"  → router.push(`/course/${courseId}`)
 *   4. status === "failed" → router.push(`/profile?tab=courses&error=failed`)
 *
 * Auth failures (401) redirect to / with a toast; this route requires
 * the user to own the course.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CourseAssemblyLoader from "@/components/CourseAssemblyLoader";
import type { CourseStatusResponse } from "@/types/curriculum";

interface Progress {
  topic?: string;
  message?: string;
  completed?: number;
  total?: number;
}

export default function GeneratingPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();

  const courseId = params?.courseId;
  const topicFromUrl = searchParams?.get("topic") ?? undefined;

  const [progress, setProgress] = useState<Progress>({ topic: topicFromUrl });

  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/status`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (res.status === 401) {
          if (!cancelled) router.replace("/?auth=required");
          return;
        }
        if (res.status === 404) {
          if (!cancelled) router.replace("/profile?tab=courses&error=not_found");
          return;
        }
        if (!res.ok) return; // transient — next tick retries

        const data: CourseStatusResponse = await res.json();
        if (cancelled) return;

        setProgress((prev) => ({
          topic: prev.topic,
          message: data.generation_progress ?? prev.message,
          completed: data.generation_completed_modules ?? prev.completed,
          total: data.generation_total_modules ?? prev.total,
        }));

        if (data.status === "ready") {
          router.replace(`/course/${courseId}`);
        } else if (data.status === "failed") {
          const err = encodeURIComponent(data.error_message ?? "generation_failed");
          router.replace(`/profile?tab=courses&error=${err}`);
        }
      } catch (err) {
        // Network blips are fine — the next tick will retry. Only escalate
        // on repeated hard failures (skipped here; Inngest will also mark
        // the course failed upstream if the backend truly dies).
        console.warn("[generating] poll error:", err);
      }
    };

    // Fire immediately, then every 3s
    tick();
    intervalId = setInterval(tick, 3000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [courseId, router]);

  if (!courseId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-3 max-w-md">
          <p className="text-lg font-semibold text-violet-200">No course to track</p>
          <p className="text-sm text-muted-foreground">
            This page needs a course ID. Head back to your dashboard and start a
            new generation.
          </p>
          <button
            type="button"
            onClick={() => router.push("/profile?tab=generate")}
            className="mt-2 inline-flex items-center rounded-md bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      {/* Ambient backdrop — premium dark stage */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.18),transparent_50%),radial-gradient(circle_at_80%_90%,rgba(217,70,239,0.14),transparent_55%),radial-gradient(circle_at_50%_50%,rgba(129,140,248,0.08),transparent_60%)] pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent pointer-events-none"
      />

      <div className="relative w-full">
        <CourseAssemblyLoader
          topic={progress.topic}
          progressMessage={progress.message}
          completedModules={progress.completed}
          totalModules={progress.total}
        />
      </div>
    </main>
  );
}
