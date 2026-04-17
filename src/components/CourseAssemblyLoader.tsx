"use client";

/**
 * CourseAssemblyLoader
 * ─────────────────────────────────────────────────────────
 * Premium "course assembling itself" loading experience.
 *
 * Visual layer: orbital progress ring + drifting ember particles +
 * animated module cards that build up one-by-one + phase tracker
 * with a sliding glow trail + a one-shot burst when phases switch.
 *
 * Copy layer: ~50 dry, first-person lines per phase, typed in
 * character-by-character with a blinking cursor, refreshed every
 * ~3.5s. Module-aware lines slot in once the backend tells us
 * which module is being written.
 *
 * Driven entirely from `progressMessage`, `completedModules`,
 * and `totalModules` — same prop interface as before, both call
 * sites (landing page + dashboard generate tab) keep working.
 * ─────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Layers,
  PenLine,
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

const COPY_BY_PHASE: Record<Phase, string[]> = {
  skeleton: [
    "Sketching the shape of {topic}…",
    "Deciding what Module 1 should make you feel…",
    "Reading three textbooks about {topic} at once…",
    "Wait — should this start easy or throw you in the deep end?",
    "Figuring out what a beginner actually needs to hear first…",
    "Pretending I know what I'm doing (I kind of do)…",
    "Outlining {topic} like it's a Netflix series…",
    "Debating whether 6 modules is too few or 12 is too many…",
    "Mapping out {topic} so it actually makes sense…",
    "Trying to make {topic} sound exciting from the first line…",
    "Structuring this so nobody drops off at Module 3…",
    "Building the skeleton — the one that holds everything together…",
    "Deciding the order you'll learn {topic} in. It matters more than you'd think…",
    "Staring at a blank outline. Give me a second…",
  ],
  modules: [
    "Writing this one — I think it's actually fun…",
    "Trying not to overuse the word 'basically'…",
    "Looking for a better example than the one I just wrote…",
    "Arguing with myself about whether quiz 3 is too easy…",
    "Making sure Module 2 doesn't repeat Module 1. Again.",
    "Rewriting that paragraph because I didn't like it either.",
    "Convincing myself this metaphor works…",
    "Teaching {topic} the way I wish someone taught me…",
    "Writing a quiz question I actually want to answer…",
    "Sneaking in one more good example…",
    "This module on {topic} is turning out better than expected…",
    "Adding a practical exercise that isn't boring…",
    "Cutting the fluff. Nobody needs filler.",
    "Writing the part about {topic} that most courses get wrong…",
    "Double-checking that the examples don't all sound the same…",
  ],
  polish: [
    "Polishing the edges. Almost there…",
    "Double-checking nobody will fall asleep in Module 5…",
    "Making sure the audio narrator doesn't sound bored…",
    "Tidying up the roadmap…",
    "One last pass — this is the fun part…",
    "Putting the finishing touches on {topic}…",
    "Reading the whole thing back. Looking good…",
    "Checking that the quizzes actually test what we taught…",
    "Making {topic} look like it took weeks to write…",
    "Almost done. This one's actually good…",
    "Smoothing out the transitions between modules…",
    "Last sanity check. Stand by…",
  ],
};

function interpolate(line: string, topic: string, moduleTitle?: string): string {
  return line
    .replace(/\{topic\}/g, topic)
    .replace(/\{moduleTitle\}/g, moduleTitle || "this module");
}

/* ─── Module-aware progress parsing ───────────────────────── */

const MODULE_REGEX = /Writing module (\d+) of (\d+): (.+)/i;

function parseModule(progressMessage?: string): { index: number; total: number; title: string } | null {
  if (!progressMessage) return null;
  const m = progressMessage.match(MODULE_REGEX);
  if (!m) return null;
  return {
    index: parseInt(m[1], 10),
    total: parseInt(m[2], 10),
    title: m[3].replace(/\.\.\.$/, "").trim(),
  };
}

/* Lines that get mixed into the rotation when a module title is known. */
const MODULE_DYNAMIC_COPY = [
  "Deep into '{moduleTitle}' — this one's meaty…",
  "'{moduleTitle}' is the chapter everyone will remember…",
  "Almost done with '{moduleTitle}'. Moving on…",
  "Handcrafting the lessons inside '{moduleTitle}'…",
  "Stress-testing the examples in '{moduleTitle}'…",
];

/* ─── Phase chip definitions ──────────────────────────────── */

const PHASE_TRACK: { key: Phase; label: string; Icon: React.ElementType }[] = [
  { key: "skeleton", label: "Skeleton", Icon: Layers },
  { key: "modules", label: "Modules", Icon: PenLine },
  { key: "polish", label: "Polish", Icon: Wand2 },
];

/* ─── Eased fake progress ─────────────────────────────────── */

/**
 * Smoothly climbing fake progress that feels alive even while we're waiting
 * for the first real backend signal. Curve: fast at the very start (so the
 * ring snaps to "we're working"), slow through the middle (avoids cresting
 * 90% before real data arrives), small organic kicks every few seconds so
 * the eye never sees a stall.
 */
function easedFakePercent(elapsedSec: number): number {
  // Cap at 88% — we never want fake progress to hit the visual top before
  // the backend has confirmed completion of at least the skeleton.
  const ceiling = 88;
  // Logistic-ish curve normalized to (0,1) over ~120s
  const k = 0.045;
  const x0 = 35; // midpoint
  const sig = 1 / (1 + Math.exp(-k * (elapsedSec - x0)));
  // Extra micro-jitter so nothing freezes for >5s on a stall
  const wobble = Math.sin(elapsedSec * 0.6) * 0.6;
  return Math.min(ceiling, Math.round(8 + sig * 80 + wobble));
}

/* ─── Typewriter hook ─────────────────────────────────────── */

/**
 * Types `text` character-by-character over `typingMs`, holds `holdMs`,
 * then signals "done" so the parent can swap to the next line.
 * Handles cursor blink while typing/holding.
 */
function useTypewriter(text: string, typingMs: number, holdMs: number, onDone: () => void) {
  const [shown, setShown] = useState("");
  const [cursorOn, setCursorOn] = useState(true);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    setShown("");
    if (!text) return;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / typingMs);
      const charCount = Math.floor(progress * text.length);
      setShown(text.slice(0, charCount));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setShown(text);
        const id = window.setTimeout(() => onDoneRef.current(), holdMs);
        return () => window.clearTimeout(id);
      }
    };
    raf = requestAnimationFrame(tick);

    // Cleanup on text/timing change
    const holdTimer = window.setTimeout(() => onDoneRef.current(), typingMs + holdMs);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(holdTimer);
    };
  }, [text, typingMs, holdMs]);

  // Cursor blink (independent of typing)
  useEffect(() => {
    const id = window.setInterval(() => setCursorOn((c) => !c), 480);
    return () => window.clearInterval(id);
  }, []);

  return { shown, cursorOn };
}

/* ─── Orbital progress ring ───────────────────────────────── */

/**
 * Brand-anchored progress ring. Colors mirror the site's primary CTA gradient
 * (violet-500 → violet-600 → indigo-600 → indigo-500), so the loader feels
 * like a continuation of the marketing surface, not a separate visual island.
 *
 * Layered for depth:
 *   1. A wide blurred halo behind the ring (the "glow under the glass").
 *   2. A faint inner decorative track (slowly rotating dotted dashes).
 *   3. The base track ring (subtle white stroke).
 *   4. The progress arc (gradient stroke + drop-shadow glow).
 *   5. A small orb riding the head of the progress arc.
 *   6. A center plate with the % readout and a phase chip beneath it.
 */
function OrbitalRing({
  percent,
  phase,
  size,
  reduced,
}: {
  percent: number;
  phase: Phase;
  size: number;
  reduced: boolean;
}) {
  const stroke = Math.max(6, Math.round(size * 0.055));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;
  const PhaseIcon = PHASE_TRACK.find((p) => p.key === phase)?.Icon ?? Layers;
  const PhaseLabel = PHASE_TRACK.find((p) => p.key === phase)?.label ?? "Working";

  // Position of the orb that rides the head of the progress arc.
  // SVG starts the arc at 12 o'clock (because we rotate -90deg), so angle θ is
  // measured from the top, going clockwise.
  const theta = (clamped / 100) * 2 * Math.PI;
  const cx = size / 2 + radius * Math.sin(theta);
  const cy = size / 2 - radius * Math.cos(theta);

  // Inner decorative ring radius
  const innerR = radius - stroke * 1.6;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow halo — brand violet→indigo, no fuchsia */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full blur-3xl bg-gradient-to-br from-violet-500/35 via-violet-600/25 to-indigo-500/30 pointer-events-none"
      />
      {/* Tighter inner glow for depth */}
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full blur-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/15 pointer-events-none"
      />

      <svg
        width={size}
        height={size}
        className="relative"
        aria-hidden
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          {/* Brand gradient: violet-500 → violet-600 → indigo-600 → indigo-500 */}
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <radialGradient id="ring-plate" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.10)" />
            <stop offset="60%" stopColor="rgba(139,92,246,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Center plate fill (subtle violet wash) */}
        <circle cx={size / 2} cy={size / 2} r={innerR} fill="url(#ring-plate)" />

        {/* Inner decorative dashed ring — slow counter-rotation */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          fill="none"
          stroke="rgba(167,139,250,0.20)"
          strokeWidth={1}
          strokeDasharray="2 6"
          style={{ transformOrigin: "center" }}
          animate={reduced ? undefined : { rotate: -360 }}
          transition={reduced ? undefined : { duration: 24, repeat: Infinity, ease: "linear" }}
        />

        {/* Base track ring (rotated -90 so progress starts at 12 o'clock) */}
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: "drop-shadow(0 0 14px rgba(124,58,237,0.65))" }}
          />
        </g>

        {/* Orb at the head of the progress arc */}
        {clamped > 1 && (
          <g style={{ filter: "drop-shadow(0 0 8px rgba(139,92,246,0.9))" }}>
            <circle cx={cx} cy={cy} r={stroke * 0.55} fill="#ede9fe" />
            <circle cx={cx} cy={cy} r={stroke * 0.32} fill="#c4b5fd" />
          </g>
        )}
      </svg>

      {/* Center plate content: % + phase chip */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-1.5"
          animate={reduced ? undefined : { scale: [1, 1.03, 1], opacity: [0.92, 1, 0.92] }}
          transition={reduced ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-baseline gap-0.5">
            <span
              className="font-bold tabular-nums bg-gradient-to-br from-white via-violet-100 to-indigo-200 bg-clip-text text-transparent leading-none"
              style={{ fontSize: Math.round(size * 0.22) }}
            >
              {Math.round(percent)}
            </span>
            <span
              className="font-semibold text-violet-300/80 leading-none"
              style={{ fontSize: Math.round(size * 0.085) }}
            >
              %
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 backdrop-blur-sm">
            <PhaseIcon
              className="text-violet-200"
              strokeWidth={1.8}
              style={{ width: Math.round(size * 0.06), height: Math.round(size * 0.06) }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200/90">
              {PhaseLabel}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Module cards build-up ───────────────────────────────── */

function ModuleCards({
  total,
  completed,
  activeIdx,
  knownTitles,
  phase,
  reduced,
}: {
  total: number;
  completed: number;
  activeIdx: number; // 1-based index of the module currently being written, 0 if none
  knownTitles: Map<number, string>;
  phase: Phase;
  reduced: boolean;
}) {
  // In skeleton phase we don't yet know N — render 4 shimmer placeholders.
  const skeletonMode = total === 0 || phase === "skeleton";
  const count = skeletonMode ? 4 : Math.min(total, 12);

  return (
    <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => {
        const moduleNum = i + 1;
        const isDone = !skeletonMode && moduleNum <= completed;
        const isActive = !skeletonMode && moduleNum === activeIdx;
        const title = knownTitles.get(moduleNum);

        return (
          <motion.div
            key={i}
            initial={reduced ? false : { opacity: 0, x: -16, scale: 0.97 }}
            animate={{
              opacity: skeletonMode ? 0.55 : isDone ? 0.85 : isActive ? 1 : 0.42,
              x: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.55,
              delay: reduced ? 0 : i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm p-3 sm:p-3.5 ${
              isDone
                ? "border-emerald-500/35 bg-emerald-500/[0.05]"
                : isActive
                  ? "border-violet-500/50 bg-violet-500/[0.10] shadow-[0_0_28px_-6px_rgba(139,92,246,0.55)]"
                  : "border-white/5 bg-white/[0.025]"
            }`}
          >
            {/* Active glow ring */}
            {isActive && !reduced && (
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-xl border border-violet-400/40 pointer-events-none"
                animate={{ opacity: [0.25, 0.65, 0.25] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Skeleton shimmer */}
            {skeletonMode && !reduced && (
              <motion.div
                aria-hidden
                className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-violet-300/10 to-transparent pointer-events-none"
                animate={{ x: ["0%", "300%"] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.18,
                }}
              />
            )}

            <div className="relative flex items-start gap-2.5">
              <div
                className={`flex items-center justify-center size-7 rounded-lg shrink-0 text-[11px] font-bold ${
                  isDone
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : isActive
                      ? "bg-violet-500/25 text-violet-200 border border-violet-500/40"
                      : "bg-white/5 text-slate-500 border border-white/5"
                }`}
              >
                {isDone ? <CheckCircle2 className="size-3.5" /> : moduleNum}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <p
                  className={`text-xs sm:text-[13px] font-medium truncate ${
                    isDone
                      ? "text-emerald-200/80"
                      : isActive
                        ? "text-violet-100"
                        : "text-slate-500"
                  }`}
                >
                  {title ?? (skeletonMode ? `Module ${moduleNum}` : `Module ${moduleNum}`)}
                </p>
                {/* Progress sweeper */}
                {isActive && !reduced ? (
                  <motion.div
                    className="h-1 rounded-full bg-gradient-to-r from-violet-500 via-violet-400 to-indigo-500"
                    style={{ width: "70%", transformOrigin: "left center" }}
                    animate={{ scaleX: [0, 1, 1, 0] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      times: [0, 0.45, 0.85, 1],
                    }}
                  />
                ) : (
                  <div
                    className={`h-1 rounded-full ${
                      isDone ? "bg-emerald-400/35" : "bg-white/[0.05]"
                    }`}
                    style={{ width: isDone ? "70%" : "55%" }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Floating ember particles (desktop only) ─────────────── */

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: 4 + ((i * 47) % 92),
  top: 60 + ((i * 31) % 35), // start mostly in the lower half — drift upward
  size: 2 + ((i * 7) % 4),
  duration: 4 + ((i * 11) % 30) / 10,
  delay: (i * 0.18) % 4,
  hue: i % 3, // 0 violet, 1 violet-deep, 2 indigo
}));

const PARTICLE_COLORS = [
  "rgba(196,181,253,0.85)", // violet-300
  "rgba(167,139,250,0.75)", // violet-400
  "rgba(165,180,252,0.7)",  // indigo-300
];

function EmberParticles({ density }: { density: number }) {
  // density in [0..1] — modules phase = 1, skeleton = 0.5, polish = 0.3
  const visible = Math.max(4, Math.round(PARTICLES.length * density));
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ mixBlendMode: "screen" }}
    >
      {PARTICLES.slice(0, visible).map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: PARTICLE_COLORS[p.hue],
            boxShadow: `0 0 ${p.size * 3}px ${PARTICLE_COLORS[p.hue]}`,
          }}
          animate={{
            y: [0, -90 - (i % 5) * 12, -160 - (i % 4) * 18],
            opacity: [0, 0.85, 0],
            scale: [0.6, 1.05, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Phase transition burst ──────────────────────────────── */

function PhaseBurst({ trigger }: { trigger: number }) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          key={trigger}
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 1, scale: 0.4 }}
          animate={{ opacity: 0, scale: 2.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ mixBlendMode: "screen" }}
        >
          <div className="size-32 rounded-full border-2 border-violet-300/70 shadow-[0_0_60px_18px_rgba(167,139,250,0.55)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Phase tracker ───────────────────────────────────────── */

function PhaseChips({ phaseIdx, reduced }: { phaseIdx: number; reduced: boolean }) {
  return (
    <div className="relative max-w-md mx-auto grid grid-cols-3 gap-2">
      {PHASE_TRACK.map((p, i) => {
        const isActive = i === phaseIdx;
        const isDone = i < phaseIdx;
        const Icon = p.Icon;
        return (
          <div
            key={p.key}
            className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-colors duration-500 ${
              isActive
                ? "bg-violet-500/10 border-violet-500/45 text-violet-200"
                : isDone
                  ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-300"
                  : "bg-white/[0.02] border-white/5 text-slate-500"
            }`}
          >
            <Icon className={`size-4 ${isActive ? "animate-pulse" : ""}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {p.label}
            </span>
            {isActive && !reduced && (
              <motion.div
                aria-hidden
                layoutId="phase-active-glow"
                className="absolute inset-0 rounded-xl border border-violet-300/50 pointer-events-none shadow-[0_0_24px_-4px_rgba(167,139,250,0.6)]"
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
              />
            )}
          </div>
        );
      })}
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
  const reduced = useReducedMotion() ?? false;

  /* ── Desktop / mobile gate (avoids hydration flicker) ── */
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* ── Module-aware state ─────────────────────────────── */
  const parsedModule = useMemo(() => parseModule(progressMessage), [progressMessage]);

  // Accumulate module titles as they appear in `progressMessage`. This is the
  // only place we ever learn module names — last-writer-wins from the backend,
  // so we hold onto each one we see.
  const [knownTitles, setKnownTitles] = useState<Map<number, string>>(new Map());
  useEffect(() => {
    if (!parsedModule) return;
    setKnownTitles((prev) => {
      if (prev.get(parsedModule.index) === parsedModule.title) return prev;
      const next = new Map(prev);
      next.set(parsedModule.index, parsedModule.title);
      return next;
    });
  }, [parsedModule]);

  /* ── Copy rotation w/ typewriter ────────────────────── */
  const phaseCopy = useMemo(() => {
    const base = COPY_BY_PHASE[phase];
    if (phase === "modules" && parsedModule) {
      // Mix the dynamic module-aware lines into the rotation
      return [...base, ...MODULE_DYNAMIC_COPY];
    }
    return base;
  }, [phase, parsedModule]);

  const [copyIdx, setCopyIdx] = useState(0);
  // Reset index when phase changes so we don't carry over a stale slot
  useEffect(() => {
    setCopyIdx(0);
  }, [phase]);

  const currentLine = useMemo(
    () =>
      interpolate(
        phaseCopy[copyIdx % phaseCopy.length],
        safeTopic,
        parsedModule?.title,
      ),
    [phaseCopy, copyIdx, safeTopic, parsedModule],
  );

  // Typing duration scales loosely with line length so longer lines don't
  // type painfully slow per-char and short lines don't snap-in.
  const typingMs = Math.max(900, Math.min(2200, currentLine.length * 32));
  const holdMs = 1500;
  const handleLineDone = () => setCopyIdx((n) => (n + 1) % phaseCopy.length);
  const { shown: typedLine, cursorOn } = useTypewriter(
    currentLine,
    typingMs,
    holdMs,
    handleLineDone,
  );

  /* ── Elapsed time ───────────────────────────────────── */
  const startRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    startRef.current = performance.now();
    const id = window.setInterval(() => {
      if (startRef.current != null) {
        setElapsed(Math.floor((performance.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  /* ── Eased progress that also lerps toward real % ───── */
  const hasReal = totalModules > 0;
  const realTarget = hasReal
    ? Math.min(96, Math.round(12 + (completedModules / totalModules) * 84))
    : null;
  const fakeTarget = easedFakePercent(elapsed);
  // When we have real data, prefer it but never let the bar "jump back".
  const target = realTarget != null ? Math.max(realTarget, fakeTarget * 0.6) : fakeTarget;

  // Smooth display: lerp displayed percent toward target so micro-jumps feel
  // like one continuous climb. Also enforces "never stalls > 5s" via the
  // ever-rising `easedFakePercent` baseline above.
  const [displayPercent, setDisplayPercent] = useState(target);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setDisplayPercent((cur) => {
        const next = cur + (target - cur) * 0.08;
        return Math.abs(target - next) < 0.05 ? target : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  /* ── Phase chip + burst trigger ─────────────────────── */
  const phaseIdx = PHASE_TRACK.findIndex((p) => p.key === phase);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const prevPhaseRef = useRef<Phase>(phase);
  useEffect(() => {
    if (prevPhaseRef.current !== phase) {
      prevPhaseRef.current = phase;
      setBurstTrigger((n) => n + 1);
    }
  }, [phase]);

  /* ── Density of particles per phase ─────────────────── */
  const particleDensity = phase === "modules" ? 1 : phase === "polish" ? 0.35 : 0.55;

  /* ── Headline ───────────────────────────────────────── */
  const headline = (() => {
    if (phase === "skeleton") return "Designing the course skeleton";
    if (phase === "polish") return "Polishing your course";
    if (parsedModule) {
      return `Writing module ${parsedModule.index} of ${parsedModule.total}`;
    }
    if (hasReal) {
      const current = Math.min(completedModules + 1, totalModules);
      return `Writing module ${current} of ${totalModules}`;
    }
    return "Writing your modules";
  })();

  const activeModuleIdx = parsedModule?.index ?? Math.min(completedModules + 1, totalModules || 0);

  return (
    <div role="status" className="relative w-full max-w-4xl mx-auto">
      {/* Glow backdrop */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[420px] bg-gradient-radial from-violet-500/20 via-indigo-500/5 to-transparent blur-3xl pointer-events-none"
      />

      <div className="relative px-4 py-8 sm:py-10">
        {/* Status pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-medium text-violet-200 backdrop-blur-sm">
            <Sparkles className="size-3.5 animate-pulse" />
            Live generation
          </div>
        </div>

        {/* Topic heading */}
        <h2 className="mt-4 text-center text-2xl sm:text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-white via-violet-100 to-violet-200 bg-clip-text text-transparent">
          {safeTopic}
        </h2>

        {/* Hero region: ring + headline/typewriter side-by-side on tablet+ */}
        <div className="relative mt-6 sm:mt-8">
          {isDesktop && !reduced && <EmberParticles density={particleDensity} />}
          <PhaseBurst trigger={burstTrigger} />

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            {/* Ring */}
            <div className="shrink-0">
              <OrbitalRing
                percent={displayPercent}
                phase={phase}
                size={isDesktop ? 200 : 156}
                reduced={reduced}
              />
              <div className="mt-3 text-center text-[11px] text-muted-foreground/80 tabular-nums">
                <span>
                  {hasReal
                    ? `${Math.min(completedModules, totalModules)} of ${totalModules} modules`
                    : "Warming up…"}
                </span>
                <span className="mx-1.5 opacity-40">·</span>
                <span>{elapsed}s</span>
              </div>
            </div>

            {/* Headline + typewriter */}
            <div className="flex-1 min-w-0 max-w-md text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-300/90">
                {headline}
              </p>
              <div
                aria-live="polite"
                aria-atomic="true"
                className="mt-2 min-h-[60px] sm:min-h-[72px]"
              >
                <p className="text-base sm:text-lg leading-snug text-violet-50/90 italic">
                  {typedLine}
                  <span
                    className={`ml-0.5 inline-block w-[2px] align-baseline -translate-y-[1px] ${
                      cursorOn ? "bg-violet-300" : "bg-transparent"
                    }`}
                    style={{ height: "1em" }}
                    aria-hidden
                  />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Module cards build-up */}
        <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
          <ModuleCards
            total={totalModules}
            completed={completedModules}
            activeIdx={activeModuleIdx}
            knownTitles={knownTitles}
            phase={phase}
            reduced={reduced}
          />
        </div>

        {/* Phase tracker */}
        <div className="mt-8">
          <PhaseChips phaseIdx={phaseIdx} reduced={reduced} />
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-center text-[11px] text-muted-foreground/70 max-w-md mx-auto leading-relaxed">
          Your course is being built in the background. You can safely stay on
          this page — we&apos;ll show it the moment it&apos;s ready. Complex
          courses take a little longer.
        </p>
      </div>
    </div>
  );
}
