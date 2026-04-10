"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, BookOpen, HelpCircle, Clock, Sparkles, Layers, FileText, Headphones } from "lucide-react";

/* ─── Build steps with realistic timing ─────────────────── */

const BUILD_STEPS = [
  { icon: Brain,       text: "Analyzing your topic...",              phase: "analyze",   duration: 4000  },
  { icon: Layers,      text: "Designing course structure...",        phase: "structure",  duration: 5000  },
  { icon: BookOpen,    text: "Building Module 1...",                 phase: "module",     duration: 4000  },
  { icon: BookOpen,    text: "Building Module 2...",                 phase: "module",     duration: 4500  },
  { icon: BookOpen,    text: "Building Module 3...",                 phase: "module",     duration: 4000  },
  { icon: HelpCircle,  text: "Generating quiz questions...",        phase: "quiz",       duration: 3500  },
  { icon: FileText,    text: "Writing lesson content...",           phase: "content",    duration: 5000  },
  { icon: Headphones,  text: "Preparing audio narration...",        phase: "audio",      duration: 3000  },
  { icon: Clock,       text: "Building pacing schedule...",         phase: "pacing",     duration: 2500  },
  { icon: Sparkles,    text: "Polishing your curriculum...",        phase: "polish",     duration: 3000  },
];

/* ─── Animated book page ────────────────────────────────── */

function BookPage({ index, total, isBuilding }: { index: number; total: number; isBuilding: boolean }) {
  const rotation = (index - total / 2) * 2;
  const delay = index * 0.15;

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ rotateY: -90, opacity: 0 }}
      animate={isBuilding ? {
        rotateY: [null, -90, rotation],
        opacity: [null, 0, 1],
      } : {
        rotateY: rotation,
        opacity: 1,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        transformOrigin: "left center",
        perspective: "800px",
      }}
    >
      <div
        className="h-full w-full rounded-r-md border border-violet-500/20 bg-gradient-to-br from-violet-950/80 via-indigo-950/60 to-slate-950/80 shadow-lg"
        style={{ transform: `translateZ(${index * 2}px)` }}
      >
        {/* Page lines shimmer */}
        <div className="p-3 space-y-2">
          {Array.from({ length: 4 + (index % 3) }).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-violet-500/10"
              style={{ width: `${60 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Floating particles ────────────────────────────────── */

function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-1 rounded-full bg-violet-400/30"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Progress ring ─────────────────────────────────────── */

function ProgressRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className="size-24 -rotate-90" viewBox="0 0 80 80">
      {/* Background ring */}
      <circle
        cx="40" cy="40" r="38"
        stroke="currentColor"
        className="text-violet-500/10"
        strokeWidth="3"
        fill="none"
      />
      {/* Progress ring */}
      <motion.circle
        cx="40" cy="40" r="38"
        stroke="url(#progressGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function LoadingSkeleton() {
  const [step, setStep] = useState(0);
  const [pagesRevealed, setPagesRevealed] = useState(0);
  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Step progression
  useEffect(() => {
    let cumulative = 0;
    const timers = BUILD_STEPS.slice(1).map((s, i) => {
      cumulative += BUILD_STEPS[i].duration;
      return setTimeout(() => setStep(i + 1), cumulative);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Page reveal animation (one new page every ~3.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setPagesRevealed((p) => Math.min(p + 1, 8));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min(((step + 1) / BUILD_STEPS.length) * 100, 99);
  const CurrentIcon = BUILD_STEPS[step].icon;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main animation area */}
      <div className="relative flex flex-col items-center gap-8 py-8">
        <Particles />

        {/* Book assembly visualization */}
        <div className="relative flex items-center justify-center">
          {/* Progress ring behind the book */}
          <div className="absolute">
            <ProgressRing progress={progress} />
          </div>

          {/* Animated book */}
          <div className="relative size-16" style={{ perspective: "600px" }}>
            {/* Book spine */}
            <motion.div
              className="absolute left-0 top-1 bottom-1 w-1.5 rounded-l-sm bg-gradient-to-b from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Pages flying in */}
            {Array.from({ length: pagesRevealed }).map((_, i) => (
              <BookPage key={i} index={i} total={8} isBuilding={true} />
            ))}

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center size-8 rounded-lg bg-violet-500/20 backdrop-blur-sm border border-violet-500/30"
                >
                  <CurrentIcon className="size-4 text-violet-400" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="flex flex-col items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="text-base font-semibold text-violet-400"
            >
              {BUILD_STEPS[step].text}
            </motion.p>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-64 h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Step counter and time */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="tabular-nums">
              Step {step + 1} of {BUILD_STEPS.length}
            </span>
            <span className="text-muted-foreground/30">|</span>
            <span className="tabular-nums">
              {elapsed}s elapsed
            </span>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5">
          {BUILD_STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === step ? 20 : 6,
                height: 6,
                backgroundColor: i <= step
                  ? i === step ? "#8b5cf6" : "#6366f1"
                  : "rgba(255,255,255,0.1)",
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Preview cards being assembled */}
      <motion.div
        className="space-y-3 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2, duration: 1 }}
      >
        {/* Course header assembling */}
        <motion.div
          className="rounded-xl border border-violet-500/10 bg-card/20 backdrop-blur-sm p-5 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: step >= 1 ? 0.8 : 0.3, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex items-start gap-3">
            <motion.div
              className="size-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 shrink-0"
              animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.9 }}
            />
            <div className="flex-1 space-y-2.5">
              <motion.div
                className="h-4 rounded bg-violet-500/15"
                animate={{ width: step >= 1 ? "70%" : "40%" }}
                transition={{ duration: 0.8 }}
              />
              <motion.div
                className="h-3 rounded bg-violet-500/8"
                animate={{ width: step >= 1 ? "90%" : "60%" }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Module cards appearing one by one */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-xl border border-violet-500/10 bg-card/20 backdrop-blur-sm p-4 overflow-hidden"
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={step >= 2 + i ? {
              opacity: 0.7,
              x: 0,
              scale: 1,
            } : {
              opacity: 0,
              x: -20,
              scale: 0.95,
            }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="size-7 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/15 flex items-center justify-center shrink-0"
                animate={step >= 2 + i ? { scale: [0.8, 1.1, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <span className="text-[10px] font-bold text-violet-400">{i + 1}</span>
              </motion.div>
              <div className="flex-1 space-y-2">
                <div className="h-3.5 rounded bg-violet-500/12" style={{ width: `${65 - i * 8}%` }} />
                <div className="h-2.5 rounded bg-violet-500/6" style={{ width: "45%" }} />
              </div>
              {step >= 5 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="shrink-0 size-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
                >
                  <svg className="size-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
