"use client";

/**
 * app/course/[id]/generating-view.tsx
 * ─────────────────────────────────────────────────────────────
 * Client component shown while a course is still generating.
 * Polls GET /api/courses/[id]/status every 2s, shows a staged
 * progress animation with live module-aware messages, and
 * refreshes the page when the course flips to ready.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Cpu, Layers, PenTool, CheckCircle2, AlertTriangle } from "lucide-react";

type Phase = "skeleton" | "modules" | "finalizing" | "ready" | "failed" | "partial";

interface GeneratingViewProps {
  courseId: string;
  topic: string;
  initialProgress: string | null;
  initialTotal: number;
  initialCompleted: number;
  initialStatus: "pending" | "generating" | "ready" | "failed" | "partial";
}

interface StatusPayload {
  status: "pending" | "generating" | "ready" | "failed" | "partial";
  generation_progress?: string;
  generation_total_modules?: number;
  generation_completed_modules?: number;
  error_message?: string;
}

/** Rotating "vibe" messages shown when the backend doesn't have a fresh one */
const VIBE_MESSAGES = [
  "Consulting the archives...",
  "Brewing knowledge...",
  "Stitching ideas together...",
  "Warming up the neurons...",
  "Arranging the narrative arc...",
  "Teaching the AI how to teach...",
] as const;

function derivePhase(progress: string | null, total: number, completed: number): Phase {
  if (!progress) {
    if (total === 0) return "skeleton";
    if (completed >= total) return "finalizing";
    return "modules";
  }
  const p = progress.toLowerCase();
  if (p.includes("skeleton") || p.includes("designing")) return "skeleton";
  if (p.includes("final")) return "finalizing";
  return total > 0 ? "modules" : "skeleton";
}

export default function GeneratingView({
  courseId,
  topic,
  initialProgress,
  initialTotal,
  initialCompleted,
  initialStatus,
}: GeneratingViewProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [total, setTotal] = useState(initialTotal);
  const [completed, setCompleted] = useState(initialCompleted);
  const [status, setStatus] = useState<StatusPayload["status"]>(initialStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vibeIdx, setVibeIdx] = useState(0);
  const [pollError, setPollError] = useState(false);
  const pollingRef = useRef(true);

  // Rotate vibe messages every 2.5s for visual life when the backend is quiet.
  useEffect(() => {
    const id = setInterval(() => setVibeIdx((i) => (i + 1) % VIBE_MESSAGES.length), 2500);
    return () => clearInterval(id);
  }, []);

  // Poll status every 2s. Stop once the course reaches a terminal state.
  useEffect(() => {
    pollingRef.current = true;
    let aborted = false;

    // Safety net: if generation never reaches a terminal state, bounce to My Courses
    // after 30 min so the loader can't spin forever. Course will appear there in
    // whatever state it ended up in.
    const timeoutId = setTimeout(() => {
      if (aborted) return;
      pollingRef.current = false;
      router.push("/profile?tab=courses");
    }, 30 * 60 * 1000);

    async function tick() {
      if (aborted || !pollingRef.current) return;
      try {
        const res = await fetch(`/api/courses/${courseId}/status`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) {
          setPollError(true);
          return;
        }
        const data = (await res.json()) as StatusPayload;
        setPollError(false);
        if (typeof data.generation_progress === "string") setProgress(data.generation_progress);
        if (typeof data.generation_total_modules === "number") setTotal(data.generation_total_modules);
        if (typeof data.generation_completed_modules === "number") setCompleted(data.generation_completed_modules);
        setStatus(data.status);
        if (data.status === "ready") {
          pollingRef.current = false;
          router.push("/profile?tab=courses");
          return;
        }
        if (data.status === "failed") {
          pollingRef.current = false;
          setErrorMessage(data.error_message ?? "Generation failed.");
          return;
        }
      } catch {
        setPollError(true);
      }
    }

    tick();
    const id = setInterval(tick, 2000);
    return () => {
      aborted = true;
      pollingRef.current = false;
      clearInterval(id);
      clearTimeout(timeoutId);
    };
  }, [courseId, router]);

  const phase = derivePhase(progress, total, completed);
  const hasTotal = total > 0;
  const progressPercent = hasTotal
    ? Math.min(99, Math.round(10 + (completed / total) * 85))
    : phase === "skeleton"
      ? 8
      : 5;

  const headline = (() => {
    if (status === "failed") return "Generation failed";
    if (phase === "skeleton") return "Designing the course skeleton";
    if (phase === "finalizing") return "Finalizing your course";
    if (phase === "modules") return hasTotal ? `Writing module ${Math.min(completed + 1, total)} of ${total}` : "Writing modules";
    return "Preparing your course";
  })();

  const subline = progress ?? VIBE_MESSAGES[vibeIdx];

  const stages: { key: Phase; label: string; icon: React.ElementType }[] = [
    { key: "skeleton",   label: "Skeleton",  icon: Layers },
    { key: "modules",    label: "Modules",   icon: PenTool },
    { key: "finalizing", label: "Finalize",  icon: Cpu },
    { key: "ready",      label: "Ready",     icon: CheckCircle2 },
  ];

  const phaseOrder: Phase[] = ["skeleton", "modules", "finalizing", "ready"];
  const phaseIdx = phaseOrder.indexOf(phase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <span className="text-xs text-slate-500">Course ID: {courseId.slice(0, 8)}</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {/* Glow backdrop */}
        <div className="absolute inset-x-0 top-0 pointer-events-none">
          <div className="mx-auto max-w-3xl h-[420px] bg-gradient-radial from-violet-500/20 via-indigo-500/5 to-transparent blur-3xl" />
        </div>

        <div className="relative">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300">
            <Sparkles className="size-3.5 animate-pulse" />
            {status === "failed" ? "We hit a snag" : "Live generation"}
          </div>

          {/* Topic */}
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight bg-gradient-to-r from-white via-violet-100 to-violet-200 bg-clip-text text-transparent">
            {topic}
          </h1>

          {/* Headline + subline */}
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-white">{headline}</p>
            <p className="text-sm text-slate-400 transition-opacity duration-500" key={subline}>
              {subline}
            </p>
          </div>

          {/* Progress bar */}
          {status !== "failed" && (
            <div className="mt-6">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{hasTotal ? `${completed} of ${total} modules` : "Setting things up"}</span>
                <span>{progressPercent}%</span>
              </div>
            </div>
          )}

          {/* Stage tracker */}
          <div className="mt-10 grid grid-cols-4 gap-2">
            {stages.map((s, i) => {
              const isActive = i === phaseIdx;
              const isDone = i < phaseIdx;
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className={`relative flex flex-col items-center gap-2 px-2 py-4 rounded-xl border transition-all duration-500 ${
                    isActive
                      ? "bg-violet-500/10 border-violet-500/40 text-white"
                      : isDone
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                        : "bg-white/[0.02] border-white/5 text-slate-500"
                  }`}
                >
                  <Icon className={`size-5 ${isActive ? "animate-pulse" : ""}`} />
                  <span className="text-[11px] font-medium uppercase tracking-wide">{s.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl pointer-events-none">
                      <div className="absolute inset-0 rounded-xl border border-violet-400/30 animate-ping" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Failure state */}
          {status === "failed" && (
            <div className="mt-10 p-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-rose-300 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-100">Generation failed</p>
                  <p className="mt-1 text-xs text-rose-200/80">
                    {errorMessage ?? "Something went wrong. Try generating again from your dashboard."}
                  </p>
                  <Link
                    href="/profile"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-md transition-colors"
                  >
                    <ArrowLeft className="size-3" /> Back to dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Poll error hint (subtle) */}
          {pollError && status !== "failed" && (
            <p className="mt-6 text-[11px] text-amber-400/70">
              Connection hiccup while checking status — will retry.
            </p>
          )}

          {/* Background info */}
          <div className="mt-12 p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-slate-400 leading-relaxed">
              Your course is being written in the background. You can safely close this page — generation will
              continue, and the finished course will show up in your dashboard. Complex courses (like Masterclasses)
              can take a few minutes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
