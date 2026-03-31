"use client";

import CurriculumForm from "@/components/CurriculumForm";
import CurriculumOutput from "@/components/CurriculumOutput";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import PaywallModal from "@/components/PaywallModal";
import AuthModal from "@/components/AuthModal";
import AuthButton from "@/components/AuthButton";
import { useToast } from "@/components/ToastProvider";
import { useState, useEffect, useCallback } from "react";
import type { Curriculum } from "@/types/curriculum";
import { exampleCurricula as fullExampleCurricula } from "@/data/exampleCurricula";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollProgress from "@/components/ScrollProgress";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase";
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
  Eye,
  X as XIcon,
  Crown,
  Mic,
  Headphones,
  Menu,
} from "lucide-react";

/* ─── Data ───────────────────────────────────────────────── */

const painPoints = [
  {
    icon: Clock,
    problem: "Hours wasted on blank outlines",
    solution:
      "Get a complete, structured course in under 60 seconds — modules, lessons, quizzes, and pacing all done.",
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
      "Every generated course has clear objectives, progressive difficulty, and measurable learning outcomes.",
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
    title: "AI generates your course",
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
  { text: "1 free mini-course generation", included: true },
  { text: "Basic modules & lessons", included: true },
  { text: "JSON export", included: true },
  { text: "Notion export", included: false },
  { text: "Quizzes & assessments", included: false },
  { text: "Unlimited generations", included: false },
];

const proPlanFeatures = [
  { text: "Unlimited generations", included: true },
  { text: "Full modules, lessons & quizzes", included: true },
  { text: "JSON, Markdown, PDF & Notion export", included: true },
  { text: "Quizzes & assessments", included: true },
  { text: "Custom pacing schedules", included: true },
  { text: "Priority AI processing", included: true },
];

const proMaxFeatures = [
  { text: "Everything in Pro", included: true },
  { text: "AI-generated audio lessons", included: true },
  { text: "Full chapter content generation", included: true },
  { text: "Premium Notion & PDF export", included: true },
  { text: "Sell-ready course packages", included: true },
  { text: "White-label branding", included: true },
  { text: "Dedicated AI processing", included: true },
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

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.scroll-animate, .scroll-animate-scale').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  // Registration is required before generating
  const [previewCurriculum, setPreviewCurriculum] = useState<Curriculum | null>(null);
  const { toast } = useToast();
  const closePreview = useCallback(() => setPreviewCurriculum(null), []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Track auth state
  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Check for checkout success/error in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast("Payment successful! You now have Pro access.", "success");
      window.history.replaceState({}, "", "/");
    } else if (params.get("checkout") === "cancelled") {
      toast("Checkout cancelled. You can try again anytime.", "info");
      window.history.replaceState({}, "", "/");
    } else if (params.get("auth_error") === "true") {
      toast("Sign in failed. Please try again.", "error");
      window.history.replaceState({}, "", "/");
    }
  }, [toast]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsGenerating(loading);
  }, []);

  const handleGenerated = useCallback((c: Curriculum) => {
    console.log("[DEBUG] handleGenerated called, data:", JSON.stringify(c)?.slice(0, 200));
    setCurriculum(c);
    toast("Course generated successfully!", "success");
  }, [toast]);

  const handleLimitReached = useCallback(() => {
    setShowPaywall(true);
  }, []);

  // Dev mode bypass: add ?dev=true to URL to skip auth (for testing before Supabase is configured)
  const isDevMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "true";

  const handleFormSubmitAttempt = useCallback(() => {
    // Skip auth check in dev mode
    if (isDevMode) return true;
    // Registration required before generating
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [user, isDevMode]);

  // Respect user motion preference

  // Parallax for ambient background
  const { scrollY } = useScroll();
  const bgY1 = useTransform(scrollY, [0, 3000], [0, -300]);
  const bgY2 = useTransform(scrollY, [0, 3000], [0, -150]);
  const bgY3 = useTransform(scrollY, [0, 3000], [0, -200]);

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      {/* ── Scroll Progress Bar ─────────────────────────── */}
      <ScrollProgress />

      {/* ── Ambient Gradient Background with Parallax ──── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <motion.div style={{ y: bgY1 }} className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] rounded-full bg-violet-600/[0.07] blur-[120px] dark:bg-violet-500/[0.12]" />
        <motion.div style={{ y: bgY2 }} className="absolute -bottom-[30%] -right-[15%] h-[70vh] w-[70vh] rounded-full bg-cyan-500/[0.05] blur-[100px] dark:bg-cyan-400/[0.08]" />
        <motion.div style={{ y: bgY3 }} className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[50vh] w-[50vh] rounded-full bg-fuchsia-500/[0.04] blur-[80px] dark:bg-fuchsia-400/[0.06]" />
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
            <AuthButton />
            <Button
              id="nav-cta"
              className="hidden rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] sm:inline-flex"
              size="lg"
              onClick={() => document.getElementById('generate')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started Free
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-4 py-3 space-y-1">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                How it works
              </a>
              <a
                href="#examples"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Examples
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Pricing
              </a>
              <div className="pt-2 pb-1">
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10 flex-1">
        {/* ═══════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="relative flex items-center justify-center px-4 pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36"
        >
          <div
            className="mx-auto max-w-4xl text-center"
          >
            <div>
              <div><Badge
                variant="outline"
                className="mb-6 rounded-full border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-400"
              >
                <Sparkles className="mr-1.5 size-3" />
                AI-Powered Course Design
              </Badge></div>
            </div>

            <h1
              className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Turn Any Topic Into a
              <br />
              <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Complete Course
              </span>
              <br />
              in Seconds
            </h1>

            <p


              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              AI-powered course design for course creators, educators, and
              coaches. Stop staring at blank outlines — get a production-ready
              course with modules, lessons, quizzes, and pacing.
            </p>

            <div


              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                id="hero-cta"
                size="lg"
                className="h-12 w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base font-semibold text-white border-0 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
                onClick={() => document.getElementById('generate')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Generate Your First Course Free
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                id="hero-secondary"
                variant="outline"
                size="lg"
                className="h-12 w-full sm:w-auto rounded-full px-8 text-base"
                onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See Example Courses
              </Button>
            </div>

            <p


              className="mt-4 text-xs text-muted-foreground"
            >
              No credit card required · Free forever on the starter plan
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            PROBLEM / SOLUTION
        ═══════════════════════════════════════════════════ */}
        <section
          id="problem-solution"
          className="relative px-4 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div
              className="text-center mb-16"
            >
              <p

                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                The Problem
              </p>
              <h2


                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Building a course shouldn&apos;t feel like pulling teeth
              </h2>
              <p


                className="mx-auto mt-4 max-w-2xl text-muted-foreground"
              >
                Course creators waste 40+ hours just on the outline. You know
                your material — you just need it structured into something
                students can follow.
              </p>
            </div>

            <div
              className="grid gap-6 md:grid-cols-3"
            >
              {painPoints.map((p, i) => (
                <div key={i}>
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════════ */}
        <section id="how-it-works" className="relative px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div
              className="text-center mb-16"
            >
              <p

                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                How It Works
              </p>
              <h2


                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Three steps. Zero headaches.
              </h2>
            </div>

            <div
              className="grid gap-8 md:grid-cols-3"
            >
              {steps.map((s, i) => (
                <div
                  key={i}
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            TRY IT — CURRICULUM FORM / OUTPUT
        ═══════════════════════════════════════════════════ */}
        <section id="generate" className="relative px-4 py-20 sm:py-28">
          <div
            className="mx-auto max-w-3xl"
          >
            {isGenerating ? (
              <LoadingSkeleton />
            ) : curriculum ? (
              <div
                key="output-view"
              >
                <CurriculumOutput
                  curriculum={curriculum}
                  onGenerateAnother={() => setCurriculum(null)}
                />
              </div>
            ) : (
              <>
                <div
                  className="text-center mb-10"
                >
                  <p className="text-sm font-semibold uppercase tracking-widest text-violet-500">
                    Try It Now
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Generate your course
                  </h2>
                </div>
                <div
                  className="mx-auto max-w-xl"
                >
                  <CurriculumForm
                    onGenerated={handleGenerated}
                    onLoadingChange={handleLoadingChange}
                    onLimitReached={handleLimitReached}
                    onSubmitAttempt={handleFormSubmitAttempt}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            EXAMPLE CURRICULA (SOCIAL PROOF)
        ═══════════════════════════════════════════════════ */}
        <section id="examples" className="relative px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div
              className="text-center mb-16"
            >
              <p

                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                Real Examples
              </p>
              <h2


                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                See what Syllabi can create
              </h2>
              <p


                className="mx-auto mt-4 max-w-2xl text-muted-foreground"
              >
                These courses were generated in seconds. Each one includes
                modules, lessons, quizzes, bonus resources, and a full pacing
                schedule.
              </p>
            </div>

            <div
              className="grid gap-6 md:grid-cols-3"
            >
              {exampleCurricula.map((c, i) => (
                <div key={i}>
                  <Card
                    className="group h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 cursor-pointer"
                    onClick={() => setPreviewCurriculum(fullExampleCurricula[i])}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`rounded-full text-[10px] font-semibold ${difficultyColor[c.difficulty]}`}
                        >
                          {c.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-violet-400 opacity-0 transition-all group-hover:opacity-100">
                          <Eye className="size-3.5" />
                          <span>Preview</span>
                        </div>
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            PRICING
        ═══════════════════════════════════════════════════ */}
        <section id="pricing" className="relative px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16 scroll-animate">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-500">
                Pricing
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Start free. Upgrade when you&apos;re ready.
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch overflow-visible">
              {/* FREE PLAN */}
              <div className="flex scroll-animate">
                <Card className="flex flex-col w-full border-border/50 bg-card/50 backdrop-blur-sm">
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
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {freePlanFeatures.map((f, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          {f.included ? (
                            <Check className="size-4 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="size-4 text-muted-foreground/40 shrink-0" />
                          )}
                          <span className={f.included ? "" : "text-muted-foreground/50"}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-0">
                    <Button
                      id="pricing-free-cta"
                      variant="outline"
                      className="w-full rounded-full"
                      size="lg"
                      onClick={() => document.getElementById('generate')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Get Started Free
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* PRO PLAN */}
              <div className="flex overflow-visible scroll-animate">
                <Card className="relative flex flex-col w-full overflow-visible border-violet-500/30 bg-card/50 backdrop-blur-sm shadow-xl shadow-violet-500/5">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white border-0 shadow-lg shadow-violet-500/25">
                      Most Popular
                    </Badge>
                  </div>
                  <CardHeader className="pt-8">
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
                      For serious course creators who ship regularly.
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {proPlanFeatures.map((f, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          <Check className="size-4 text-violet-500 shrink-0" />
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-0">
                    <Button
                      id="pricing-pro-cta"
                      className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02]"
                      size="lg"
                      onClick={() => setShowPaywall(true)}
                    >
                      Start Pro — $29/mo
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* 5-PACK ONE-TIME */}
              <div className="flex scroll-animate">
                <Card className="flex flex-col w-full border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-cyan-500">
                      One-Time
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      $39
                      <span className="text-base font-normal text-muted-foreground">
                        {" "}one-time
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      5 course generations. No subscription needed.
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {[
                        "5 course generations",
                        "Full modules, lessons & quizzes",
                        "JSON, Markdown, PDF & Notion export",
                        "Custom pacing schedules",
                        "No recurring charges",
                      ].map((text, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          <Check className="size-4 text-cyan-500 shrink-0" />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-0">
                    <Button
                      id="pricing-5pack-cta"
                      className="w-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02]"
                      size="lg"
                      onClick={() => setShowPaywall(true)}
                    >
                      Buy 5-Pack — $39
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* PRO MAX — COMING SOON */}
              <div className="flex scroll-animate">
                <Card className="relative flex flex-col w-full border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-card/50 to-card/50 backdrop-blur-sm shadow-xl shadow-amber-500/5 overflow-visible">
                  {/* Gold shimmer accent */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-1.5 text-xs font-semibold text-black border-0 shadow-lg shadow-amber-500/25">
                      Coming Soon
                    </Badge>
                  </div>
                  <CardHeader className="pt-8">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <Crown className="size-3.5" />
                      Pro Max
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      $79
                      <span className="text-base font-normal text-muted-foreground">
                        /month
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      The ultimate toolkit to create &amp; sell courses.
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {/* AI Audio highlight */}
                    <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-3">
                      <div className="flex items-center justify-center size-9 rounded-lg bg-amber-500/10">
                        <Headphones className="size-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-500">AI Audio Lessons</p>
                        <p className="text-[11px] text-muted-foreground">Generate narrated audio for every lesson</p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {proMaxFeatures.map((f, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          <Check className="size-4 text-amber-500 shrink-0" />
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-0">
                    <Button
                      disabled
                      className="w-full rounded-full bg-gradient-to-r from-amber-600/50 to-yellow-600/50 text-white/60 border-0 cursor-not-allowed"
                      size="lg"
                    >
                      <Crown className="size-4 mr-2" />
                      Coming Soon
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════ */}
        <section className="relative px-4 py-20 sm:py-28">
          <div
            className="mx-auto max-w-3xl text-center"
          >
            <div

              className="mx-auto rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-indigo-500/5 p-10 sm:p-16 backdrop-blur-sm"
            >
              <LayoutGrid className="mx-auto mb-4 size-8 text-violet-500" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to build your
                <br />
                first course?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Join hundreds of course creators who save 40+ hours per course
                with Syllabi. Your first generation is free — no credit card, no
                catch.
              </p>
              <Button
                id="bottom-cta"
                size="lg"
                className="mt-8 h-12 w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base font-semibold text-white border-0 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                Generate Your First Course Free
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
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
                AI-powered course generation for course creators, educators,
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
                <li>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLScHZQ9cSmQwUnDnHiSPSFaRyeS1Ijh4jbnueFAJ4fdedQZdfA/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors text-violet-400 font-medium"
                  >
                    Feedback
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

      {/* ── Modals ─────────────────────────────────────── */}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* ═══════════════════════════════════════════════════
          EXAMPLE PREVIEW MODAL
      ═══════════════════════════════════════════════════ */}
      {previewCurriculum && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="sticky top-0 z-10 ml-auto flex items-center gap-1.5 mb-4 rounded-full bg-background/90 border border-border/60 px-4 py-2 text-sm font-medium text-foreground shadow-lg hover:bg-background transition-colors backdrop-blur-sm"
            >
              <XIcon className="size-4" />
              Close preview
            </button>
            <CurriculumOutput
              curriculum={previewCurriculum}
              onGenerateAnother={closePreview}
            />
          </div>
        </div>
      )}
    </div>
  );
}
