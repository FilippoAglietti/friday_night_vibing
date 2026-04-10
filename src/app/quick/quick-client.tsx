"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Check,
  Copy,
  Share2,
  ExternalLink,
  RotateCcw,
  Layers,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Quick outline templates (client-side, no API needed) ── */

interface QuickOutline {
  title: string;
  subtitle: string;
  modules: { title: string; lessons: string[] }[];
  duration: string;
  level: string;
}

function generateQuickOutline(topic: string): QuickOutline {
  const t = topic.trim();
  const titleCased = t.charAt(0).toUpperCase() + t.slice(1);

  // Generate structured outline based on topic patterns
  const modules = [
    {
      title: `Foundations of ${titleCased}`,
      lessons: [
        "Core concepts & terminology",
        "Historical context & evolution",
        "Key frameworks to know",
      ],
    },
    {
      title: "Essential Skills & Techniques",
      lessons: [
        "Hands-on fundamentals",
        "Common patterns & best practices",
        "Tools of the trade",
      ],
    },
    {
      title: "Intermediate Applications",
      lessons: [
        `Real-world ${titleCased.toLowerCase()} projects`,
        "Problem-solving strategies",
        "Case studies & analysis",
      ],
    },
    {
      title: "Advanced Strategies",
      lessons: [
        "Expert-level techniques",
        "Scaling & optimization",
        "Building your portfolio",
      ],
    },
    {
      title: `Mastering ${titleCased}`,
      lessons: [
        "Industry trends & future outlook",
        "Career & monetization paths",
        "Your personal action plan",
      ],
    },
  ];

  return {
    title: `The Complete Guide to ${titleCased}`,
    subtitle: `Everything you need to go from beginner to confident practitioner in ${titleCased.toLowerCase()}.`,
    modules,
    duration: "12-15 hours",
    level: "Beginner to Advanced",
  };
}

/* ─── Outline Card (designed for screenshots) ────────────── */

function OutlineCard({ outline }: { outline: QuickOutline }) {
  return (
    <div
      id="quick-outline-card"
      className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#0c0a1a] via-[#0f0b24] to-[#0a0a1a] p-6 sm:p-8 max-w-lg mx-auto shadow-2xl shadow-violet-500/10"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
          <GraduationCap className="size-4" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          syllabi.online
        </span>
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1.5">
        {outline.title}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {outline.subtitle}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="size-3 text-violet-400" />
          {outline.modules.length} modules
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="size-3 text-violet-400" />
          {outline.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3 text-violet-400" />
          {outline.duration}
        </span>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {outline.modules.map((mod, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="rounded-lg border border-violet-500/10 bg-white/[0.02] p-3"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="flex size-5 items-center justify-center rounded-md bg-violet-500/15 text-[10px] font-bold text-violet-400">
                {i + 1}
              </span>
              <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
            </div>
            <ul className="pl-7 space-y-0.5">
              {mod.lessons.map((lesson, j) => (
                <li key={j} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="size-2.5 text-violet-400/60 shrink-0" />
                  {lesson}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-violet-500/10 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/50">
          Generated with syllabi.online
        </span>
        <span className="text-[10px] font-medium text-violet-400/60">
          {outline.level}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */

export default function QuickCourseClient() {
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState<QuickOutline | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(() => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    // Simulate brief generation delay for effect
    setTimeout(() => {
      setOutline(generateQuickOutline(topic));
      setIsGenerating(false);
    }, 800);
  }, [topic]);

  const handleReset = useCallback(() => {
    setTopic("");
    setOutline(null);
    inputRef.current?.focus();
  }, []);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/quick`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const shareText = outline
    ? `I just generated a course outline for "${topic}" in seconds with @syllabi_ai\n\nCheck it out: syllabi.online/quick`
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Background */}
      <div className="absolute inset-0 h-[600px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative border-b border-transparent bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.online</span></span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Build full course &rarr;
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 py-12 sm:py-20">
        <AnimatePresence mode="wait">
          {!outline ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Hero */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-medium text-violet-400 mb-6">
                <Sparkles className="size-3" />
                No signup needed
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
                Course in a Tweet
              </h1>
              <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
                Type any topic. Get a screenshot-ready course outline in seconds.
              </p>

              {/* Input */}
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. Product Management"
                  className="flex-1 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                  autoFocus
                />
                <Button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || isGenerating}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all px-5"
                >
                  {isGenerating ? (
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Generate
                      <ArrowRight className="size-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Example topics */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {["Product Management", "Machine Learning", "Sourdough Baking", "UI Design", "Public Speaking"].map(
                  (example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setTopic(example);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-border/30 text-muted-foreground hover:text-foreground hover:border-violet-500/30 transition-colors"
                    >
                      {example}
                    </button>
                  )
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Result */}
              <OutlineCard outline={outline} />

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs gap-1.5"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? "Copied!" : "Copy link"}
                </Button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5">
                    <Share2 className="size-3" />
                    Share on X
                  </Button>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://syllabi.online/quick")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5">
                    <ExternalLink className="size-3" />
                    LinkedIn
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs gap-1.5 text-muted-foreground"
                  onClick={handleReset}
                >
                  <RotateCcw className="size-3" />
                  New topic
                </Button>
              </div>

              {/* Upsell CTA */}
              <div className="mt-10 rounded-xl border border-violet-500/15 bg-violet-500/5 p-5 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Want the full course with lessons, quizzes, and audio?
                </p>
                <Link href="/">
                  <Button className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20">
                    Build full course free
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
