"use client";

import CurriculumForm from "@/components/CurriculumForm";
import CurriculumOutput from "@/components/CurriculumOutput";
import { useState, useEffect } from "react";
import type { Curriculum } from "@/types/curriculum";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Download,
  BookOpen,
  Clock,
  Brain,
  Target,
  Layers,
  ArrowRight,
  Check,
  X,
  ChevronRight,
  GraduationCap,
  LayoutGrid,
  FileText,
  Globe,
  MessageCircle,
  Mail,
  Sun,
  Moon,
} from "lucide-react";

/* ─── Animation Helpers ──────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Data ───────────────────────────────────────────────── */

const painPoints = [
  {
    icon: Clock,
    problem: "Hours wasted on blank outlines",
    solution:
      "Get a complete, structured curriculum in under 60 seconds — modules, lessons, quizzes, and pacing all done.",
  },
  {
    icon: Brain,
    problem: "No idea how to structure content",
    solution:
      "AI understands pedagogical best practices — it sequences topics logically so your students actually learn.",
  },
  {
    icon: Target,
    problem: "Courses feel random & disorganized",
    solution:
      "Every generated curriculum has clear objectives, progressive difficulty, and measurable learning outcomes.",
  },
];

const steps = [
  {
    num: "01",
    icon: BookOpen,
    title: "Enter your topic",
    desc: "Describe what you want to teach — from \"Python for data science\" to \"Sourdough baking 101\".",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "AI generates your curriculum",
    desc: "In seconds you get modules, lessons, quizzes, resources, and a pacing schedule — all editable.",
  },
  {
    num: "03",
    icon: Download,
    title: "Download & teach",
    desc: "Export to JSON, Markdown, or PDF. Drop it into your LMS, Notion, or start teaching today.",
  },
];

const exampleCurricula = [
  {
    title: "Machine Learning Fundamentals",
    modules: 8,
    lessons: 42,
    hours: 36,
    difficulty: "Intermediate" as const,
    tags: ["AI/ML", "Python", "Data Science"],
  },
  {
    title: "UX Research & Design Sprint",
    modules: 6,
    lessons: 28,
    hours: 22,
    difficulty: "Beginner" as const,
    tags: ["Design", "UX", "Research"],
  },
  {
    title: "Advanced TypeScript Patterns",
    modules: 10,
    lessons: 55,
    hours: 48,
    difficulty: "Advanced" as const,
    tags: ["TypeScript", "Engineering", "Architecture"],
  },
];

const freePlanFeatures = [
  { text: "1 curriculum generation", included: true },
  { text: "Basic modules & lessons", included: true },
  { text: "JSON export", included: true },
  { text: "Quizzes & assessments", included: false },
  { text: "Pacing schedules", included: false },
  { text: "Unlimited generations", included: false },
];

const proPlanFeatures = [
  { text: "Unlimited generations", included: true },
  { text: "Full modules, lessons & quizzes", included: true },
  { text: "JSON, Markdown & PDF export", included: true },
  { text: "Quizzes & assessments", included: true },
  { text: "Custom pacing schedules", included: true },
  { text: "Priority AI processing", included: true },
];

const difficultyColor: Record<string, string> = {
  Beginner:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Intermediate:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Advanced:
    "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

/* ─── Page ───────────────────────────────────────────────── */

export default function Home() {
  const [dark, setDark] = useState(true);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Respect user motion preference
  const anim = prefersReduced ? {} : fadeUp;
  const stagger = prefersReduced ? {} : staggerContainer;

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      {/* ── Ambient Gradient Background ─────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] rounded-full bg-violet-600/[0.07] blur-[120px] dark:bg-violet-500/[0.12]" />
        <div className="absolute -bottom-[30%] -right-[15%] h-[70vh] w-[70vh] rounded-full bg-cyan-500/[0.05] blur-[100px] dark:bg-cyan-400/[0.08]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[50vh] w-[50vh] rounded-full bg-fuchsia-500/[0.04] blur-[80px] dark:bg-fuchsia-400/[0.06]" />
      </div>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="#"
            id="nav-logo"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <GraduationCap className="size-5 text-violet-500" />
            <span>
              syllabi<span className="text-violet-500">.ai</span>
            </span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </a>
            <a
              href="#examples"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Examples
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button
              id="theme-toggle"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button
              id="nav-cta"
              className="hidden rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] sm:inline-flex"
              size="lg"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1">
        {/* ═══════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="relative flex items-center justify-center px-4 pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36"
        >
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={anim} custom={0}>
              <Badge
                variant="outline"
                className="mb-6 rounded-full border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-400"
              >
                <Sparkles className="mr-1.5 size-3" />
                AI-Powered Curriculum Design
              </Badge>
            </motion.div>

            <motion.h1
              variants={anim}
              custom={1}
              className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Turn Any Topic Into a
              <br />
              <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Complete Course Curriculum
              </span>
              <br />
              in Seconds
            </motion.h1>

            <motion.p
              variants={anim}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              AI-powered curriculum design for course creators, educators, and
              coaches. Stop staring at blank outlines — get a production-ready
              curriculum with modules, lessons, quizzes, and pacing.
            </motion.p>

            <motion.div
              variants={anim}
              custom={3}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                id="hero-cta"
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base font-semibold text-white border-0 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                Generate Your First Curriculum Free
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                id="hero-secondary"
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-8 text-base"
              >
                See Example Curricula
              </Button>
            </motion.div>

            <motion.p
              variants={anim}
              custom={4}
              className="mt-4 text-xs text-muted-foreground"
            >
              No credit card required · Free forever on the starter plan
            </motion.p>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════
            PROBLEM / SOLUTION
        ═══════════════════════════════════════════════════ */}
        <section
          id="problem-solution"
          className="relative px-4 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
            >
              <motion.p
                variants={anim}
                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                The Problem
              </motion.p>
              <motion.h2
                variants={anim}
                custom={1}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Building a course shouldn&apos;t feel like pulling teeth
              </motion.h2>
              <motion.p
                variants={anim}
                custom={2}
                className="mx-auto mt-4 max-w-2xl text-muted-foreground"
              >
                Course creators waste 40+ hours just on the outline. You know
                your material — you just need it structured into something
                students can follow.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-6 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {painPoints.map((p, i) => (
                <motion.div key={i} variants={anim} custom={i}>
                  <Card className="group relative h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5">
                    <CardHeader>
                      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                        <p.icon className="size-5 text-violet-500" />
                      </div>
                      <CardTitle className="text-base font-semibold text-destructive/80 dark:text-red-400 line-through decoration-muted-foreground/30">
                        {p.problem}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {p.solution}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════════ */}
        <section id="how-it-works" className="relative px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
            >
              <motion.p
                variants={anim}
                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                How It Works
              </motion.p>
              <motion.h2
                variants={anim}
                custom={1}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Three steps. Zero headaches.
              </motion.h2>
            </motion.div>

            <motion.div
              className="grid gap-8 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  variants={anim}
                  custom={i}
                  className="group relative"
                >
                  {/* Connector line — hidden on mobile, shown between cards */}
                  {i < steps.length - 1 && (
                    <div className="absolute top-12 -right-4 hidden h-px w-8 bg-gradient-to-r from-border to-transparent md:block" />
                  )}

                  <div className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-card/60">
                    {/* Step number */}
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-0.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25">
                      {s.num}
                    </span>

                    <div className="mt-4 mb-5 flex size-14 items-center justify-center rounded-2xl bg-violet-500/10">
                      <s.icon className="size-6 text-violet-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            TRY IT — CURRICULUM FORM / OUTPUT
        ═══════════════════════════════════════════════════ */}
        <section id="generate" className="relative px-4 py-20 sm:py-28">
          <motion.div
            className="mx-auto max-w-3xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            {!curriculum ? (
              <>
                <motion.div className="text-center mb-10" variants={anim}>
                  <p className="text-sm font-semibold uppercase tracking-widest text-violet-500">
                    Try It Now
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Generate your curriculum
                  </h2>
                </motion.div>
                <motion.div variants={anim} custom={1} className="mx-auto max-w-xl">
                  <CurriculumForm onGenerated={setCurriculum} />
                </motion.div>
              </>
            ) : (
              <motion.div variants={anim} key="output-view">
                <CurriculumOutput
                  curriculum={curriculum}
                  onGenerateAnother={() => setCurriculum(null)}
                />
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════
            EXAMPLE CURRICULA (SOCIAL PROOF)
        ═══════════════════════════════════════════════════ */}
        <section id="examples" className="relative px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
            >
              <motion.p
                variants={anim}
                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                Real Examples
              </motion.p>
              <motion.h2
                variants={anim}
                custom={1}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                See what Syllabi generates
              </motion.h2>
              <motion.p
                variants={anim}
                custom={2}
                className="mx-auto mt-4 max-w-2xl text-muted-foreground"
              >
                These curricula were generated in seconds. Each one includes
                modules, lessons, quizzes, bonus resources, and a full pacing
                schedule.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-6 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {exampleCurricula.map((c, i) => (
                <motion.div key={i} variants={anim} custom={i}>
                  <Card className="group h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`rounded-full text-[10px] font-semibold ${difficultyColor[c.difficulty]}`}
                        >
                          {c.difficulty}
                        </Badge>
                        <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                      </div>
                      <CardTitle className="mt-2 text-lg font-semibold leading-snug">
                        {c.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2.5">
                          <Layers className="mb-1 size-3.5 text-muted-foreground" />
                          <span className="text-sm font-semibold">
                            {c.modules}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Modules
                          </span>
                        </div>
                        <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2.5">
                          <FileText className="mb-1 size-3.5 text-muted-foreground" />
                          <span className="text-sm font-semibold">
                            {c.lessons}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Lessons
                          </span>
                        </div>
                        <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2.5">
                          <Clock className="mb-1 size-3.5 text-muted-foreground" />
                          <span className="text-sm font-semibold">
                            {c.hours}h
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Total
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {c.tags.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="rounded-full text-[10px]"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            PRICING
        ═══════════════════════════════════════════════════ */}
        <section id="pricing" className="relative px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
            >
              <motion.p
                variants={anim}
                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                Pricing
              </motion.p>
              <motion.h2
                variants={anim}
                custom={1}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Start free. Upgrade when you&apos;re ready.
              </motion.h2>
            </motion.div>

            <motion.div
              className="grid gap-6 md:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {/* FREE PLAN */}
              <motion.div variants={anim} custom={0}>
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Free
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      $0
                      <span className="text-base font-normal text-muted-foreground">
                        /forever
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Perfect for trying Syllabi out. No strings attached.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {freePlanFeatures.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2.5 text-sm"
                        >
                          {f.included ? (
                            <Check className="size-4 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="size-4 text-muted-foreground/40 shrink-0" />
                          )}
                          <span
                            className={
                              f.included ? "" : "text-muted-foreground/50"
                            }
                          >
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button
                      id="pricing-free-cta"
                      variant="outline"
                      className="w-full rounded-full"
                      size="lg"
                    >
                      Get Started Free
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* PRO PLAN */}
              <motion.div variants={anim} custom={1}>
                <Card className="relative h-full border-violet-500/30 bg-card/50 backdrop-blur-sm shadow-xl shadow-violet-500/5">
                  {/* Popular badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1 text-xs font-semibold text-white border-0 shadow-lg shadow-violet-500/25">
                      Most Popular
                    </Badge>
                  </div>
                  <CardHeader className="pt-6">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                      Pro
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      $29
                      <span className="text-base font-normal text-muted-foreground">
                        /month
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      For serious course creators who ship curricula regularly.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {proPlanFeatures.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2.5 text-sm"
                        >
                          <Check className="size-4 text-violet-500 shrink-0" />
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button
                      id="pricing-pro-cta"
                      className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02]"
                      size="lg"
                    >
                      Start Pro — $29/mo
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════ */}
        <section className="relative px-4 py-20 sm:py-28">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.div
              variants={anim}
              className="mx-auto rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-indigo-500/5 p-10 sm:p-16 backdrop-blur-sm"
            >
              <LayoutGrid className="mx-auto mb-4 size-8 text-violet-500" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to build your
                <br />
                first curriculum?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Join hundreds of course creators who save 40+ hours per course
                with Syllabi. Your first generation is free — no credit card, no
                catch.
              </p>
              <Button
                id="bottom-cta"
                size="lg"
                className="mt-8 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base font-semibold text-white border-0 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                Generate Your First Curriculum Free
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="col-span-1 lg:col-span-1">
              <a
                href="#"
                className="flex items-center gap-2 text-lg font-bold tracking-tight"
              >
                <GraduationCap className="size-5 text-violet-500" />
                <span>
                  syllabi<span className="text-violet-500">.ai</span>
                </span>
              </a>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                AI-powered curriculum generation for course creators, educators,
                and coaches.
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  href="#"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Twitter"
                >
                  <MessageCircle className="size-4" />
                </a>
                <a
                  href="#"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="GitHub"
                >
                  <Globe className="size-4" />
                </a>
                <a
                  href="#"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Email"
                >
                  <Mail className="size-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-foreground transition-colors"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="#examples"
                    className="hover:text-foreground transition-colors"
                  >
                    Examples
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold">Resources</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Changelog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Syllabi. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with ❤️ for course creators
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
