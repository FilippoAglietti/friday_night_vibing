"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BookOpen, Share2, Link2, FileText, FileCode2 } from "lucide-react";

const SAMPLE_TOPIC = "Python for data science";
const TYPE_SPEED_MS = 70;

function useInView<T extends Element>(amount = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: amount }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [amount]);

  return { ref, inView };
}

/* ─── Step 1: Typing the topic ─────────────────────────── */

function Step1Typing() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [text, setText] = useState("");
  const [submitPulse, setSubmitPulse] = useState(false);

  useEffect(() => {
    if (reduced) {
      setText(SAMPLE_TOPIC);
      return;
    }
    if (!inView) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (cancelled) return;
      setText("");
      setSubmitPulse(false);

      SAMPLE_TOPIC.split("").forEach((_, i) => {
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setText(SAMPLE_TOPIC.slice(0, i + 1));
          }, TYPE_SPEED_MS * (i + 1))
        );
      });

      const typeDuration = TYPE_SPEED_MS * SAMPLE_TOPIC.length;
      timers.push(setTimeout(() => !cancelled && setSubmitPulse(true), typeDuration + 700));
      timers.push(setTimeout(() => !cancelled && setSubmitPulse(false), typeDuration + 1200));
      timers.push(setTimeout(run, typeDuration + 3200));
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced, inView]);

  return (
    <div ref={ref} className="w-full h-[150px] md:h-[170px] flex items-center justify-center px-2">
      <div className="w-full max-w-[260px] flex flex-col gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-violet-500/30 bg-background/60 backdrop-blur-sm">
          <BookOpen className="size-4 text-violet-500 shrink-0" />
          <span className="text-sm text-foreground/90 truncate text-left flex-1">
            {text}
            {!reduced && (
              <motion.span
                aria-hidden
                className="inline-block w-[2px] h-3.5 ml-0.5 bg-violet-500 align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            )}
          </span>
        </div>
        <motion.div
          aria-hidden
          className="self-center px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/25"
          animate={
            submitPulse
              ? { scale: [1, 0.94, 1.05, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Generate course
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Step 2: Course assembly ──────────────────────────── */

function Step2Building() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const TOTAL = 4;
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (reduced) {
      setCompleted(TOTAL);
      return;
    }
    if (!inView) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (cancelled) return;
      setCompleted(0);
      for (let i = 1; i <= TOTAL; i++) {
        timers.push(setTimeout(() => !cancelled && setCompleted(i), 650 * i));
      }
      timers.push(setTimeout(run, 650 * TOTAL + 1700));
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced, inView]);

  const percent = Math.round((completed / TOTAL) * 100);

  return (
    <div ref={ref} className="w-full h-[150px] md:h-[170px] flex flex-col items-center justify-center gap-3 px-2">
      <div className="w-full max-w-[240px] flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-violet-500/15 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500"
            initial={{ width: "0%" }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="text-[10px] font-semibold tabular-nums bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent w-8 text-right">
          {percent}%
        </span>
      </div>

      <div className="w-full max-w-[240px] flex flex-col gap-1.5">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={
              i < completed
                ? { opacity: 1, x: 0 }
                : { opacity: 0.18, x: -12 }
            }
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-violet-500/25 bg-violet-500/[0.06]"
          >
            <span className="text-[9px] font-bold text-violet-500/70 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="h-1 flex-1 rounded-full bg-violet-500/20 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={i < completed ? { width: "100%" } : { width: "0%" }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-400"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 3: Share fan-out ────────────────────────────── */

const EXPORTS = [
  { Icon: Link2, label: "Link", x: -64, y: 6, delay: 0 },
  { Icon: FileText, label: "PDF", x: 0, y: -42, delay: 0.08 },
  { Icon: FileCode2, label: "Notion", x: 64, y: 6, delay: 0.16 },
] as const;

function Step3Sharing() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [phase, setPhase] = useState<"idle" | "click" | "fanout">("idle");

  useEffect(() => {
    if (reduced) {
      setPhase("fanout");
      return;
    }
    if (!inView) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (cancelled) return;
      setPhase("idle");
      timers.push(setTimeout(() => !cancelled && setPhase("click"), 900));
      timers.push(setTimeout(() => !cancelled && setPhase("fanout"), 1300));
      timers.push(setTimeout(run, 4400));
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced, inView]);

  const showFanout = phase === "fanout";
  const isClick = phase === "click";

  return (
    <div ref={ref} className="w-full h-[150px] md:h-[170px] flex items-center justify-center relative">
      <motion.div
        animate={isClick ? { scale: 0.96 } : { scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="w-[150px] rounded-xl border border-violet-500/30 bg-card/60 backdrop-blur-sm p-2.5 shadow-lg shadow-violet-500/10 relative z-10"
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="size-1.5 rounded-full bg-violet-500" />
          <div className="h-1 w-12 rounded-full bg-violet-500/40" />
        </div>
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-foreground/10" />
          <div className="h-1 w-3/4 rounded-full bg-foreground/10" />
          <div className="h-1 w-2/3 rounded-full bg-foreground/10" />
        </div>
        <motion.div
          className="mt-2.5 flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-semibold"
          animate={
            isClick
              ? {
                  boxShadow: [
                    "0 0 0 0 rgba(139,92,246,0)",
                    "0 0 0 8px rgba(139,92,246,0.35)",
                    "0 0 0 0 rgba(139,92,246,0)",
                  ],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
        >
          <Share2 className="size-2.5" />
          Share
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showFanout &&
          EXPORTS.map(({ Icon, label, x, y, delay }, i) => (
            <motion.div
              key={i}
              aria-hidden
              className="absolute top-1/2 left-1/2 flex flex-col items-center gap-0.5 z-0 pointer-events-none"
              initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.6 }}
              animate={{
                opacity: 1,
                x: `calc(-50% + ${x}px)`,
                y: `calc(-50% + ${y}px)`,
                scale: 1,
              }}
              exit={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.6 }}
              transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="size-8 rounded-lg border border-violet-500/30 bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-md shadow-violet-500/10">
                <Icon className="size-3.5 text-violet-500" />
              </div>
              <span className="text-[8px] font-medium text-muted-foreground">
                {label}
              </span>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Public component ─────────────────────────────────── */

export default function HowItWorksAnimation({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) return <Step1Typing />;
  if (step === 2) return <Step2Building />;
  return <Step3Sharing />;
}
