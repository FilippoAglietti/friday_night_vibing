"use client";

/**
 * CourseAssemblyLoader
 * ─────────────────────────────────────────────────────────
 * Engaging "course assembling itself" loading animation shown
 * while a generation job is in flight. Used on the landing page
 * and the /profile dashboard Generate tab.
 *
 * Drives its headline + progress bar from real backend data
 * (topic, generation_progress string, completed/total modules)
 * when available, and falls back to a smooth placeholder pace
 * otherwise. A rotating subline of personal humor copy
 * ("Arguing with myself about whether quiz 3 is too easy…")
 * cycles every ~3s to keep the wait feeling alive.
 * ─────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Layers,
  PenLine,
  HelpCircle,
  Wand2,
  CheckCircle2,
} from "lucide-react";

export interface CourseAssemblyLoaderProps {
  /** The course topic the user entered — interpolated into copy for a personal touch */
  topic?: string;
  /** Human-readable progress message from the backend (optional) */
  progressMessage?: string;
  /** Modules generated so far (optional) */
  completedModules?: number;
  /** Total modules to generate (optional — set after skeleton phase) */
  totalModules?: number;
}

/* ─── Phase derivation ────────────────────────────────────── */

type Phase = "skeleton" | "modules" | "polish";

function derivePhase(
  progressMessage?: string,
  completed = 0,
  total = 0,
): Phase {
  if (progressMessage) {
    const p = progressMessage.toLowerCase();
    if (p.includes("skeleton") || p.includes("designing") || p.includes("structure")) {
      return "skeleton";
    }
    if (p.includes("final") || p.includes("polish")) return "polish";
  }
  if (total === 0) return "skeleton";
  if (completed >= total) return "polish";
  return "modules";
}

/* ─── Personal humor copy ─────────────────────────────────── */

/**
 * Rotating subline messages. `{topic}` is replaced with the user's topic
 * at render time (with a sane fallback when topic is empty).
 *
 * Tone: dry, first-person, slightly self-deprecating — like a
 * competent-but-honest teaching assistant building your course.
 * No emojis — the visual layer handles the vibe.
 */
const COPY_BY_PHASE: Record<Phase, string[]> = {
  skeleton: [
    "Sketching the shape of {topic}…",
    "Deciding what Module 1 should really say about {topic}…",
    "Reading three textbooks about {topic} at once…",
    "Wait — should this start easy or throw you in the deep end?",
    "Figuring out what a beginner actually needs to hear first…",
    "Pretending I know what I'm doing (I kind of do)…",
  ],
  modules: [
    "Writing this one — I think it's actually fun…",
    "Trying not to overuse the word \"basically\"…",
    "Looking for a better example than the one I just wrote…",
    "Arguing with myself about whether quiz 3 is too easy…",
    "Making sure Module 2 doesn't repeat Module 1. Again.",
    "Rewriting that paragraph because I didn't like it either.",
    "Convincing myself this metaphor works…",
    "Teaching {topic} the way I wish someone taught me…",
    "Writing a quiz question I actually want to answer…",
    "Sneaking in one more good example…",
  ],
  polish: [
    "Polishing the edges. Almost there…",
    "Double-checking nobody will fall asleep in Module 5…",
    "Making sure the audio narrator doesn't sound bored…",
    "Tidying up the roadmap…",
    "One last pass — this is the fun part…",
    "Putting the finishing touches on {topic}…",
  ],
};

function interpolate(line: string, topic: string): string {
  return line.replace(/\{topic\}/g, topic);
}

/* ─── Phase chip definitions ──────────────────────────────── */

const PHASE_TRACK: { key: Phase; label: string; Icon: React.ElementType }[] = [
  { key: "skeleton", label: "Skeleton", Icon: Layers },
  { key: "modules", label: "Modules", Icon: PenLine },
  { key: "polish", label: "Polish", Icon: Wand2 },
];

/* ─── Assembly visual (the "something is being built" bit) ── */

function ModuleStack({
  total,
  completed,
  phase,
}: {
  total: number;
  completed: number;
  phase: Phase;
}) {
  // When we don't yet know the total (skeleton phase), fake a 5-card stack so
  // the animation still reads as "we're building something".
  const count = total > 0 ? Math.min(total, 8) : 5;
  const activeIdx = total > 0 ? Math.min(completed, count - 1) : Math.floor(count / 2);

  return (
    <div className="relative w-full max-w-md mx-auto py-4">
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: count }).map((_, i) => {
          const isDone = total > 0 && i < completed;
          const isActive = total > 0 ? i === activeIdx : i <= activeIdx;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -24, scale: 0.96 }}
              animate={{
                opacity: isDone ? 0.95 : isActive ? 1 : 0.35,
                x: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.55,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`relative rounded-xl border p-3 backdrop-blur-sm overflow-hidden ${
                isDone
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : isActive
                    ? "border-violet-500/40 bg-violet-500/10 shadow-[0_0_24px_-6px_rgba(139,92,246,0.4)]"
                    : "border-white/5 bg-white/[0.02]"
              }`}
            >
              {/* Pulsing ring around the active module */}
              {isActive && !isDone && (
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-xl border border-violet-400/40 pointer-events-none"
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <div className="relative flex items-center gap-3">
                {/* Module number badge */}
                <div
                  className={`flex items-center justify-center size-7 rounded-lg shrink-0 text-[11px] font-bold ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : isActive
                        ? "bg-violet-500/25 text-violet-200 border border-violet-500/40"
                        : "bg-white/5 text-slate-500 border border-white/5"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="size-3.5" /> : i + 1}
                </div>

                {/* Lesson-line placeholders (typewriter effect on active) */}
                <div className="flex-1 space-y-1.5">
                  <LessonLine
                    widthPct={70 - (i % 3) * 6}
                    isDone={isDone}
                    isActive={isActive}
                    delay={0}
                    phase={phase}
                  />
                  <LessonLine
                    widthPct={50 - (i % 2) * 4}
                    isDone={isDone}
                    isActive={isActive}
                    delay={0.15}
                    phase={phase}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function LessonLine({
  widthPct,
  isDone,
  isActive,
  delay,
  phase,
}: {
  widthPct: number;
  isDone: boolean;
  isActive: boolean;
  delay: number;
  phase: Phase;
}) {
  if (isDone) {
    return <div className="h-1.5 rounded-full bg-emerald-400/30" style={{ width: `${widthPct}%` }} />;
  }
  if (isActive) {
    // Typing sweep: line scales from 0% to target width in a loop
    return (
      <motion.div
        className="h-1.5 rounded-full bg-gradient-to-r from-violet-400/60 via-fuchsia-400/50 to-violet-400/60"
        style={{ width: `${widthPct}%`, transformOrigin: "left center" }}
        animate={{ scaleX: [0, 1, 1, 0] }}
        transition={{
          duration: phase === "polish" ? 1.2 : 2.2,
          repeat: Infinity,
          delay,
          ease: "easeInOut",
          times: [0, 0.45, 0.85, 1],
        }}
      />
    );
  }
  return <div className="h-1.5 rounded-full bg-white/5" style={{ width: `${widthPct}%` }} />;
}

/* ─── Floating particles (ambient life) ───────────────────── */

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: 6 + ((i * 41) % 88),
  top: 6 + ((i * 59) % 88),
  duration: 2.5 + ((i * 17) % 20) / 10,
  delay: (i * 0.25) % 3,
}));

function Particles() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute size-1 rounded-full bg-violet-400/40"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          animate={{ y: [0, -22, 0], opacity: [0, 0.7, 0], scale: [0.5, 1, 0.5] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */

export default function CourseAssemblyLoader({
  topic,
  progressMessage,
  completedModules = 0,
  totalModules = 0,
}: CourseAssemblyLoaderProps) {
  const safeTopic = (topic || "").trim() || "your course";
  const phase = derivePhase(progressMessage, completedModules, totalModules);

  // Rotate through phase-specific copy every ~3s. A single monotonically
  // incrementing tick drives the index; we modulo by the current phase's copy
  // length at render time so a phase change naturally picks a fresh line.
  const phaseCopy = COPY_BY_PHASE[phase];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 3000);
    return () => clearInterval(id);
  }, []);
  const copyIdx = tick % phaseCopy.length;

  // Elapsed time counter
  const startRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => {
      if (startRef.current != null) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Progress percent — real if totalModules known, otherwise a soft elapsed-based climb
  // that eases toward 90% so it never stalls at a specific number.
  const hasTotal = totalModules > 0;
  const realPercent = hasTotal
    ? Math.min(95, Math.round(10 + (completedModules / totalModules) * 85))
    : null;
  const fakePercent = Math.min(90, Math.round(6 + elapsed * 1.5));
  const progressPercent = realPercent ?? fakePercent;

  // Phase-derived headline
  const headline = (() => {
    if (phase === "skeleton") return "Designing the course skeleton";
    if (phase === "polish") return "Polishing your course";
    if (hasTotal) {
      const current = Math.min(completedModules + 1, totalModules);
      return `Writing module ${current} of ${totalModules}`;
    }
    return "Writing your modules";
  })();

  const phaseIdx = PHASE_TRACK.findIndex((p) => p.key === phase);
  const subline = interpolate(phaseCopy[copyIdx], safeTopic);

  return (
    <div role="status" className="relative w-full max-w-3xl mx-auto">
      {/* Glow backdrop */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[340px] bg-gradient-radial from-violet-500/15 via-indigo-500/5 to-transparent blur-3xl pointer-events-none"
      />

      <div className="relative px-4 py-8 sm:py-12">
        {/* Status pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-xs font-medium text-violet-300">
            <Sparkles className="size-3.5 animate-pulse" />
            Live generation
          </div>
        </div>

        {/* Topic heading */}
        <h2 className="mt-4 text-center text-2xl sm:text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-white via-violet-100 to-violet-200 bg-clip-text text-transparent">
          {safeTopic}
        </h2>

        {/* Headline + rotating subline */}
        <div className="mt-5 text-center space-y-1.5 min-h-[56px]">
          <p className="text-base sm:text-lg font-semibold text-violet-300">{headline}</p>
          <div aria-live="polite" aria-atomic="true" className="relative h-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${phase}-${copyIdx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-x-0 text-sm text-muted-foreground italic"
              >
                {subline}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="h-2 rounded-full bg-white/[0.04] border border-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              {hasTotal
                ? `${Math.min(completedModules, totalModules)} of ${totalModules} modules`
                : "Warming up…"}
            </span>
            <span className="tabular-nums">{elapsed}s</span>
          </div>
        </div>

        {/* Assembly visual */}
        <div className="relative mt-8">
          <Particles />
          <ModuleStack
            total={totalModules}
            completed={completedModules}
            phase={phase}
          />
        </div>

        {/* Phase tracker chips */}
        <div className="mt-8 max-w-md mx-auto grid grid-cols-3 gap-2">
          {PHASE_TRACK.map((p, i) => {
            const isActive = i === phaseIdx;
            const isDone = i < phaseIdx;
            const Icon = p.Icon;
            return (
              <div
                key={p.key}
                className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-colors duration-500 ${
                  isActive
                    ? "bg-violet-500/10 border-violet-500/40 text-violet-200"
                    : isDone
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                      : "bg-white/[0.02] border-white/5 text-slate-500"
                }`}
              >
                <Icon className={`size-4 ${isActive ? "animate-pulse" : ""}`} />
                <span className="text-[10px] font-semibold uppercase tracking-wide">{p.label}</span>
                {isActive && (
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 rounded-xl border border-violet-400/30 pointer-events-none"
                    animate={{ opacity: [0.2, 0.55, 0.2] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Background note */}
        <p className="mt-8 text-center text-[11px] text-muted-foreground/70 max-w-md mx-auto leading-relaxed">
          Your course is being built in the background. You can safely stay on this
          page — we&apos;ll show it the moment it&apos;s ready.
          <span className="inline-flex items-center gap-1 ml-1">
            <HelpCircle className="size-3 inline" />
            Complex courses take a little longer.
          </span>
        </p>
      </div>
    </div>
  );
}
