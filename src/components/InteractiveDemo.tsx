"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Layers,
  Clock,
  Target,
  Sparkles,
  Check,
  Play,
  RotateCcw,
  FileText,
  Headphones,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── Demo Data ─────────────────────────────────────────── */

const DEMO_TOPIC = "UX Design for Product Managers";

const DEMO_MODULES = [
  {
    title: "Foundations of UX Thinking",
    lessons: 5,
    duration: "3.5h",
    objectives: [
      "Understand the double diamond design process",
      "Map user journeys and identify pain points",
    ],
  },
  {
    title: "User Research Methods",
    lessons: 4,
    duration: "3h",
    objectives: [
      "Conduct effective user interviews",
      "Synthesize qualitative research into actionable insights",
    ],
  },
  {
    title: "Wireframing & Prototyping",
    lessons: 6,
    duration: "4h",
    objectives: [
      "Build low-fidelity wireframes that communicate intent",
      "Create interactive prototypes for usability testing",
    ],
  },
  {
    title: "Design Systems & Handoff",
    lessons: 4,
    duration: "2.5h",
    objectives: [
      "Navigate component libraries and design tokens",
      "Write specifications that engineers actually read",
    ],
  },
  {
    title: "Measuring UX Impact",
    lessons: 3,
    duration: "2h",
    objectives: [
      "Define UX metrics tied to business outcomes",
      "Build a UX scorecard for stakeholder buy-in",
    ],
  },
];

const TYPING_SPEED = 45; // ms per character
const PHASE_DELAYS = {
  typing: DEMO_TOPIC.length * TYPING_SPEED + 500,
  generating: 2500,
  moduleReveal: 800, // per module
  complete: 1000,
};

type Phase = "idle" | "typing" | "generating" | "revealing" | "complete";

/* ─── Typing Animation ──────────────────────────────────── */

function TypingText({ text, onComplete }: { text: string; onComplete: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current++;
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, TYPING_SPEED);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <span>
      {displayed}
      <motion.span
        className="inline-block w-0.5 h-5 bg-violet-400 ml-0.5 align-text-bottom"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </span>
  );
}

/* ─── Module Card ───────────────────────────────────────── */

function ModuleCard({ module, index, show }: { module: typeof DEMO_MODULES[0]; index: number; show: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-violet-500/15 bg-card/30 backdrop-blur-sm p-4 hover:border-violet-500/30 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 shrink-0">
          <span className="text-xs font-bold text-violet-400">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold leading-tight">{module.title}</h4>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="size-3" />
              {module.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {module.duration}
            </span>
          </div>
          <ul className="mt-2 space-y-1">
            {module.objectives.map((obj, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={show ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.12 + 0.3 + i * 0.1 }}
                className="flex items-start gap-1.5 text-xs text-muted-foreground"
              >
                <Check className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                <span>{obj}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ────────────────────────────────────── */

export default function InteractiveDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [revealedModules, setRevealedModules] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startDemo = useCallback(() => {
    setPhase("typing");
    setRevealedModules(0);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setRevealedModules(0);
  }, []);

  const handleTypingComplete = useCallback(() => {
    setPhase("generating");
    timerRef.current = setTimeout(() => {
      setPhase("revealing");
    }, PHASE_DELAYS.generating);
  }, []);

  // Module reveal sequence
  useEffect(() => {
    if (phase !== "revealing") return;
    if (revealedModules >= DEMO_MODULES.length) {
      timerRef.current = setTimeout(() => setPhase("complete"), PHASE_DELAYS.complete);
      return;
    }
    timerRef.current = setTimeout(() => {
      setRevealedModules((n) => n + 1);
    }, PHASE_DELAYS.moduleReveal);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, revealedModules]);

  // Auto-start when idle for a while
  useEffect(() => {
    if (phase !== "idle") return;
    const autoStart = setTimeout(startDemo, 2000);
    return () => clearTimeout(autoStart);
  }, [phase, startDemo]);

  return (
    <div className="mx-auto max-w-2xl w-full">
      {/* Fake browser chrome */}
      <div className="rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm overflow-hidden shadow-2xl shadow-violet-500/5">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-card/40">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-rose-500/60" />
            <div className="size-2.5 rounded-full bg-amber-500/60" />
            <div className="size-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex-1 mx-8">
            <div className="mx-auto max-w-xs h-5 rounded-md bg-muted/30 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground/60 font-mono">syllabi.online</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-5 sm:p-6 space-y-4 min-h-[420px]">
          {/* Input field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">What do you want to teach?</label>
            <div className="rounded-lg border border-border/50 bg-background/50 px-4 py-3 text-sm">
              {phase === "idle" ? (
                <span className="text-muted-foreground/50">{DEMO_TOPIC}</span>
              ) : (
                <TypingText text={DEMO_TOPIC} onComplete={handleTypingComplete} />
              )}
            </div>
          </div>

          {/* Settings chips */}
          <AnimatePresence>
            {phase !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
              >
                <Badge variant="outline" className="rounded-full text-xs border-violet-500/20 bg-violet-500/5 text-violet-400">
                  Intermediate
                </Badge>
                <Badge variant="outline" className="rounded-full text-xs border-violet-500/20 bg-violet-500/5 text-violet-400">
                  Full Course
                </Badge>
                <Badge variant="outline" className="rounded-full text-xs border-violet-500/20 bg-violet-500/5 text-violet-400">
                  Hands-on
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generating animation */}
          <AnimatePresence mode="wait">
            {phase === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center py-8 gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
                  <div className="relative flex items-center justify-center size-12 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
                    <Sparkles className="size-5 text-violet-400 animate-pulse" />
                  </div>
                </div>
                <p className="text-sm font-medium text-violet-400 animate-pulse">
                  Building your course...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Course result */}
          <AnimatePresence>
            {(phase === "revealing" || phase === "complete") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {/* Course header */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm">{DEMO_TOPIC}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        A hands-on course for PMs who want to speak design fluently
                      </p>
                    </div>
                    <Badge className="rounded-full bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] shrink-0">
                      Intermediate
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3 text-violet-400" />
                      5 modules
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="size-3 text-violet-400" />
                      22 lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-violet-400" />
                      15h total
                    </span>
                    <span className="flex items-center gap-1">
                      <Headphones className="size-3 text-violet-400" />
                      Audio
                    </span>
                  </div>
                </motion.div>

                {/* Modules */}
                <div className="space-y-2">
                  {DEMO_MODULES.map((module, i) => (
                    <ModuleCard
                      key={i}
                      module={module}
                      index={i}
                      show={i < revealedModules}
                    />
                  ))}
                </div>

                {/* Completion badge */}
                {phase === "complete" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 py-3"
                  >
                    <div className="size-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="size-3 text-emerald-400" />
                    </div>
                    <span className="text-xs font-medium text-emerald-400">
                      Course ready in 45 seconds
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Replay / CTA */}
      <div className="flex items-center justify-center gap-3 mt-5">
        {phase === "complete" ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-xs text-muted-foreground"
              onClick={reset}
            >
              <RotateCcw className="size-3 mr-1.5" />
              Replay
            </Button>
          </>
        ) : phase === "idle" ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-xs text-violet-400 hover:text-violet-300"
            onClick={startDemo}
          >
            <Play className="size-3 mr-1.5" />
            Watch demo
          </Button>
        ) : null}
      </div>
    </div>
  );
}
