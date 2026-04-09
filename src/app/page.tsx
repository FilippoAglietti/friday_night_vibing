"use client";

import CurriculumForm, { type CurriculumFormData } from "@/components/CurriculumForm";
import CurriculumOutput from "@/components/CurriculumOutput";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import PaywallModal from "@/components/PaywallModal";
import AuthModal from "@/components/AuthModal";
import AuthButton from "@/components/AuthButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/components/ToastProvider";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Curriculum } from "@/types/curriculum";
import { exampleCurricula as fullExampleCurricula } from "@/data/exampleCurricula";
import { motion, AnimatePresence, useScroll, useTransform, useAnimation, type Variants } from "framer-motion";
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
  Headphones,
  Menu,
  Flame,
} from "lucide-react";

/* ─── Countdown Hook ─────────────────────────────────────── */

const PROMO_EXPIRES = new Date("2026-05-11T23:59:59Z");

function useCountdown(target: Date) {
  // Start with null to avoid hydration mismatch (server date ≠ client date)
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return { days: 0, hours: 0, mins: 0, secs: 0, expired: false, ready: false };
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins  = Math.floor((diff % 3_600_000) / 60_000);
  const secs  = Math.floor((diff % 60_000) / 1000);
  return { days, hours, mins, secs, expired: diff === 0, ready: true };
}

function CountdownInline() {
  const { days, hours, mins, secs, expired, ready } = useCountdown(PROMO_EXPIRES);
  if (!ready || expired) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums">
      <span className="font-bold text-rose-400">{days}d</span>
      <span className="text-muted-foreground/40">:</span>
      <span className="font-bold text-rose-400">{String(hours).padStart(2, "0")}h</span>
      <span className="text-muted-foreground/40">:</span>
      <span className="font-bold text-rose-400">{String(mins).padStart(2, "0")}m</span>
      <span className="text-muted-foreground/40">:</span>
      <span className="font-bold text-rose-400">{String(secs).padStart(2, "0")}s</span>
    </span>
  );
}

/* ─── Data ───────────────────────────────────────────────── */

const painPoints = [
  {
    icon: Clock,
    problem: "Your courses look like everyone else's",
    solution:
      "Syllabi generates courses with stunning design and real audio narration — so polished your students won't believe it's AI.",
  },
  {
    icon: Brain,
    problem: "Nobody finishes your courses",
    solution:
      "Audio lessons, structured pacing, and beautiful visuals keep learners engaged from start to finish — not just skimming.",
  },
  {
    icon: Target,
    problem: "Creating & sharing is a 10-tool nightmare",
    solution:
      "One click gives you a complete course with a shareable link, audio, quizzes, and export-ready files. No LMS required.",
  },
];

const steps = [
  {
    num: "01",
    icon: BookOpen,
    title: "Describe what you teach",
    desc: "Enter your topic, pick a style and depth — from \"Python for data science\" to \"Sourdough baking 101\".",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "AI builds your course",
    desc: "In seconds you get modules, lessons, quizzes, audio narration, and a shareable link — all editable.",
  },
  {
    num: "03",
    icon: Globe,
    title: "Share, teach, or sell",
    desc: "Send a link, export to Notion or PDF, or turn it into a lead magnet. Your course, your way.",
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
  { text: "3 free mini-course generations", included: true },
  { text: "Modules, lessons & quizzes", included: true },
  { text: "PDF & Notion export", included: true },
  { text: "Shareable course links", included: true },
  { text: "Audio narration", included: false },
  { text: "15 generations/month (Pro)", included: false },
];

const proPlanFeatures = [
  { text: "15 course generations/month", included: true },
  { text: "Full modules, lessons & quizzes", included: true },
  { text: "PDF, Markdown & Notion export", included: true },
  { text: "All course lengths & styles", included: true },
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

const testimonials = [
  {
    quote: "I hit publish on my first audio course 20 minutes after signing up. My students keep telling me it feels like a real product, not an AI thing.",
    name: "Sarah Chen",
    role: "Leadership Coach",
    avatar: "SC",
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    quote: "The audio narration is what sold me. I shared a link with my team and they thought I'd hired a production studio. It was Syllabi in 45 seconds.",
    name: "Marcus Rivera",
    role: "Corporate Trainer",
    avatar: "MR",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    quote: "I've tried CourseAI and Coursebox — they give you a text dump. Syllabi gives you something you're actually proud to share. The design is unmatched.",
    name: "Priya Patel",
    role: "Online Educator",
    avatar: "PP",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    quote: "Turned my sales training into a shareable course with one click. My reps listen to the audio lessons during commute. Completion rate went from 30% to 89%.",
    name: "James Whitfield",
    role: "VP of Sales Enablement",
    avatar: "JW",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    quote: "I use it as a lead magnet — a free mini-course behind an email gate. 400+ signups in the first week. The ROI on €28 is insane.",
    name: "Elena Vasquez",
    role: "Digital Marketing Consultant",
    avatar: "EV",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    quote: "My Notion export is gorgeous. I embed courses directly in my client workspaces. They think I spent weeks on it. I spent 60 seconds.",
    name: "David Kim",
    role: "Freelance Course Designer",
    avatar: "DK",
    gradient: "from-indigo-500 to-purple-500",
  },
];

/* ─── Course Templates ─────────────────────────────────── */

const courseTemplates: {
  id: string;
  icon: typeof BookOpen;
  label: string;
  desc: string;
  gradient: string;
  preset: Partial<CurriculumFormData>;
}[] = [
  {
    id: "onboarding",
    icon: Layers,
    label: "Employee Onboarding",
    desc: "New hire training with company culture, processes & tools",
    gradient: "from-violet-500 to-indigo-500",
    preset: { topic: "Employee Onboarding Program", difficulty: "beginner", courseLength: "short", teachingStyle: "conversational", outputStructure: "modules", niche: "HR & People Ops" },
  },
  {
    id: "lead-magnet",
    icon: Flame,
    label: "Lead Magnet Mini-Course",
    desc: "Quick-win course to capture emails and build your list",
    gradient: "from-amber-500 to-orange-500",
    preset: { topic: "", difficulty: "beginner", courseLength: "crash", teachingStyle: "conversational", outputStructure: "modules", abstract: "Deliver one actionable insight that leaves the audience wanting more" },
  },
  {
    id: "coaching",
    icon: MessageCircle,
    label: "Coaching Program",
    desc: "Structured transformation journey for clients",
    gradient: "from-emerald-500 to-teal-500",
    preset: { topic: "", difficulty: "intermediate", courseLength: "full", teachingStyle: "storytelling", outputStructure: "workshop", niche: "Coaching & Personal Development" },
  },
  {
    id: "sales-training",
    icon: Target,
    label: "Sales Training",
    desc: "Pitch frameworks, objection handling & closing techniques",
    gradient: "from-rose-500 to-pink-500",
    preset: { topic: "Sales Training Program", difficulty: "intermediate", courseLength: "short", teachingStyle: "hands-on", outputStructure: "bootcamp", niche: "Sales & Revenue" },
  },
  {
    id: "technical",
    icon: FileText,
    label: "Technical Skills",
    desc: "Programming, tools, or technical workflows — hands-on",
    gradient: "from-cyan-500 to-blue-500",
    preset: { topic: "", difficulty: "intermediate", courseLength: "full", teachingStyle: "hands-on", outputStructure: "modules", niche: "Software & Technology" },
  },
  {
    id: "blank",
    icon: Sparkles,
    label: "Start from Scratch",
    desc: "Full control — you define every detail",
    gradient: "from-zinc-500 to-zinc-600",
    preset: {},
  },
];

const TEMPLATE_KEY_MAP: Record<string, string> = {
  "onboarding": "onboarding",
  "lead-magnet": "leadMagnet",
  "coaching": "coaching",
  "sales-training": "sales",
  "technical": "technical",
  "blank": "scratch",
};

const difficultyColor: Record<string, string> = {
  Beginner:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Intermediate:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Advanced:
    "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

/* ─── Animation Variants ──────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 20 },
  },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 90, damping: 22 },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

/* ─── Scroll-triggered animation wrapper (SSR-safe) ──── */
/* Framer-motion's viewport.root doesn't work with SSR because the
   ref is null during hydration. This component creates a native
   IntersectionObserver in a useEffect (after mount), guaranteeing
   the container ref is set before observing.                       */

function AnimateInView({
  containerRef,
  amount = 0.2,
  variants,
  className,
  children,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  amount?: number;
  variants: Variants;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const triggered = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const element = ref.current;
    if (!container || !element || triggered.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          controls.start("visible");
          observer.disconnect();
        }
      },
      { root: container, threshold: amount }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef, controls, amount]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section Meta ────────────────────────────────────── */

const SECTION_IDS = ["hero", "problem-solution", "how-it-works", "generate", "examples", "testimonials", "pricing", "final-cta"];

/* ─── Section Dots ────────────────────────────────────── */

function SectionDots({ activeSection }: { activeSection: string }) {
  const { t } = useTranslation();
  const sectionMeta = [
    { id: "hero",             label: t("sections.hero")          },
    { id: "problem-solution", label: t("sections.theProblem")    },
    { id: "how-it-works",     label: t("sections.howItWorks")    },
    { id: "generate",         label: t("sections.tryItNow")      },
    { id: "examples",         label: t("sections.examples")      },
    { id: "testimonials",     label: t("sections.testimonials")  },
    { id: "pricing",          label: t("sections.pricing")       },
    { id: "final-cta",        label: t("sections.getStarted")    },
  ];
  return (
    <div
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3.5 lg:flex"
      aria-hidden="true"
    >
      {sectionMeta.map(({ id, label }) => (
        <button
          key={id}
          onClick={() =>
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
          }
          title={label}
          className={`section-dot ${
            activeSection === id ? "section-dot-active" : "section-dot-inactive"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */

export default function Home() {
  const [dark, setDark] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");

  // Section tracking for dots — observes inside the snap container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { root: container, threshold: [0.3, 0.5] }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  const [previewCurriculum, setPreviewCurriculum] = useState<Curriculum | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateFormValues, setTemplateFormValues] = useState<Partial<CurriculumFormData> | undefined>(undefined);
  const { toast } = useToast();
  const { t } = useTranslation();
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

  // Listen for AuthButton dispatching open-auth event (nav sign-in click)
  useEffect(() => {
    const handler = () => setShowAuthModal(true);
    window.addEventListener("syllabi:open-auth", handler);
    return () => window.removeEventListener("syllabi:open-auth", handler);
  }, []);

  // Check for checkout success/error in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast(t("toast.paymentSuccess"), "success");
      window.history.replaceState({}, "", "/");
    } else if (params.get("checkout") === "cancelled") {
      toast(t("toast.checkoutCancelled"), "info");
      window.history.replaceState({}, "", "/");
    } else if (params.get("auth_error") === "true") {
      toast(t("toast.signInFailed"), "error");
      window.history.replaceState({}, "", "/");
    }
  }, [toast]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsGenerating(loading);
  }, []);

  const handleGenerated = useCallback((c: Curriculum) => {
    setCurriculum(c);
    toast(t("toast.courseGenerated"), "success");
  }, [toast]);

  /* ── (waitlist removed — Pro Max is now live) ── */

  const handleLimitReached = useCallback(() => {
    setShowPaywall(true);
  }, []);

  const handleFormSubmitAttempt = useCallback(() => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [user]);

  // Snap scroll container — drives both snap behaviour and parallax
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax for ambient background — track the snap container, not window
  const { scrollY } = useScroll({ container: containerRef });
  const bgY1 = useTransform(scrollY, [0, 3000], [0, -300]);
  const bgY2 = useTransform(scrollY, [0, 3000], [0, -150]);
  const bgY3 = useTransform(scrollY, [0, 3000], [0, -200]);

  return (
    <div
      className="relative overflow-hidden bg-background text-foreground transition-colors duration-300 md:h-screen"
    >
      {/* ── Scroll Progress Bar ─────────────────────────── */}
      <ScrollProgress container={containerRef} />

      {/* ── Section Navigation Dots ─────────────────────── */}
      <SectionDots activeSection={activeSection} />

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
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="/"
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
              {t("nav.howItWorks")}
            </a>
            <a
              href="#examples"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.examples")}
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.pricing")}
            </a>
            <a
              href="/tutorial"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.tutorial")}
            </a>
            <a
              href="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.contactUs")}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
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
              {t("nav.getStartedFree")}
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
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">{t("nav.howItWorks")}</a>
              <a href="#examples" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">{t("nav.examples")}</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">{t("nav.pricing")}</a>
              <a href="/tutorial" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">{t("nav.tutorial")}</a>
              <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">{t("nav.contactUs")}</a>
              <div className="pt-2 pb-1">
                <div className="px-4 pb-2">
                  <LanguageSwitcher />
                </div>
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20"
                  onClick={() => { setMobileMenuOpen(false); document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" }); }}
                >
                  {t("nav.getStartedFree")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Snap Container: wraps ONLY the 7 sections; footer stays outside ── */}
      <div ref={containerRef} className="snap-scroll-container relative z-10">
      <main>
        {/* ═══════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="snap-section relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-10 md:pt-16 md:pb-16"
        >
          {/* Hero radial spotlight */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-[45%] h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.05] dark:bg-violet-500/[0.09] blur-[90px]" />
          </div>

          <div className="mx-auto max-w-4xl xl:max-w-5xl 2xl:max-w-6xl text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <Badge
                  variant="outline"
                  className="mb-6 rounded-full border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-400"
                >
                  <Headphones className="mr-1.5 size-3" />
                  {t("hero.badge")}
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
              >
                <span className="block">{t("hero.title1")}</span>
                <span className="block text-[0.65em] font-semibold tracking-wide text-muted-foreground/70 mt-1">
                  {t("hero.titleConnector")}
                </span>
                <span className="block bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent tracking-[-0.02em] w-full text-center">
                  {t("hero.title2")}
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-4 sm:mt-6 max-w-2xl xl:max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-xl xl:text-2xl"
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-6 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-center"
              >
                <Button
                  id="hero-cta"
                  size="lg"
                  className="h-12 xl:h-14 w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 xl:px-10 text-base xl:text-lg font-semibold text-white border-0 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
                  onClick={() => document.getElementById('generate')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t("hero.cta")}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button
                  id="hero-secondary"
                  variant="outline"
                  size="lg"
                  className="h-12 w-full sm:w-auto rounded-full px-8 text-base"
                  onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t("hero.secondaryCta")}
                </Button>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="mt-4 text-xs text-muted-foreground"
              >
                {t("hero.tagline")}
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            PROBLEM / SOLUTION
        ═══════════════════════════════════════════════════ */}
        <section
          id="problem-solution"
          className="snap-section relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:py-20"
        >
          {/* Section-specific accent */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-[25%] -left-[15%] h-[55vh] w-[55vh] rounded-full bg-rose-600/[0.04] blur-[100px] dark:bg-rose-500/[0.08]" />
            <div className="absolute top-[8%] right-[3%] h-[35vh] w-[35vh] rounded-full bg-amber-500/[0.03] blur-[80px] dark:bg-amber-400/[0.05]" />
          </div>

          <div className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] w-full">
            <AnimateInView containerRef={containerRef} amount={0.2} variants={stagger} className="text-center mb-8 md:mb-16">
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                {t("problem.eyebrow")}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl"
              >
                {t("problem.heading")}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mx-auto mt-4 max-w-2xl text-muted-foreground"
              >
                {t("problem.subheading")}
              </motion.p>
            </AnimateInView>

            <AnimateInView containerRef={containerRef} amount={0.15} variants={stagger} className="grid gap-4 md:gap-8 md:grid-cols-3 xl:gap-10 2xl:gap-14">
              {painPoints.map((p, i) => (
                <motion.div key={i} variants={scaleUp} className="group relative">
                  <div className="relative flex flex-col items-center text-center p-5 md:p-8 xl:p-10 2xl:p-12 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-card/60 hover:shadow-xl hover:shadow-violet-500/5 h-full">
                    {/* Icon */}
                    <div className="mb-3 md:mb-5 flex size-12 md:size-14 xl:size-16 2xl:size-20 items-center justify-center rounded-2xl bg-violet-500/10">
                      <p.icon className="size-5 md:size-6 xl:size-7 2xl:size-9 text-violet-500" />
                    </div>
                    {/* Title */}
                    <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold">{t(`problem.pain${i + 1}Problem`)}</h3>
                    {/* Description */}
                    <p className="mt-2 text-sm xl:text-base leading-relaxed text-muted-foreground">
                      {t(`problem.pain${i + 1}Solution`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimateInView>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════════ */}
        <section id="how-it-works" className="snap-section relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:py-20">
          {/* Section-specific accent */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-[5%] right-[0%] h-[55vh] w-[45vh] rounded-full bg-indigo-500/[0.04] blur-[100px] dark:bg-indigo-400/[0.07]" />
            <div className="absolute bottom-[10%] left-[5%] h-[30vh] w-[30vh] rounded-full bg-cyan-500/[0.03] blur-[80px] dark:bg-cyan-400/[0.05]" />
          </div>

          <div className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] w-full">
            <AnimateInView containerRef={containerRef} amount={0.2} variants={stagger} className="text-center mb-8 md:mb-16">
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                {t("howItWorks.eyebrow")}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl"
              >
                {t("howItWorks.heading")}
              </motion.h2>
            </AnimateInView>

            <AnimateInView containerRef={containerRef} amount={0.15} variants={stagger} className="grid gap-4 md:gap-8 md:grid-cols-3 xl:gap-10 2xl:gap-14">
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  variants={scaleUp}
                  className="group relative"
                >
                  {/* Connector line — hidden on mobile, shown between cards */}
                  {i < steps.length - 1 && (
                    <div className="absolute top-12 -right-4 hidden h-px w-8 bg-gradient-to-r from-border to-transparent md:block" />
                  )}

                  <div className="relative flex flex-col items-center text-center p-5 md:p-8 xl:p-10 2xl:p-12 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-card/60 hover:shadow-xl hover:shadow-violet-500/5">
                    {/* Step number */}
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-0.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25">
                      {s.num}
                    </span>

                    <div className="mt-4 mb-3 md:mb-5 flex size-12 md:size-14 xl:size-16 2xl:size-20 items-center justify-center rounded-2xl bg-violet-500/10">
                      <s.icon className="size-5 md:size-6 xl:size-7 2xl:size-9 text-violet-500" />
                    </div>
                    <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold">{t(`howItWorks.step${i + 1}Title`)}</h3>
                    <p className="mt-2 text-sm xl:text-base leading-relaxed text-muted-foreground">
                      {t(`howItWorks.step${i + 1}Desc`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimateInView>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            TRY IT — CURRICULUM FORM / OUTPUT
            Note: snap-section removed when curriculum is
            showing so users can freely scroll through output
        ═══════════════════════════════════════════════════ */}
        <section
          id="generate"
          className={`${curriculum || isGenerating ? "" : "snap-section"} relative min-h-screen flex flex-col px-4 py-8 md:py-16 ${
            curriculum || isGenerating
              ? "items-start justify-start pt-20"
              : "items-center justify-center"
          }`}
        >
          {/* Section-specific accent */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/3 h-[50vh] w-[60vh] -translate-x-1/2 rounded-full bg-violet-500/[0.03] blur-[80px] dark:bg-violet-500/[0.07]" />
          </div>

          <div className="mx-auto w-full max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
            {isGenerating ? (
              <LoadingSkeleton />
            ) : curriculum ? (
              <div key="output-view">
                <CurriculumOutput
                  curriculum={curriculum}
                  onGenerateAnother={() => setCurriculum(null)}
                />
              </div>
            ) : (
              <>
                <AnimateInView containerRef={containerRef} amount={0.3} variants={stagger} className="text-center mb-10">
                  <motion.p
                    variants={fadeUp}
                    className="text-sm font-semibold uppercase tracking-widest text-violet-500"
                  >
                    {t("generate.eyebrow")}
                  </motion.p>
                  <motion.h2
                    variants={fadeUp}
                    className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl"
                  >
                    {selectedTemplate ? t("generate.headingCustomize") : t("generate.headingPick")}
                  </motion.h2>
                  {!selectedTemplate && (
                    <motion.p
                      variants={fadeUp}
                      className="mx-auto mt-3 max-w-lg text-muted-foreground"
                    >
                      {t("generate.subheading")}
                    </motion.p>
                  )}
                </AnimateInView>

                <AnimatePresence mode="wait">
                  {!selectedTemplate ? (
                    /* ── Template Grid ─────────────────────── */
                    <motion.div
                      key="template-grid"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.25 }}
                      className="mx-auto w-full max-w-3xl"
                    >
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                        {courseTemplates.map((tmpl) => {
                          const Icon = tmpl.icon;
                          return (
                            <button
                              key={tmpl.id}
                              type="button"
                              onClick={() => {
                                setSelectedTemplate(tmpl.id);
                                setTemplateFormValues(tmpl.preset);
                              }}
                              className="group relative flex flex-col items-center gap-2 rounded-2xl border border-border/40 bg-card/30 p-5 sm:p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-card/60 hover:shadow-xl hover:shadow-violet-500/5 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <div className={`flex size-10 sm:size-12 items-center justify-center rounded-xl bg-gradient-to-br ${tmpl.gradient} text-white shadow-lg`}>
                                <Icon className="size-5 sm:size-6" />
                              </div>
                              <p className="text-sm font-semibold sm:text-base">{t(`templates.${TEMPLATE_KEY_MAP[tmpl.id]}Label`)}</p>
                              <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">{t(`templates.${TEMPLATE_KEY_MAP[tmpl.id]}Desc`)}</p>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Form (with template pre-fill) ────── */
                    <motion.div
                      key="form-view"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.25 }}
                      className="mx-auto w-full max-w-xl sm:max-w-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => { setSelectedTemplate(null); setTemplateFormValues(undefined); }}
                        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowRight className="size-3.5 rotate-180" />
                        {t("generate.backToTemplates")}
                      </button>
                      <CurriculumForm
                        key={selectedTemplate}
                        onGenerated={handleGenerated}
                        onLoadingChange={handleLoadingChange}
                        onLimitReached={handleLimitReached}
                        onSubmitAttempt={handleFormSubmitAttempt}
                        initialValues={templateFormValues}
                        isFreeUser={!user}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            EXAMPLE CURRICULA (SOCIAL PROOF)
        ═══════════════════════════════════════════════════ */}
        <section id="examples" className="snap-section relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:py-20">
          {/* Section-specific accent */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-[8%] left-[3%] h-[45vh] w-[45vh] rounded-full bg-violet-500/[0.04] blur-[100px] dark:bg-violet-400/[0.07]" />
            <div className="absolute bottom-[5%] right-[5%] h-[30vh] w-[30vh] rounded-full bg-cyan-500/[0.03] blur-[80px] dark:bg-cyan-400/[0.05]" />
          </div>

          <div className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] w-full">
            <AnimateInView containerRef={containerRef} amount={0.2} variants={stagger} className="text-center mb-8 md:mb-16">
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                {t("examples.eyebrow")}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl"
              >
                {t("examples.heading")}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mx-auto mt-4 max-w-2xl text-muted-foreground"
              >
                {t("examples.subheading")}
              </motion.p>
            </AnimateInView>

            <AnimateInView containerRef={containerRef} amount={0.15} variants={stagger} className="grid gap-4 md:gap-8 md:grid-cols-3 xl:gap-10 2xl:gap-14">
              {exampleCurricula.map((c, i) => (
                <motion.div key={i} variants={scaleUp} className="group relative">
                  <div
                    className="relative flex flex-col items-center text-center p-5 md:p-8 xl:p-10 2xl:p-12 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-card/60 hover:shadow-xl hover:shadow-violet-500/5 h-full cursor-pointer"
                    onClick={() => setPreviewCurriculum(fullExampleCurricula[i])}
                  >
                    {/* Difficulty badge */}
                    <Badge
                      variant="outline"
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-bold tracking-wide shadow-lg ${difficultyColor[c.difficulty]}`}
                    >
                      {c.difficulty}
                    </Badge>

                    {/* Preview hint on hover */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-violet-400 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <Eye className="size-4" />
                      <span className="font-medium">{t("examples.preview")}</span>
                    </div>

                    {/* Title — fixed height so stats grid aligns across cards */}
                    <div className="mt-3 flex h-16 xl:h-18 items-center justify-center">
                      <h3 className="text-xl xl:text-2xl 2xl:text-[1.7rem] font-semibold leading-tight">
                        {c.title}
                      </h3>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid w-full grid-cols-3 gap-3 xl:gap-4">
                      <div className="flex flex-col items-center rounded-xl bg-violet-500/5 border border-violet-500/10 p-3.5 xl:p-4">
                        <Layers className="mb-2 size-5 xl:size-6 text-violet-500" />
                        <span className="text-lg xl:text-xl font-bold">{c.modules}</span>
                        <span className="text-[11px] xl:text-xs text-muted-foreground font-medium">{t("examples.modules")}</span>
                      </div>
                      <div className="flex flex-col items-center rounded-xl bg-violet-500/5 border border-violet-500/10 p-3.5 xl:p-4">
                        <FileText className="mb-2 size-5 xl:size-6 text-violet-500" />
                        <span className="text-lg xl:text-xl font-bold">{c.lessons}</span>
                        <span className="text-[11px] xl:text-xs text-muted-foreground font-medium">{t("examples.lessons")}</span>
                      </div>
                      <div className="flex flex-col items-center rounded-xl bg-violet-500/5 border border-violet-500/10 p-3.5 xl:p-4">
                        <Clock className="mb-2 size-5 xl:size-6 text-violet-500" />
                        <span className="text-lg xl:text-xl font-bold">{c.hours}h</span>
                        <span className="text-[11px] xl:text-xs text-muted-foreground font-medium">{t("examples.total")}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {c.tags.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="rounded-full px-3.5 py-1 text-xs font-medium"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimateInView>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════════════ */}
        <section id="testimonials" className="snap-section relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:py-20">
          {/* Section-specific accent */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-[15%] left-[8%] h-[40vh] w-[40vh] rounded-full bg-violet-500/[0.04] blur-[100px] dark:bg-violet-500/[0.07]" />
            <div className="absolute bottom-[10%] right-[5%] h-[35vh] w-[35vh] rounded-full bg-cyan-500/[0.03] blur-[80px] dark:bg-cyan-400/[0.06]" />
          </div>

          <div className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] w-full">
            <AnimateInView containerRef={containerRef} amount={0.2} variants={stagger} className="text-center mb-8 md:mb-16">
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                {t("testimonials.eyebrow")}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl"
              >
                {t("testimonials.heading")}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mx-auto mt-4 max-w-2xl text-muted-foreground"
              >
                {t("testimonials.subheading")}
              </motion.p>
            </AnimateInView>

            <AnimateInView containerRef={containerRef} amount={0.1} variants={stagger} className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {testimonials.map((testimonial, i) => (
                <motion.div key={i} variants={scaleUp}>
                  <div className="relative flex flex-col h-full p-6 xl:p-8 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/20 hover:bg-card/50">
                    {/* Quote icon */}
                    <div className="mb-4">
                      <MessageCircle className="size-5 text-violet-500/40" />
                    </div>

                    {/* Quote text */}
                    <p className="flex-1 text-sm leading-relaxed text-foreground/80 xl:text-base">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="mt-6 flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-xs font-bold text-white`}>
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimateInView>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            PRICING
        ═══════════════════════════════════════════════════ */}
        <section id="pricing" className="snap-section relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:py-20">
          {/* Section-specific accent */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[30vh] w-[80%] rounded-full bg-violet-500/[0.03] blur-[100px] dark:bg-violet-500/[0.06]" />
            <div className="absolute bottom-[5%] right-[10%] h-[25vh] w-[25vh] rounded-full bg-amber-500/[0.03] blur-[80px] dark:bg-amber-500/[0.05]" />
          </div>

          <div className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] w-full">
            <AnimateInView containerRef={containerRef} amount={0.2} variants={stagger} className="text-center mb-8 md:mb-16">
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold uppercase tracking-widest text-violet-500"
              >
                {t("pricing.eyebrow")}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl"
              >
                {t("pricing.heading")}
              </motion.h2>
              <motion.div variants={fadeUp} className="mt-4 inline-flex items-center gap-3 rounded-full border border-rose-500/25 bg-gradient-to-r from-rose-500/10 via-violet-500/5 to-amber-500/10 px-5 py-2.5 backdrop-blur-sm shadow-lg shadow-rose-500/5">
                <Flame className="size-4 text-rose-400 animate-pulse shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-rose-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
                  {t("pricing.launchSpecial")}
                </span>
                <span className="hidden sm:inline text-muted-foreground/30">·</span>
                <span className="hidden sm:inline text-xs text-muted-foreground">{t("pricing.endsIn")}</span>
                <CountdownInline />
                <Flame className="size-4 text-rose-400 animate-pulse shrink-0" />
              </motion.div>
            </AnimateInView>

            {/* Mobile: horizontal scroll; Desktop: 4-column grid */}
            <AnimateInView containerRef={containerRef} amount={0.1} variants={stagger} className="hidden md:grid gap-6 xl:gap-8 sm:grid-cols-2 lg:grid-cols-4 items-stretch overflow-visible">
              {/* FREE PLAN */}
              <motion.div variants={scaleUp} className="flex min-w-0 overflow-visible">
                <Card className="relative flex flex-col w-full overflow-visible border-border/50 bg-card/50 backdrop-blur-sm">
                  {/* Invisible spacer to align with badged cards */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 opacity-0 pointer-events-none">
                    <Badge className="rounded-full px-4 py-1.5 text-xs">‌</Badge>
                  </div>
                  <CardHeader className="pt-8">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Free
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      €0
                      <span className="text-base font-normal text-muted-foreground">
                        {t("pricing.forever")}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t("pricing.freeDesc")}
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
                            {t(`pricing.free${i + 1}`)}
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
                      {t("pricing.getStartedFree")}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* PRO PLAN */}
              <motion.div variants={scaleUp} className="flex min-w-0 overflow-visible">
                <Card className="relative flex flex-col w-full overflow-visible border-violet-500/30 bg-card/50 backdrop-blur-sm shadow-xl shadow-violet-500/5">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white border-0 shadow-lg shadow-violet-500/25">
                      {t("pricing.mostPopular")}
                    </Badge>
                  </div>
                  <CardHeader className="pt-8">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                      Pro
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      €28
                      <span className="text-base font-normal text-muted-foreground">
                        {t("pricing.month")}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm line-through text-muted-foreground/60">€35/mo</span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-rose-400 bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full shadow-sm shadow-rose-500/10"><Flame className="size-3" />{t("pricing.save20")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("pricing.proDesc")}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {proPlanFeatures.map((f, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          <Check className="size-4 text-violet-500 shrink-0" />
                          <span>{t(`pricing.pro${i + 1}`)}</span>
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
                      {t("pricing.startProBtn")}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* PRO MAX 5-PACK */}
              <motion.div variants={scaleUp} className="flex min-w-0 overflow-visible">
                <Card className="relative flex flex-col w-full overflow-visible border-amber-500/20 bg-gradient-to-b from-amber-500/[0.03] via-card/50 to-card/50 backdrop-blur-sm">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white border-0 shadow-lg shadow-amber-500/30">
                      {t("pricing.oneTime")}
                    </Badge>
                  </div>
                  <CardHeader className="pt-8">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Crown className="size-3.5" />
                      Pro Max · 5-Pack
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      €33
                      <span className="text-base font-normal text-muted-foreground">
                        {" "}{t("pricing.oneTimeLabel")}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm line-through text-muted-foreground/60">€42</span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-rose-400 bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full shadow-sm shadow-rose-500/10"><Flame className="size-3" />{t("pricing.save21")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("pricing.fivePackDesc")}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {[1,2,3,4,5,6].map((n, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          <Check className="size-4 text-amber-400 shrink-0" />
                          <span>{t(`pricing.pack${n}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-0">
                    <Button
                      id="pricing-5pack-cta"
                      className="w-full rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.02]"
                      size="lg"
                      onClick={() => setShowPaywall(true)}
                    >
                      {t("pricing.tryProMaxBtn")}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* PRO MAX */}
              <motion.div variants={scaleUp} className="flex min-w-0 overflow-visible">
                <Card className="relative flex flex-col w-full border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-card/50 to-card/50 backdrop-blur-sm shadow-xl shadow-amber-500/5 overflow-visible">
                  {/* Gold shimmer accent */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white border-0 shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                      <Crown className="size-3" />
                      {t("pricing.bestValue")}
                    </Badge>
                  </div>
                  <CardHeader className="pt-8">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <Crown className="size-3.5" />
                      Pro Max
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      €69
                      <span className="text-base font-normal text-muted-foreground">
                        {t("pricing.month")}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm line-through text-muted-foreground/60">€79/mo</span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-rose-400 bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full shadow-sm shadow-rose-500/10"><Flame className="size-3" />{t("pricing.save13")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("pricing.proMaxDesc")}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {/* AI Audio highlight */}
                    <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-3">
                      <div className="flex items-center justify-center size-9 shrink-0 rounded-lg bg-amber-500/10">
                        <Headphones className="size-5 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-amber-500">{t("pricing.aiAudioTitle")}</p>
                        <p className="text-[11px] text-muted-foreground">{t("pricing.aiAudioDesc")}</p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {proMaxFeatures.map((f, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm">
                          <Check className="size-4 text-amber-500 shrink-0" />
                          <span>{t(`pricing.pm${i + 1}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-0">
                    <Button
                      id="pricing-promax-cta"
                      className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.02]"
                      size="lg"
                      onClick={() => setShowPaywall(true)}
                    >
                      {t("pricing.goProMaxBtn")}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimateInView>

            {/* Mobile pricing: horizontal scroll carousel */}
            <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-4" style={{ width: "max-content" }}>
                {/* FREE */}
                <div className="w-[280px] shrink-0">
                  <Card className="relative flex flex-col h-full overflow-visible border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pt-6 pb-3">
                      <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Free</CardDescription>
                      <CardTitle className="text-2xl font-bold">€0<span className="text-sm font-normal text-muted-foreground">/forever</span></CardTitle>
                      <p className="text-xs text-muted-foreground">Create 3 mini-courses free. No card required.</p>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      <ul className="space-y-2">
                        {freePlanFeatures.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs">
                            {f.included ? <Check className="size-3.5 text-emerald-500 shrink-0" /> : <X className="size-3.5 text-muted-foreground/40 shrink-0" />}
                            <span className={f.included ? "" : "text-muted-foreground/50"}>{t(`pricing.free${i + 1}`)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-0 pb-5">
                      <Button className="w-full rounded-full" variant="outline" size="sm" onClick={() => document.getElementById('generate')?.scrollIntoView({ behavior: 'smooth' })}>
                        {t("pricing.startFree")}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* PRO */}
                <div className="w-[280px] shrink-0">
                  <Card className="relative flex flex-col h-full overflow-visible border-violet-500/40 bg-gradient-to-b from-violet-500/10 via-card/50 to-card/50 backdrop-blur-sm shadow-xl shadow-violet-500/10">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white border-0 shadow-lg shadow-violet-500/25">{t("pricing.mostPopular")}</Badge>
                    </div>
                    <CardHeader className="pt-7 pb-3">
                      <CardDescription className="text-xs font-semibold uppercase tracking-wider text-violet-500">Pro</CardDescription>
                      <CardTitle className="text-2xl font-bold">€28<span className="text-sm font-normal text-muted-foreground">{t("pricing.month")}</span></CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs line-through text-muted-foreground/60">€35/mo</span>
                        <span className="text-[9px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">-20%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t("pricing.proDesc")}</p>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      <ul className="space-y-2">
                        {proPlanFeatures.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs">
                            <Check className="size-3.5 text-violet-500 shrink-0" />
                            <span>{t(`pricing.pro${i + 1}`)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-0 pb-5">
                      <Button className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20" size="sm" onClick={() => setShowPaywall(true)}>
                        {t("pricing.startProBtn")}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* PRO MAX 5-PACK */}
                <div className="w-[280px] shrink-0">
                  <Card className="relative flex flex-col h-full overflow-visible border-amber-500/20 bg-gradient-to-b from-amber-500/[0.03] via-card/50 to-card/50 backdrop-blur-sm">
                    <CardHeader className="pt-6 pb-3">
                      <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Crown className="size-3" />Pro Max · 5-Pack
                      </CardDescription>
                      <CardTitle className="text-2xl font-bold">€33<span className="text-sm font-normal text-muted-foreground"> {t("pricing.oneTimeLabel")}</span></CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs line-through text-muted-foreground/60">€42</span>
                        <span className="text-[9px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">-21%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t("pricing.fivePackDesc")}</p>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      <ul className="space-y-2">
                        {[1,2,3,4,5,6].map((n, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs">
                            <Check className="size-3.5 text-amber-400 shrink-0" />
                            <span>{t(`pricing.pack${n}`)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-0 pb-5">
                      <Button className="w-full rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20" size="sm" onClick={() => setShowPaywall(true)}>
                        {t("pricing.tryProMaxBtn")}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* PRO MAX */}
                <div className="w-[280px] shrink-0">
                  <Card className="relative flex flex-col h-full border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-card/50 to-card/50 backdrop-blur-sm shadow-xl shadow-amber-500/5 overflow-visible">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 text-xs font-semibold text-white border-0 shadow-lg shadow-amber-500/30 flex items-center gap-1">
                        <Crown className="size-3" />{t("pricing.bestValue")}
                      </Badge>
                    </div>
                    <CardHeader className="pt-7 pb-3">
                      <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                        <Crown className="size-3" />Pro Max
                      </CardDescription>
                      <CardTitle className="text-2xl font-bold">€69<span className="text-sm font-normal text-muted-foreground">{t("pricing.month")}</span></CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs line-through text-muted-foreground/60">€79/mo</span>
                        <span className="text-[9px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">-13%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t("pricing.proMaxDesc")}</p>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 flex items-center gap-2.5">
                        <div className="flex items-center justify-center size-8 shrink-0 rounded-lg bg-amber-500/10">
                          <Headphones className="size-4 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-amber-500">{t("pricing.aiAudioTitle")}</p>
                          <p className="text-[10px] text-muted-foreground">{t("pricing.aiAudioDesc")}</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {proMaxFeatures.slice(0, 5).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs">
                            <Check className="size-3.5 text-amber-500 shrink-0" />
                            <span>{t(`pricing.pm${i + 1}`)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-0 pb-5">
                      <Button className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40" size="sm" onClick={() => setShowPaywall(true)}>
                        {t("pricing.goProMaxBtn")}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
              <p className="text-center text-[11px] text-muted-foreground/50 mt-1">{t("pricing.swipePlans")}</p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════ */}
        <section id="final-cta" className="snap-section relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:py-20">
          {/* Section-specific accent */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.06] blur-[100px] dark:bg-violet-500/[0.11]" />
            <div className="absolute bottom-[10%] right-[5%] h-[25vh] w-[25vh] rounded-full bg-indigo-500/[0.04] blur-[80px] dark:bg-indigo-400/[0.07]" />
          </div>

          <div className="mx-auto max-w-3xl xl:max-w-4xl 2xl:max-w-5xl text-center">
            <AnimateInView containerRef={containerRef} amount={0.3} variants={stagger} className="mx-auto rounded-2xl md:rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-indigo-500/5 p-6 sm:p-10 md:p-16 xl:p-20 2xl:p-24 backdrop-blur-sm">
              <motion.div variants={fadeUp}>
                <LayoutGrid className="mx-auto mb-4 size-8 xl:size-10 text-violet-500" />
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl 2xl:text-6xl"
              >
                {t("finalCta.heading")}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mx-auto mt-4 max-w-lg xl:max-w-2xl xl:text-lg text-muted-foreground"
              >
                {t("finalCta.subheading")}
              </motion.p>
              <motion.div variants={fadeUp}>
                <Button
                  id="bottom-cta"
                  size="lg"
                  className="mt-8 xl:mt-10 h-12 xl:h-14 w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 xl:px-12 text-base xl:text-lg font-semibold text-white border-0 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
                  onClick={() => document.getElementById('generate')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t("finalCta.cta")}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </motion.div>
            </AnimateInView>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════
          FOOTER (inside snap container so no content leaks)
      ═══════════════════════════════════════════════════ */}
      <footer className="snap-section-footer relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 sm:px-6">
          <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <a
                href="/"
                className="flex items-center gap-2 text-lg font-bold tracking-tight"
              >
                <GraduationCap className="size-5 text-violet-500" />
                <span>
                  syllabi<span className="text-violet-500">.ai</span>
                </span>
              </a>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("footer.tagline")}
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://twitter.com/syllabi_ai"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Twitter"
                >
                  <MessageCircle className="size-4" />
                </a>
                <a
                  href="https://github.com/syllabi-ai"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="GitHub"
                >
                  <Globe className="size-4" />
                </a>
                <a
                  href="mailto:hello@syllabi.ai"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Email"
                >
                  <Mail className="size-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold">{t("footer.product")}</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">{t("footer.howItWorks")}</a></li>
                <li><a href="#examples" className="hover:text-foreground transition-colors">{t("footer.examples")}</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">{t("footer.pricing")}</a></li>
                <li><a href="/tutorial" className="hover:text-foreground transition-colors">{t("footer.tutorial")}</a></li>
                <li><a href="/docs#faq" className="hover:text-foreground transition-colors">{t("footer.api")}</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">{t("footer.contactUs")}</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold">{t("footer.resources")}</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="/docs" className="hover:text-foreground transition-colors">{t("footer.documentation")}</a></li>
                <li><a href="/blog" className="hover:text-foreground transition-colors">{t("footer.blog")}</a></li>
                <li><a href="/changelog" className="hover:text-foreground transition-colors">{t("footer.changelog")}</a></li>
                <li><a href="/support" className="hover:text-foreground transition-colors">{t("footer.support")}</a></li>
                <li>
                  <a href="https://docs.google.com/forms/d/e/1FAIpQLScHZQ9cSmQwUnDnHiSPSFaRyeS1Ijh4jbnueFAJ4fdedQZdfA/viewform" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors text-violet-400 font-medium">
                    {t("footer.feedback")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold">{t("footer.legal")}</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">{t("footer.privacyPolicy")}</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">{t("footer.termsOfService")}</a></li>
                <li><a href="/cookies" className="hover:text-foreground transition-colors">{t("footer.cookiePolicy")}</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              {t("footer.copyright").replace("{year}", String(new Date().getFullYear()))}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("footer.builtWith")}
            </p>
          </div>
        </div>
      </footer>
      </div> {/* end snap-scroll-container */}

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
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-4 px-3 md:py-8 md:px-4"
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
              {t("modal.closePreview")}
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
