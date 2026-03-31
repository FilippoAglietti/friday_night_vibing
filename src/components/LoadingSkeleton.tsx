"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles, Brain, BookOpen, HelpCircle, Clock } from "lucide-react";

/* ─── Status messages with timing (ms) ───────────────────── */

const STATUS_STEPS = [
  { icon: Brain, text: "Analyzing your topic…", delay: 0 },
  { icon: BookOpen, text: "Structuring modules & lessons…", delay: 3000 },
  { icon: HelpCircle, text: "Generating quiz questions…", delay: 7000 },
  { icon: Clock, text: "Building pacing schedule…", delay: 11000 },
  { icon: Sparkles, text: "Polishing your curriculum…", delay: 15000 },
];

/* ─── Shimmer line component ─────────────────────────────── */

function ShimmerLine({ width, className = "" }: { width: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-muted/60 ${className}`}
      style={{ width, height: "12px" }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted/40 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function LoadingSkeleton() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STATUS_STEPS.slice(1).map((s, i) =>
      setTimeout(() => setStep(i + 1), s.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const CurrentIcon = STATUS_STEPS[step].icon;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Status indicator */}
      <motion.div
        className="flex flex-col items-center gap-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Animated spinner ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
          <div className="relative flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentIcon className="size-7 text-violet-500" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-medium text-violet-400"
          >
            {STATUS_STEPS[step].text}
          </motion.p>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {STATUS_STEPS.map((_, i) => (
            <div
              key={i}
              className={`size-1.5 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-violet-500" : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Skeleton cards */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Header card skeleton */}
        <Card className="border border-border/50 bg-card/30 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <ShimmerBlock className="size-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <ShimmerLine width="70%" className="h-5!" />
                <ShimmerLine width="45%" />
                <ShimmerLine width="90%" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <ShimmerBlock key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Module skeleton cards */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-border/50 bg-card/30 backdrop-blur-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <ShimmerBlock className="size-7 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <ShimmerLine width={`${65 - i * 10}%`} className="h-4!" />
                  <ShimmerLine width="30%" />
                </div>
              </div>
              {i === 1 && (
                <div className="space-y-2 pl-10">
                  <ShimmerLine width="85%" />
                  <ShimmerLine width="70%" />
                  <ShimmerLine width="60%" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
