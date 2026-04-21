"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Curriculum, DifficultyLevel, TeachingStyle, CourseStatusResponse } from "@/types/curriculum";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Target,
  User as UserIcon,
  Sparkles,
  Download,
  FileText,
  Sun,
  Moon,
  Search,
  Settings,
  LayoutGrid,
  Calendar,
  Crown,
  LogOut,
  Zap,
  TrendingUp,
  Shield,
  Bell,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Flame,
  ArrowUpRight,
  BarChart3,
  Headphones,
  Award,
  Share2,
  Check,
  Plus,
  Copy,
  Lightbulb,
  Rocket,
  Brain,
  Layers,
  History,
  Eye,
  Presentation,
  FileDown,
  Pencil,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { generateCurriculumPDF } from "@/lib/pdf/generatePDF";
import { generateNotionMarkdown } from "@/lib/exports/generateNotionMarkdown";
import { copyNotionHtmlToClipboard } from "@/lib/exports/generateNotionHtml";
import { generateCurriculumDocx } from "@/lib/exports/generateDocx";
import { generateStudentShareUrl } from "@/lib/exports/generateShareUrl";
import { normalizePlan } from "@/lib/pricing/tiers";
import { PlanBadge } from "@/components/dashboard/PlanBadge";
import { BenefitsStrip } from "@/components/dashboard/BenefitsStrip";
import { ExportGrid, type ExportFormat } from "@/components/dashboard/ExportGrid";
import { generateScormPackage } from "@/lib/exports/generateScorm";
import { generateNotebookLMMarkdown, notebookLMFilename } from "@/lib/exports/generateNotebookLMMarkdown";
import { generateNotebookLMSlidesMarkdown, notebookLMSlidesFilename, type SlideStyle } from "@/lib/exports/generateNotebookLMSlidesMarkdown";
import SlideStyleModal from "@/components/exports/SlideStyleModal";
import { curriculumToMarkdown } from "@/lib/exports/toMarkdown";
import { motion, AnimatePresence } from "framer-motion";
import CurriculumForm, { CurriculumFormData, CourseLength, type GenerationProgress } from "@/components/CurriculumForm";
import CourseAssemblyLoader from "@/components/CourseAssemblyLoader";
import CourseEditor from "@/components/CourseEditor";
import PaywallModal from "@/components/PaywallModal";
import OnboardingQuiz, { type OnboardingAnswers } from "@/components/OnboardingQuiz";
import WelcomeAnimation from "@/components/WelcomeAnimation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────

interface Generation {
  id: string;
  topic: string;
  audience: string;
  length: string;
  niche: string | null;
  curriculum: Curriculum | null;
  status: string;
  created_at: string;
  teaching_style?: TeachingStyle | null;
  /** Progress fields for chunked generation */
  generation_progress?: string | null;
  generation_total_modules?: number | null;
  generation_completed_modules?: number | null;
}

interface UserProfile {
  plan: string;
  generations_used: number;
  generations_limit: number;
}

type TabId = "overview" | "courses" | "settings" | "generate";

// ─── Constants ────────────────────────────────────────────────

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const difficultyGradients: Record<string, string> = {
  beginner: "from-emerald-500 to-teal-500",
  intermediate: "from-amber-500 to-orange-500",
  advanced: "from-rose-500 to-pink-500",
};

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "generate", label: "New Course", icon: Sparkles },
  { id: "settings", label: "Account", icon: Settings },
];

// Topic-based card gradients
const cardGradients = [
  { bg: "from-violet-500/8 via-indigo-500/4 to-violet-500/8", accent: "violet", border: "hover:border-violet-500/30" },
  { bg: "from-cyan-500/8 via-blue-500/4 to-cyan-500/8", accent: "cyan", border: "hover:border-cyan-500/30" },
  { bg: "from-rose-500/8 via-pink-500/4 to-rose-500/8", accent: "rose", border: "hover:border-rose-500/30" },
  { bg: "from-amber-500/8 via-orange-500/4 to-amber-500/8", accent: "amber", border: "hover:border-amber-500/30" },
  { bg: "from-emerald-500/8 via-teal-500/4 to-emerald-500/8", accent: "emerald", border: "hover:border-emerald-500/30" },
  { bg: "from-fuchsia-500/8 via-purple-500/4 to-fuchsia-500/8", accent: "fuchsia", border: "hover:border-fuchsia-500/30" },
];

// Smart suggestion templates based on topic patterns
const SUGGESTION_TEMPLATES = [
  { pattern: /market/i, suggestions: ["Digital Marketing Strategy", "Social Media Marketing Mastery", "Marketing Analytics & ROI"] },
  { pattern: /code|program|develop|software/i, suggestions: ["System Design Fundamentals", "Clean Code Architecture", "DevOps & CI/CD Pipeline"] },
  { pattern: /design/i, suggestions: ["UI/UX Design Principles", "Design Systems at Scale", "Figma Advanced Workflows"] },
  { pattern: /data|analy/i, suggestions: ["Data Visualization Mastery", "SQL for Data Analysis", "Machine Learning Foundations"] },
  { pattern: /ai|machine|deep|neural/i, suggestions: ["Prompt Engineering Mastery", "AI for Business Leaders", "Building AI Products"] },
  { pattern: /business|manage|lead/i, suggestions: ["Strategic Leadership", "Product Management Essentials", "Startup Growth Hacking"] },
  { pattern: /write|content|copy/i, suggestions: ["Technical Writing Excellence", "Copywriting Frameworks", "Content Strategy Blueprint"] },
  { pattern: /finance|invest|money/i, suggestions: ["Financial Modeling Fundamentals", "Investment Strategy", "Corporate Finance Essentials"] },
  { pattern: /health|wellness|fitness/i, suggestions: ["Nutrition Science Basics", "Exercise Programming", "Mental Health Awareness"] },
  { pattern: /photo|video|film/i, suggestions: ["Cinematography Essentials", "Video Editing Workflows", "Visual Storytelling"] },
];

const FALLBACK_SUGGESTIONS = [
  "Introduction to AI & Machine Learning",
  "Public Speaking & Presentation Skills",
  "Personal Finance Masterclass",
  "Creative Problem Solving",
  "Emotional Intelligence at Work",
];

// ─── Animation Variants ──────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// ─── Helpers ─────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Build a 12-week activity heatmap from generation dates */
function buildHeatmap(generations: Generation[]): { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] {
  const today = new Date();
  const days: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
  const countMap = new Map<string, number>();
  generations.forEach((g) => {
    const d = new Date(g.created_at).toISOString().slice(0, 10);
    countMap.set(d, (countMap.get(d) || 0) + 1);
  });
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = countMap.get(key) || 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4;
    days.push({ date: key, count, level: level as 0 | 1 | 2 | 3 | 4 });
  }
  return days;
}

/** Calculate current streak */
function getStreak(generations: Generation[]): number {
  if (generations.length === 0) return 0;
  const dates = new Set(generations.map((g) => new Date(g.created_at).toISOString().slice(0, 10)));
  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);
  const todayStr = checkDate.toISOString().slice(0, 10);
  if (!dates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (!dates.has(checkDate.toISOString().slice(0, 10))) return 0;
  }
  checkDate = new Date(today);
  if (!dates.has(todayStr)) checkDate.setDate(checkDate.getDate() - 1);
  while (dates.has(checkDate.toISOString().slice(0, 10))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

/** Get smart suggestions based on user's past topics */
function getSmartSuggestions(generations: Generation[]): { title: string; reason: string }[] {
  if (generations.length === 0) {
    return FALLBACK_SUGGESTIONS.slice(0, 4).map((s) => ({ title: s, reason: "Popular on Syllabi" }));
  }

  const allTopics = generations.map((g) => g.topic || g.curriculum?.title || "").filter(Boolean);
  const allNiches = generations.map((g) => g.niche || "").filter(Boolean);
  const combined = [...allTopics, ...allNiches].join(" ");

  const matched = new Set<string>();
  const results: { title: string; reason: string }[] = [];

  // Match against patterns
  for (const tmpl of SUGGESTION_TEMPLATES) {
    if (tmpl.pattern.test(combined)) {
      for (const s of tmpl.suggestions) {
        // Don't suggest topics they've already created
        const alreadyDone = allTopics.some(
          (t) => t.toLowerCase().includes(s.toLowerCase().split(" ")[0].toLowerCase())
        );
        if (!alreadyDone && !matched.has(s)) {
          matched.add(s);
          results.push({ title: s, reason: "Based on your interests" });
        }
      }
    }
  }

  // If we have less than 4, add some trending suggestions
  if (results.length < 4) {
    const trending = [
      { title: "AI Automation for Professionals", reason: "Trending now" },
      { title: "No-Code App Development", reason: "Popular this month" },
      { title: "Storytelling for Business", reason: "Rising interest" },
      { title: "Remote Team Leadership", reason: "Trending now" },
      { title: "Blockchain Fundamentals", reason: "Popular this month" },
    ];
    for (const t of trending) {
      if (!matched.has(t.title) && results.length < 4) {
        matched.add(t.title);
        results.push(t);
      }
    }
  }

  return results.slice(0, 4);
}

/** Determine card gradient index from generation data */
function getCardGradientIdx(gen: Generation): number {
  const str = (gen.topic || "") + (gen.id || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  return Math.abs(hash) % cardGradients.length;
}

/** Format relative time */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Heatmap cell colors ─────────────────────────────────────

const heatmapColors: Record<number, string> = {
  0: "bg-muted/30",
  1: "bg-violet-500/20",
  2: "bg-violet-500/40",
  3: "bg-violet-500/60",
  4: "bg-violet-500/90",
};

// ─── Circular Progress Ring ──────────────────────────────────

function ProgressRing({
  percent, size = 80, stroke = 6, color = "text-violet-500",
}: { percent: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/30" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className={`${color} transition-all duration-1000 ease-out`} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [templateConfig, setTemplateConfig] = useState<Partial<CurriculumFormData> | null>(null);
  const [duplicateConfig, setDuplicateConfig] = useState<Partial<CurriculumFormData> | null>(null);
  const [dark, setDark] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingGenId, setEditingGenId] = useState<string | null>(null);
  const [slideExport, setSlideExport] = useState<{ curriculum: Curriculum; defaultStyle: SlideStyle } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState<GenerationProgress | null>(null);

  const handleFormLoadingChange = useCallback((loading: boolean) => {
    setIsGenerating(loading);
    if (!loading) setGenProgress(null);
  }, []);

  const handleFormProgressUpdate = useCallback((p: GenerationProgress) => {
    setGenProgress((prev) => ({
      topic: p.topic ?? prev?.topic,
      status: p.status,
      progress: p.progress ?? prev?.progress,
      completedModules: p.completedModules ?? prev?.completedModules,
      totalModules: p.totalModules ?? prev?.totalModules,
    }));
  }, []);

  // ─── Inflight handoff from the landing page ───────────────────
  // When the landing-page form posts /api/generate, it hands the courseId off
  // here via ?tab=generate&courseId=&topic=. We pick up the in-flight job and
  // resume polling locally so the user finishes the wait inside the dashboard.
  const [externalCourseId, setExternalCourseId] = useState<string | null>(null);
  const externalPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Read URL params for welcome animation, onboarding, AND inflight handoff
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "true") {
      setShowWelcome(true);
      // Clean URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      url.searchParams.delete("onboarding");
      window.history.replaceState({}, "", url.pathname);
    }
    if (params.get("onboarding") === "true") {
      // Will show after welcome animation completes
      setShowOnboarding(true);
    }

    // Inflight generation handoff from the landing page
    const tab = params.get("tab");
    const cid = params.get("courseId");
    const topic = params.get("topic");
    if (tab === "generate" && cid) {
      setActiveTab("generate");
      setExternalCourseId(cid);
      setIsGenerating(true);
      setGenProgress({
        status: "pending",
        topic: topic ?? undefined,
      });
      // Strip the handoff params so a refresh doesn't replay the takeover.
      const url = new URL(window.location.href);
      url.searchParams.delete("tab");
      url.searchParams.delete("courseId");
      url.searchParams.delete("topic");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  }, []);

  // ─── External polling loop ────────────────────────────────────
  // Drives the loader when the courseId came from a URL handoff (not from a
  // form submit inside the profile). Stops the moment the course is ready or
  // failed, then refreshes the dashboard generations list.
  useEffect(() => {
    if (!externalCourseId) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/courses/${externalCourseId}/status`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return;
        const data: CourseStatusResponse = await res.json();
        if (cancelled) return;

        setGenProgress((prev) => ({
          status: data.status,
          topic: prev?.topic,
          progress: data.generation_progress ?? prev?.progress,
          completedModules: data.generation_completed_modules ?? prev?.completedModules,
          totalModules: data.generation_total_modules ?? prev?.totalModules,
        }));

        if (data.status === "ready" || data.status === "failed") {
          if (externalPollRef.current) {
            clearInterval(externalPollRef.current);
            externalPollRef.current = null;
          }
          setExternalCourseId(null);
          setIsGenerating(false);
          // Refresh the dashboard list and slide the user into "courses" so
          // they can open the freshly-built course (or see the error card).
          const { data: courses } = await supabaseBrowser
            .from("courses")
            .select("id, topic, audience, length, niche, curriculum, status, created_at, teaching_style, generation_progress, generation_total_modules, generation_completed_modules")
            .order("created_at", { ascending: false });
          if (courses && !cancelled) {
            setGenerations(courses as unknown as Generation[]);
          }
          if (!cancelled) {
            setActiveTab("courses");
            setGenProgress(null);
          }
        }
      } catch (err) {
        // Network blips are fine — the next tick will retry.
        console.warn("[profile] inflight poll error:", err);
      }
    };

    // Fire immediately, then every 3s
    poll();
    externalPollRef.current = setInterval(poll, 3000);

    return () => {
      cancelled = true;
      if (externalPollRef.current) {
        clearInterval(externalPollRef.current);
        externalPollRef.current = null;
      }
    };
  }, [externalCourseId]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      setUser(user);
      if (user) {
        const [{ data: courses }, { data: profileData }] = await Promise.all([
          supabaseBrowser.from("courses").select("id, topic, audience, length, niche, curriculum, status, created_at, teaching_style, generation_progress, generation_total_modules, generation_completed_modules").order("created_at", { ascending: false }),
          supabaseBrowser.from("profiles").select("plan, generations_used, generations_limit").eq("id", user.id).single(),
        ]);
        if (courses) setGenerations(courses as unknown as Generation[]);
        setUserProfile(
          (profileData as UserProfile | null) ?? { plan: "free", generations_used: 0, generations_limit: 3 }
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  // Poll for generating courses — refresh every 5s while any course is generating.
  // Depend on `hasGenerating` (a derived boolean) instead of `generations` so the
  // interval isn't torn down and recreated on every setGenerations call.
  const hasGenerating = useMemo(
    () => generations.some((g) => g.status === "generating"),
    [generations],
  );
  useEffect(() => {
    if (!hasGenerating || !user) return;

    const interval = setInterval(async () => {
      const { data: courses } = await supabaseBrowser
        .from("courses")
        .select("id, topic, audience, length, niche, curriculum, status, created_at, teaching_style, generation_progress, generation_total_modules, generation_completed_modules")
        .order("created_at", { ascending: false });
      if (courses) setGenerations(courses as unknown as Generation[]);

      const { data: profileData } = await supabaseBrowser
        .from("profiles")
        .select("plan, generations_used, generations_limit")
        .eq("id", user.id)
        .single();
      if (profileData) setUserProfile(profileData as UserProfile);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasGenerating, user]);

  // ── Derived stats ──────────────────────────────────────────

  // Only courses with status="ready" and valid curriculum are safe for stats/cards
  // ── Course Templates ────────────────────────────────────
  const COURSE_TEMPLATES: { title: string; icon: React.ElementType; description: string; config: Partial<CurriculumFormData> }[] = [
    {
      title: "Quick Workshop",
      icon: Zap,
      description: "5 lessons, 1-2 modules",
      config: { courseLength: "crash", difficulty: "beginner" },
    },
    {
      title: "Full Course",
      icon: BookOpen,
      description: "12-18 lessons, 4-6 modules",
      config: { courseLength: "full", difficulty: "intermediate" },
    },
    {
      title: "Bootcamp Intensive",
      icon: Flame,
      description: "20+ lessons, 6-10 modules",
      config: { courseLength: "masterclass", difficulty: "intermediate" },
    },
    {
      title: "Storytelling Deep Dive",
      icon: Brain,
      description: "Narrative-driven course",
      config: { courseLength: "full", difficulty: "advanced", teachingStyle: "storytelling" },
    },
  ];

  // ── Template & Duplicate Handlers ────────────────────────
  const handleSelectTemplate = useCallback((config: Partial<CurriculumFormData>) => {
    setTemplateConfig(config);
    setDuplicateConfig(null);
    setActiveTab("generate");
  }, []);

  const handleDuplicateCourse = useCallback((gen: Generation) => {
    const c = gen.curriculum;
    const config: Partial<CurriculumFormData> = {
      topic: c?.title || gen.topic || "",
      difficulty: (c?.difficulty || gen.audience || "beginner") as DifficultyLevel,
      courseLength: (gen.length as CourseLength) || "full",
      niche: gen.niche || "",
      abstract: c?.description || "",
      learnerProfile: c?.targetAudience || "",
    };
    setDuplicateConfig(config);
    setTemplateConfig(null);
    setActiveTab("generate");
  }, []);

  const handleRetryFailed = useCallback((gen: Generation) => {
    const config: Partial<CurriculumFormData> = {
      topic: gen.topic || "",
      difficulty: (gen.audience || "beginner") as DifficultyLevel,
      courseLength: (gen.length as CourseLength) || "full",
      niche: gen.niche || "",
    };
    setDuplicateConfig(config);
    setTemplateConfig(null);
    setActiveTab("generate");
  }, []);

  const handleDismissFailed = useCallback(async (genId: string) => {
    const { error } = await supabaseBrowser.from("courses").delete().eq("id", genId);
    if (!error) {
      setGenerations((prev) => prev.filter((g) => g.id !== genId));
    } else {
      console.error("Failed to dismiss failed course:", error);
    }
  }, []);

  const handleFormGenerated = useCallback(async () => {
    // Refresh the generations list from Supabase
    const { data: courses } = await supabaseBrowser
      .from("courses")
      .select("id, topic, audience, length, niche, curriculum, status, created_at")
      .order("created_at", { ascending: false });
    if (courses) setGenerations(courses as unknown as Generation[]);
    setTemplateConfig(null);
    setDuplicateConfig(null);
    setActiveTab("courses");
  }, []);

  const readyGenerations = useMemo(
    () => generations.filter((g) => g.status === "ready" && g.curriculum != null),
    [generations]
  );

  // Courses still being generated — shown as loading cards in dashboard
  const generatingCourses = useMemo(
    () => generations.filter((g) => g.status === "generating"),
    [generations]
  );

  // Courses that failed generation — shown with retry / dismiss affordance
  const failedGenerations = useMemo(
    () => generations.filter((g) => g.status === "failed" || g.status === "error"),
    [generations]
  );

  const filteredGenerations = useMemo(() => {
    if (!searchQuery.trim()) return readyGenerations;
    const q = searchQuery.toLowerCase();
    return readyGenerations.filter((g) =>
      g.curriculum?.title?.toLowerCase().includes(q) ||
      g.topic?.toLowerCase().includes(q) ||
      g.curriculum?.difficulty?.toLowerCase().includes(q)
    );
  }, [readyGenerations, searchQuery]);

  const totalHours = useMemo(
    () => readyGenerations.reduce((sum, g) => sum + (g.curriculum?.pacing?.totalHours || 0), 0),
    [readyGenerations]
  );

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return readyGenerations.filter((g) => {
      const d = new Date(g.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [readyGenerations]);

  const totalLessonsAll = useMemo(
    () => readyGenerations.reduce((sum, g) => sum + (g.curriculum?.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0), 0),
    [readyGenerations]
  );

  const totalQuizzes = useMemo(
    () => readyGenerations.reduce((sum, g) => sum + (g.curriculum?.modules?.reduce((a, m) => a + (m.quiz?.length || 0), 0) || 0), 0),
    [readyGenerations]
  );

  const difficultyBreakdown = useMemo(() => {
    const counts = { beginner: 0, intermediate: 0, advanced: 0 };
    readyGenerations.forEach((g) => {
      const d = g.curriculum?.difficulty?.toLowerCase() || "beginner";
      if (d in counts) counts[d as keyof typeof counts]++;
    });
    return counts;
  }, [readyGenerations]);

  const heatmapData = useMemo(() => buildHeatmap(readyGenerations), [readyGenerations]);
  const streak = useMemo(() => getStreak(readyGenerations), [readyGenerations]);
  const suggestions = useMemo(() => getSmartSuggestions(readyGenerations), [readyGenerations]);

  // Group generations by date for timeline
  const timelineGroups = useMemo(() => {
    const groups: { label: string; date: string; items: Generation[] }[] = [];
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(new Date().getTime() - 86400000).toISOString().slice(0, 10);

    const dateMap = new Map<string, Generation[]>();
    readyGenerations.forEach((g) => {
      const d = new Date(g.created_at).toISOString().slice(0, 10);
      if (!dateMap.has(d)) dateMap.set(d, []);
      dateMap.get(d)!.push(g);
    });

    dateMap.forEach((items, date) => {
      let label: string;
      if (date === today) label = "Today";
      else if (date === yesterday) label = "Yesterday";
      else {
        label = new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      }
      groups.push({ label, date, items });
    });

    return groups;
  }, [generations]);

  // ── Handlers ───────────────────────────────────────────────

  const handleDownloadPDF = useCallback(
    (curriculum: Curriculum, teachingStyle?: TeachingStyle | null) => {
      try {
        const pdf = generateCurriculumPDF(curriculum, { teachingStyle });
        pdf.save(`${curriculum.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_syllabus.pdf`);
      } catch (e) {
        console.error("Failed to generate PDF:", e);
      }
    },
    [],
  );

  const handleExportNotion = useCallback(async (curriculum: Curriculum, teachingStyle?: TeachingStyle | null) => {
    await copyNotionHtmlToClipboard(curriculum, { teachingStyle });
    // Brief visual feedback — the button text could be updated via state if needed
  }, []);

  const handleExportDocx = useCallback(async (curriculum: Curriculum, teachingStyle?: TeachingStyle | null) => {
    try {
      const blob = await generateCurriculumDocx(curriculum, { teachingStyle });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${curriculum.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_course.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export DOCX:", e);
    }
  }, []);

  const handleShareCourse = useCallback(async (gen: Generation) => {
    if (!gen.curriculum) return;
    try {
      // Flip is_public so /s/[id] becomes accessible to students and
      // quiz_attempts inserts are allowed by RLS.
      const { error } = await supabaseBrowser
        .from("courses")
        .update({ is_public: true })
        .eq("id", gen.id);
      if (error) console.error("Failed to make course public:", error);
      const url = generateStudentShareUrl(gen.id);
      await navigator.clipboard.writeText(url);
      setCopiedId(gen.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Share failed:", err);
    }
  }, []);

  const handleCopyMarkdown = useCallback(async (curriculum: Curriculum) => {
    try {
      await navigator.clipboard.writeText(curriculumToMarkdown(curriculum));
    } catch (e) {
      console.error("Copy markdown failed:", e);
    }
  }, []);

  const sanitizeForFilename = useCallback((title: string) => title.replace(/[^a-z0-9]/gi, "_").toLowerCase(), []);

  const handleExportScorm = useCallback(async (curriculum: Curriculum, teachingStyle?: TeachingStyle | null) => {
    try {
      const blob = await generateScormPackage(curriculum, { teachingStyle });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeForFilename(curriculum.title)}_scorm.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("SCORM export failed:", e);
    }
  }, [sanitizeForFilename]);

  const handleExportNotebookLMAudio = useCallback((curriculum: Curriculum) => {
    try {
      const md = generateNotebookLMMarkdown(curriculum);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = notebookLMFilename(curriculum);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("NotebookLM audio export failed:", e);
    }
  }, []);

  const runSlideExport = useCallback((curriculum: Curriculum, style: SlideStyle) => {
    try {
      const md = generateNotebookLMSlidesMarkdown(curriculum, { style });
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = notebookLMSlidesFilename(curriculum, style);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("NotebookLM slides export failed:", e);
    }
  }, []);

  const handleExportNotebookLMSlides = useCallback((curriculum: Curriculum, teachingStyle?: TeachingStyle | null) => {
    const defaultStyle: SlideStyle =
      teachingStyle === "academic"
        ? "academic"
        : teachingStyle === "hands-on"
        ? "executive"
        : "conversational";
    setSlideExport({ curriculum, defaultStyle });
  }, []);

  // ── Course editor save handler ────────────────────────────
  const handleSaveEditedCourse = useCallback(async (genId: string, updated: Curriculum) => {
    // Update local state immediately
    setGenerations((prev) =>
      prev.map((g) => (g.id === genId ? { ...g, curriculum: updated, topic: updated.title } : g))
    );
    setEditingGenId(null);

    // Persist to Supabase
    try {
      await supabaseBrowser.from("courses").update({ curriculum: JSON.parse(JSON.stringify(updated)) }).eq("id", genId);
    } catch (e) {
      console.error("Failed to save edited course:", e);
    }
  }, []);

  // ── Onboarding complete handler ────────────────────────────
  const handleOnboardingComplete = useCallback(async (answers: OnboardingAnswers) => {
    setShowOnboarding(false);
    // Save answers to localStorage for now (Filippo needs to add DB columns)
    // Once onboarding_role, onboarding_industry, onboarding_audience columns
    // exist in profiles table, this should write to Supabase instead.
    if (user) {
      try {
        localStorage.setItem(`syllabi_onboarding_${user.id}`, JSON.stringify(answers));
      } catch (err) {
        console.error("[ProfilePage] Failed to save onboarding answers:", err);
      }
    }
  }, [user]);

  // ── Welcome animation complete → show quiz if needed ──────
  const handleWelcomeComplete = useCallback(() => {
    setShowWelcome(false);
    // If onboarding flag was set, show quiz after welcome animation
    // (showOnboarding was already set from URL params)
  }, []);

  // ── Sign-in gate ───────────────────────────────────────────

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="relative mx-auto mb-5 w-fit">
              <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full scale-150" />
              <div className="relative flex items-center justify-center size-16 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                <UserIcon className="size-8 text-violet-500" />
              </div>
            </div>
            <h1 className="text-xl font-bold mb-2">Sign in to view your dashboard</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in with Google to see your generated courses, track your usage, and manage your account.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setActiveTab("generate")}>Start Creating</Button>
              <Button
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
                onClick={async () => {
                  await supabaseBrowser.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: `${window.location.origin}/auth/callback?next=/profile` },
                  });
                }}
              >
                Sign in with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Plan helpers ───────────────────────────────────────────

  const avatarUrl = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const firstName = name.split(" ")[0];

  const plan = normalizePlan(userProfile?.plan);
  const planLabel = plan.label;
  const planBadgeClass =
    plan.isMasterclass ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : plan.isPlanner ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
    : "border-border/60 text-muted-foreground";

  const usagePercent = userProfile
    ? Math.min(100, (userProfile.generations_used / Math.max(userProfile.generations_limit, 1)) * 100)
    : 0;

  // ═══════════════════════════════════════════════════════════
  // RICH COURSE CARD
  // ═══════════════════════════════════════════════════════════

  function FailedCourseCard({
    gen,
    onRetry,
    onDismiss,
  }: {
    gen: Generation;
    onRetry: () => void;
    onDismiss: () => void;
  }) {
    return (
      <Card className="relative border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-rose-500/3 to-rose-500/5 overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500" />
        <CardHeader className="relative pb-2 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-snug text-rose-400 truncate">{gen.topic}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Generation failed — retry or dismiss</p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0 bg-rose-500/10 text-rose-400 border-rose-500/20">
              <AlertTriangle className="size-2.5 mr-1" />
              Failed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative pt-0">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onRetry}
              className="h-8 text-[11px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 rounded-full px-3 min-h-[32px]"
            >
              <RefreshCw className="size-3 mr-1.5" />
              Retry
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-8 text-[11px] text-muted-foreground hover:text-rose-400 min-h-[32px]"
            >
              <Trash2 className="size-3 mr-1.5" />
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  function CourseCard({ gen, index }: { gen: Generation; index: number }) {
    const c = gen.curriculum;
    // Guard: skip rendering if curriculum is null (generating/failed courses)
    if (!c) return null;
    const totalLessons = c.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0;
    const totalQuiz = c.modules?.reduce((a, m) => a + (m.quiz?.length || 0), 0) || 0;
    const isExpanded = expandedId === gen.id;
    const gIdx = getCardGradientIdx(gen);
    const gradient = cardGradients[gIdx];

    return (
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ delay: index * 0.04, duration: 0.35 }}
      >
        <Card
          className={`group relative border-border/40 bg-gradient-to-br ${gradient.bg} backdrop-blur-sm ${gradient.border} hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer overflow-hidden`}
          onClick={() => setExpandedId(isExpanded ? null : gen.id)}
        >
          {/* Difficulty accent bar */}
          <div className={`h-[2px] bg-gradient-to-r ${difficultyGradients[c.difficulty] || difficultyGradients.beginner}`} />

          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute -top-20 -right-20 size-40 bg-violet-500/5 rounded-full blur-3xl" />
          </div>

          <CardHeader className="relative pb-2 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-violet-400 transition-colors duration-200">
                  {c.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{c.subtitle}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${difficultyColors[c.difficulty] || ""}`}>
                {c.difficulty}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="relative pt-0">
            {/* Quick stats row */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Layers className="size-3 opacity-60" />
                <span>{c.modules?.length || 0} modules</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <BookOpen className="size-3 opacity-60" />
                <span>{totalLessons} lessons</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3 opacity-60" />
                <span>{c.pacing?.totalHours || 0}h</span>
              </div>
              {totalQuiz > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Award className="size-3 opacity-60" />
                  <span>{totalQuiz} quiz</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{c.description}</p>

            {/* Tags */}
            {c.tags && c.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {c.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/40 text-muted-foreground">{tag}</span>
                ))}
                {c.tags.length > 3 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/40 text-muted-foreground">+{c.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Footer: date + actions + Exports pill */}
            <div className="flex items-center justify-between pt-2 border-t border-border/20 gap-2">
              <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(gen.created_at)}</span>
              <div className="flex gap-0.5">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-indigo-500/10 hover:text-indigo-400" onClick={(e) => { e.stopPropagation(); setEditingGenId(gen.id); setActiveTab("courses"); }} title="Edit Course">
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-cyan-500/10 hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); handleShareCourse(gen); }} title="Share">
                  {copiedId === gen.id ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
                </Button>
                <Button
                  variant="ghost" size="sm"
                  className="h-7 w-7 p-0 hover:bg-amber-500/10 hover:text-amber-400"
                  onClick={(e) => { e.stopPropagation(); window.open(`/course/${gen.id}`, "_blank"); }}
                  title="View Course"
                >
                  <Eye className="size-3.5" />
                </Button>
                <Button
                  variant="ghost" size="sm"
                  className="h-7 w-7 p-0 hover:bg-pink-500/10 hover:text-pink-400"
                  onClick={(e) => { e.stopPropagation(); handleDuplicateCourse(gen); setActiveTab("generate"); }}
                  title="Duplicate & Remix"
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : gen.id); }}
                className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-gradient-to-r from-violet-600/15 to-indigo-600/15 px-2.5 py-1 text-[11px] font-medium text-violet-300 hover:from-violet-600/25 hover:to-indigo-600/25 transition-colors shrink-0"
                title="Show export formats"
              >
                Exports <span className="text-[9px] opacity-70">{isExpanded ? "▲" : "▼"}</span>
              </button>
            </div>

            {/* €10 Upgrade-to-Masterclass CTA for Planner users */}
            {plan.isPlanner && (
              <div className="mt-3 pt-3 border-t border-border/20" onClick={(e) => e.stopPropagation()}>
                <CheckoutButton
                  href={`/api/checkout?tier=single_masterclass&course_id=${gen.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow hover:shadow-lg transition-all"
                  disabledClassName="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium bg-muted text-muted-foreground cursor-not-allowed opacity-60 pointer-events-none"
                  launchingLabel="Upgrade €10 — launching tomorrow"
                >
                  Upgrade to Masterclass — €10
                </CheckoutButton>
              </div>
            )}

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border/20 space-y-4" onClick={(e) => e.stopPropagation()}>
                    {/* Tier-aware export grid */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Download className="size-3" /> Export
                      </p>
                      <ExportGrid
                        tier={plan.tier}
                        onExport={(format: ExportFormat) => {
                          switch (format) {
                            case "pdf":       return handleDownloadPDF(c, gen.teaching_style);
                            case "word":      return handleExportDocx(c, gen.teaching_style);
                            case "markdown":  return handleCopyMarkdown(c);
                            case "notion":    return handleExportNotion(c, gen.teaching_style);
                            case "scorm":     return handleExportScorm(c, gen.teaching_style);
                            case "nlmAudio":  return handleExportNotebookLMAudio(c);
                            case "nlmSlides": return handleExportNotebookLMSlides(c, gen.teaching_style);
                            case "share":     return handleShareCourse(gen);
                          }
                        }}
                        onLockedClick={() => setShowPaywall(true)}
                        onDeepLink={() => window.open(`/course/${gen.id}#export-share`, "_blank")}
                      />
                    </div>

                    <Separator className="border-border/20" />

                    {/* Learning objectives */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Target className="size-3" /> Learning Objectives
                      </p>
                      <ul className="space-y-1">
                        {c.objectives?.slice(0, 5).map((obj, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-violet-500 mt-0.5 shrink-0">•</span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Module list with progress-like visual */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Layers className="size-3" /> Modules
                      </p>
                      <div className="space-y-1.5">
                        {c.modules?.map((mod, i) => (
                          <div key={i} className="flex items-center gap-2 group/mod">
                            <div className="flex items-center justify-center size-5 rounded-md bg-violet-500/10 text-violet-400 text-[9px] font-bold shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground/90 truncate">{mod.title}</p>
                            </div>
                            <span className="text-[9px] text-muted-foreground shrink-0">{mod.lessons?.length || 0} lessons</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300" style={{ scrollSnapType: "none", height: "auto", overflow: "visible" }}>
      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.online</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button
              size="sm"
              className="text-xs gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 rounded-full px-4 hidden sm:flex hover:shadow-lg hover:shadow-violet-500/20 transition-shadow"
              onClick={() => (setActiveTab("generate"))}
            >
              <Plus className="size-3.5" />
              New Course
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 sm:px-6">

        {/* ══════════════════════════════════════════════════
            WELCOME BANNER (Overview only)
        ══════════════════════════════════════════════════ */}
        {!loading && user && activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-cyan-500/10 p-5 sm:p-6">
              <div className="absolute -top-16 -right-16 size-48 rounded-full bg-violet-500/8 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 size-36 rounded-full bg-cyan-500/8 blur-3xl" />
              <div className="relative flex items-center gap-4">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name}
                    width={64}
                    height={64}
                    unoptimized
                    className="size-14 sm:size-16 rounded-2xl ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/20 shrink-0 object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center size-14 sm:size-16 rounded-2xl bg-violet-500/15 text-violet-500 ring-2 ring-violet-500/30 shrink-0">
                    <UserIcon className="size-7 sm:size-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-violet-500 dark:text-violet-400 font-medium">{getGreeting()},</p>
                  <h1 className="text-xl sm:text-2xl font-bold truncate">{firstName}</h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <PlanBadge tier={plan.tier} label={`${plan.label} Plan`} />
                    {streak > 0 && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1 border-amber-500/30 text-amber-400 bg-amber-500/10">
                        <Flame className="size-3" />
                        {streak} day streak
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs border-border/40 text-muted-foreground">
                      {readyGenerations.length} course{readyGenerations.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" className="sm:hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shrink-0 rounded-full" onClick={() => (setActiveTab("generate"))}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Profile Header (other tabs) ────────────────── */}
        {activeTab !== "overview" && (
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={64}
                height={64}
                unoptimized
                className="size-12 sm:size-16 rounded-2xl ring-2 ring-violet-500/30 shadow-lg shrink-0 object-cover"
              />
            ) : (
              <div className="flex items-center justify-center size-12 sm:size-16 rounded-2xl bg-violet-500/15 text-violet-500 ring-2 ring-violet-500/30 shrink-0">
                <UserIcon className="size-6 sm:size-8" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{name}</h1>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <PlanBadge tier={plan.tier} label={`${plan.label} Plan`} />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Navigation ──────────────────────────────── */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="flex gap-0 mb-6 sm:mb-8 border-b border-border/40 overflow-x-auto scrollbar-hide"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 min-h-[44px] px-3 sm:px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background ${
                  selected ? "text-violet-500 border-violet-500" : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">

            {/* ── BENEFITS STRIP ──────────────────────────── */}
            {userProfile && (
              <motion.div variants={fadeUp}>
                <BenefitsStrip
                  tier={plan.tier}
                  creditsUsed={userProfile.generations_used}
                  creditsLimit={userProfile.generations_limit}
                  onUpgrade={() => setShowPaywall(true)}
                />
              </motion.div>
            )}

            {/* ── STAT CARDS ──────────────────────────────── */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Courses", value: loading ? "—" : readyGenerations.length, sub: `${thisMonthCount} this month`, icon: BookOpen, gradient: "from-violet-500/15 to-indigo-500/15", iconBg: "bg-violet-500/15", iconColor: "text-violet-400", border: "border-violet-500/15" },
                { label: "Learning Hours", value: loading ? "—" : `${totalHours}h`, sub: `${totalLessonsAll} total lessons`, icon: Clock, gradient: "from-cyan-500/15 to-blue-500/15", iconBg: "bg-cyan-500/15", iconColor: "text-cyan-400", border: "border-cyan-500/15" },
                { label: "Quiz Questions", value: loading ? "—" : totalQuizzes, sub: `across all courses`, icon: Award, gradient: "from-amber-500/15 to-orange-500/15", iconBg: "bg-amber-500/15", iconColor: "text-amber-400", border: "border-amber-500/15" },
                { label: "Day Streak", value: loading ? "—" : streak, sub: streak > 0 ? "Keep it going!" : "Generate today!", icon: Flame, gradient: "from-rose-500/15 to-pink-500/15", iconBg: "bg-rose-500/15", iconColor: "text-rose-400", border: "border-rose-500/15" },
              ].map(({ label, value, sub, icon: Icon, gradient, iconBg, iconColor, border }) => (
                <Card key={label} className={`${border} bg-gradient-to-br ${gradient} backdrop-blur-sm hover:scale-[1.02] transition-all duration-200 overflow-hidden relative group`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute -top-10 -right-10 size-24 bg-white/[0.02] rounded-full blur-xl" />
                  </div>
                  <CardContent className="relative p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center justify-center size-9 rounded-xl ${iconBg}`}>
                        <Icon className={`size-[18px] ${iconColor}`} />
                      </div>
                      <ArrowUpRight className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* ── QUICK ACTIONS HUB ──────────────────────── */}
            <motion.div variants={fadeUp}>
              <Card className="border-border/40 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center size-7 rounded-lg bg-violet-500/15">
                      <Rocket className="size-3.5 text-violet-400" />
                    </div>
                    <h3 className="text-sm font-semibold">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => (setActiveTab("generate"))}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 sm:p-4 hover:bg-violet-500/10 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 group-hover:scale-110 transition-transform duration-200">
                        <Sparkles className="size-5 text-violet-400" />
                      </div>
                      <span className="text-xs font-medium text-violet-400">New Course</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("courses")}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 sm:p-4 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:scale-110 transition-transform duration-200">
                        <BookOpen className="size-5 text-cyan-400" />
                      </div>
                      <span className="text-xs font-medium text-cyan-400">My Courses</span>
                    </button>

                    {readyGenerations.length > 0 && (
                      <button
                        onClick={() => {
                          const latest = readyGenerations[0];
                          if (latest?.curriculum) handleDownloadPDF(latest.curriculum, latest.teaching_style);
                        }}
                        className="group flex flex-col items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200"
                      >
                        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:scale-110 transition-transform duration-200">
                          <FileDown className="size-5 text-amber-400" />
                        </div>
                        <span className="text-xs font-medium text-amber-400">Last PDF</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab("settings")}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-border/30 bg-muted/5 p-3 sm:p-4 hover:bg-muted/10 hover:border-border/50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center size-10 rounded-xl bg-muted/20 group-hover:scale-110 transition-transform duration-200">
                        <Settings className="size-5 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Settings</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── ACTIVITY HEATMAP + USAGE RING ────────────── */}
            <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">
              <Card className="sm:col-span-2 border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="size-4 text-violet-500" />
                    Activity
                    <span className="text-[10px] text-muted-foreground font-normal ml-auto">Last 12 weeks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[100px] bg-muted/20 rounded-lg animate-pulse" />
                  ) : (
                    <>
                      <div className="grid grid-cols-12 gap-[3px]">
                        {Array.from({ length: 12 }, (_, weekIdx) => (
                          <div key={weekIdx} className="flex flex-col gap-[3px]">
                            {heatmapData.slice(weekIdx * 7, weekIdx * 7 + 7).map((day, dayIdx) => (
                              <div key={dayIdx}
                                className={`aspect-square rounded-[3px] ${heatmapColors[day.level]} transition-all hover:ring-1 hover:ring-violet-400/50 hover:scale-125`}
                                title={`${day.date}: ${day.count} course${day.count !== 1 ? "s" : ""}`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-[10px] text-muted-foreground">{readyGenerations.length} course{readyGenerations.length !== 1 ? "s" : ""} total</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span>Less</span>
                          {[0, 1, 2, 3, 4].map((lvl) => (
                            <div key={lvl} className={`size-2.5 rounded-[2px] ${heatmapColors[lvl]}`} />
                          ))}
                          <span>More</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Usage Ring */}
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="size-4 text-violet-500" />
                    Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[120px] bg-muted/20 rounded-lg animate-pulse" />
                  ) : plan.isMasterclass && userProfile && (userProfile.generations_limit < 0 || userProfile.generations_limit >= 1000) ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="relative">
                        <ProgressRing percent={100} color="text-amber-400" />
                        <div className="absolute inset-0 flex items-center justify-center"><Crown className="size-6 text-amber-400" /></div>
                      </div>
                      <p className="text-xs font-semibold mt-3">Unlimited</p>
                      <p className="text-[10px] text-muted-foreground">Masterclass Plan</p>
                    </div>
                  ) : plan.isMasterclass ? (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="relative">
                        <ProgressRing percent={usagePercent} color={usagePercent >= 90 ? "text-rose-500" : usagePercent >= 80 ? "text-amber-500" : "text-amber-400"} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold">{Math.max(0, (userProfile?.generations_limit || 0) - (userProfile?.generations_used || 0))}</span>
                          <span className="text-[9px] text-muted-foreground">remaining</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium mt-2">Masterclass 5-Pack</p>
                      {usagePercent >= 100 ? (
                        <Button size="sm" className="mt-3 h-7 text-[10px] bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 rounded-full" onClick={() => setShowPaywall(true)}>
                          Go Unlimited<ChevronRight className="size-3 ml-0.5" />
                        </Button>
                      ) : usagePercent >= 80 ? (
                        <p className="text-[10px] text-amber-400 mt-1">Running low — upgrade anytime</p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="relative">
                        <ProgressRing percent={usagePercent} color={usagePercent >= 90 ? "text-rose-500" : usagePercent >= 70 ? "text-amber-500" : "text-violet-500"} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold">{userProfile?.generations_used || 0}</span>
                          <span className="text-[9px] text-muted-foreground">/ {userProfile?.generations_limit || 0}</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium mt-2">{Math.round(usagePercent)}% used</p>
                      {plan.isFree && (
                        <Button size="sm" className="mt-3 h-7 text-[10px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 rounded-full" onClick={() => setShowPaywall(true)}>
                          Upgrade<ChevronRight className="size-3 ml-0.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── DIFFICULTY BREAKDOWN ─────────────────────── */}
            {!loading && readyGenerations.length > 0 && (
              <motion.div variants={fadeUp}>
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="size-4 text-violet-500" />
                      Difficulty Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-3 rounded-full overflow-hidden bg-muted/20 mb-3">
                      {readyGenerations.length > 0 && (
                        <>
                          {difficultyBreakdown.beginner > 0 && <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${(difficultyBreakdown.beginner / readyGenerations.length) * 100}%` }} />}
                          {difficultyBreakdown.intermediate > 0 && <div className="bg-amber-500 transition-all duration-700" style={{ width: `${(difficultyBreakdown.intermediate / readyGenerations.length) * 100}%` }} />}
                          {difficultyBreakdown.advanced > 0 && <div className="bg-rose-500 transition-all duration-700" style={{ width: `${(difficultyBreakdown.advanced / readyGenerations.length) * 100}%` }} />}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs">
                      {[
                        { label: "Beginner", count: difficultyBreakdown.beginner, color: "bg-emerald-500", text: "text-emerald-400" },
                        { label: "Intermediate", count: difficultyBreakdown.intermediate, color: "bg-amber-500", text: "text-amber-400" },
                        { label: "Advanced", count: difficultyBreakdown.advanced, color: "bg-rose-500", text: "text-rose-400" },
                      ].map(({ label, count, color, text }) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <div className={`size-2 rounded-full ${color}`} />
                          <span className={text}>{count}</span>
                          <span className="text-muted-foreground">{label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── SMART SUGGESTIONS ──────────────────────── */}
            {!loading && (
              <motion.div variants={fadeUp}>
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 size-32 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-full blur-2xl" />
                  <CardHeader className="pb-3 relative">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="flex items-center justify-center size-5 rounded-md bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
                        <Lightbulb className="size-3 text-violet-400" />
                      </div>
                      Suggested For You
                      <span className="text-[10px] text-muted-foreground font-normal ml-auto flex items-center gap-1">
                        <Brain className="size-3" /> AI-powered
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setTemplateConfig({ topic: s.title });
                            setActiveTab("generate");
                          }}
                          className="group flex items-center gap-3 rounded-xl border border-border/30 bg-muted/5 p-3 hover:bg-violet-500/5 hover:border-violet-500/20 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-200 text-left"
                        >
                          <div className="flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 group-hover:from-violet-500/20 group-hover:to-indigo-500/20 transition-colors shrink-0">
                            <Sparkles className="size-4 text-violet-400 group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground/90 group-hover:text-violet-400 transition-colors truncate">{s.title}</p>
                            <p className="text-[10px] text-muted-foreground">{s.reason}</p>
                          </div>
                          <ChevronRight className="size-3.5 text-muted-foreground/60 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── GENERATION TIMELINE ────────────────────── */}
            {!loading && readyGenerations.length > 0 && (
              <motion.div variants={fadeUp}>
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History className="size-4 text-violet-500" />
                      Generation Timeline
                      <span className="text-[10px] text-muted-foreground font-normal ml-auto">Your journey</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/30 via-violet-500/10 to-transparent" />

                      <div className="space-y-1">
                        {(showAllTimeline ? timelineGroups : timelineGroups.slice(0, 3)).map((group, gi) => (
                          <div key={group.date}>
                            {/* Date label */}
                            <div className="flex items-center gap-3 mb-2 mt-3 first:mt-0">
                              <div className="size-[23px] rounded-full bg-violet-500/15 border-2 border-background flex items-center justify-center z-10 shrink-0">
                                <Calendar className="size-2.5 text-violet-400" />
                              </div>
                              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</span>
                            </div>

                            {/* Items */}
                            {group.items.map((gen, idx) => {
                              const c = gen.curriculum;
                              if (!c) return null;
                              const lessonsCount = c.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0;
                              const gIdx = getCardGradientIdx(gen);

                              return (
                                <div key={gen.id} className="flex items-start gap-3 ml-[3px] mb-2 last:mb-0">
                                  {/* Dot */}
                                  <div className="mt-2 size-[17px] rounded-full border-2 border-background bg-muted/50 flex items-center justify-center z-10 shrink-0">
                                    <div className={`size-[5px] rounded-full bg-gradient-to-r ${difficultyGradients[c.difficulty] || difficultyGradients.beginner}`} />
                                  </div>

                                  {/* Timeline card */}
                                  <div
                                    className="flex-1 group rounded-lg border border-border/30 bg-muted/5 p-3 hover:bg-violet-500/5 hover:border-violet-500/15 transition-all duration-200 cursor-pointer"
                                    onClick={() => setExpandedId(expandedId === gen.id ? null : gen.id)}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium line-clamp-1 group-hover:text-violet-400 transition-colors">{c.title}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          <Badge variant="outline" className={`text-[9px] h-4 ${difficultyColors[c.difficulty] || ""}`}>
                                            {c.difficulty}
                                          </Badge>
                                          <span className="text-[10px] text-muted-foreground">{c.modules?.length || 0} mod · {lessonsCount} les · {c.pacing?.totalHours || 0}h</span>
                                        </div>
                                      </div>
                                      <span className="text-[9px] text-muted-foreground shrink-0 mt-0.5">
                                        {new Date(gen.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                      </span>
                                    </div>

                                    {/* Inline actions on hover */}
                                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1 hover:bg-violet-500/10 hover:text-violet-400" onClick={(e) => { e.stopPropagation(); handleDownloadPDF(c, gen.teaching_style); }}>
                                        <Download className="size-2.5" />PDF
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1 hover:bg-cyan-500/10 hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); handleShareCourse(gen); }}>
                                        {copiedId === gen.id ? <Check className="size-2.5 text-emerald-400" /> : <Share2 className="size-2.5" />}
                                        Share
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] gap-1 hover:bg-amber-500/10 hover:text-amber-400"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          sessionStorage.setItem("syllabi_preview", JSON.stringify(c));
                                          window.open("/share", "_blank");
                                        }}
                                      >
                                        <Eye className="size-2.5" />View
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      {/* Show more / less */}
                      {timelineGroups.length > 3 && (
                        <div className="mt-4 pt-3 border-t border-border/20 flex justify-center">
                          <button
                            onClick={() => setShowAllTimeline(!showAllTimeline)}
                            className="text-xs text-violet-500 hover:text-violet-400 transition-colors flex items-center gap-1"
                          >
                            {showAllTimeline ? "Show less" : `Show all ${timelineGroups.length} days`}
                            <ChevronDown className={`size-3 transition-transform ${showAllTimeline ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── MASTERCLASS LOCKED FEATURES ──────────────────── */}
            {userProfile && !plan.isMasterclass && (
              <motion.div variants={fadeUp}>
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Crown className="size-4 text-amber-500" />
                      Masterclass Features
                      <Badge className="ml-auto text-[9px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30">Upgrade</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        { icon: Headphones, label: "NotebookLM podcast export", desc: "One-click Markdown export → Google NotebookLM two-host podcast", locked: !plan.isMasterclass },
                        { icon: Brain, label: "Opus strategic polish", desc: "Key lessons rewritten by Opus for pedagogical clarity", locked: !plan.isMasterclass },
                        { icon: BarChart3, label: "20 full Masterclass courses/month", desc: "Full-body generation with modules, lessons, and resources", locked: !plan.isMasterclass },
                        { icon: Shield, label: "White-label exports", desc: "Remove Syllabi branding from all exports", locked: !plan.isMasterclass },
                        { icon: Zap, label: "Priority queue", desc: "Faster generation during peak hours", locked: !plan.isMasterclass },
                        { icon: Layers, label: "Masterclass-length courses", desc: "Generate our longest course format (12+ hours)", locked: !plan.isMasterclass },
                      ].map((feat) => (
                        <div
                          key={feat.label}
                          className={`relative flex items-start gap-3 rounded-xl border p-3 transition-all ${
                            feat.locked
                              ? "border-border/20 bg-muted/5 opacity-60"
                              : "border-amber-500/30 bg-amber-500/5"
                          }`}
                        >
                          {feat.locked && (
                            <div className="absolute top-2 right-2">
                              <Shield className="size-3 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className={`flex items-center justify-center size-8 rounded-lg shrink-0 ${
                            feat.locked
                              ? "bg-muted/20"
                              : "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
                          }`}>
                            <feat.icon className={`size-4 ${feat.locked ? "text-muted-foreground/50" : "text-amber-400"}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-medium ${feat.locked ? "text-muted-foreground" : "text-foreground"}`}>{feat.label}</p>
                            <p className="text-[10px] text-muted-foreground/70 line-clamp-1">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {plan.isFree && (
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15 p-3">
                        <div>
                          <p className="text-xs font-semibold text-amber-400">Unlock all features</p>
                          <p className="text-[10px] text-muted-foreground">Upgrade to Planner first, then unlock Masterclass</p>
                        </div>
                        <Button size="sm" className="h-7 text-[10px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 rounded-full" onClick={() => setShowPaywall(true)}>
                          Upgrade<ChevronRight className="size-3 ml-0.5" />
                        </Button>
                      </div>
                    )}
                    {plan.isPlanner && (
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15 p-3">
                        <div>
                          <p className="text-xs font-semibold text-amber-400">Unlock the full toolkit</p>
                          <p className="text-[10px] text-muted-foreground">Upgrade to Masterclass for NotebookLM podcast export, white-label exports & more</p>
                        </div>
                        <Button size="sm" className="h-7 text-[10px] bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 rounded-full shrink-0" onClick={() => setShowPaywall(true)}>
                          Go Masterclass<ChevronRight className="size-3 ml-0.5" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── RECENT COURSES ──────────────────────────── */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="size-4 text-violet-500" />
                  Recent Courses
                </h2>
                {readyGenerations.length > 4 && (
                  <button onClick={() => setActiveTab("courses")} className="text-xs text-violet-500 hover:text-violet-400 transition-colors flex items-center gap-1">
                    View all {readyGenerations.length}<ChevronRight className="size-3" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse border-border/30">
                      <CardHeader className="pb-3"><div className="h-5 bg-muted/30 rounded w-3/4 mb-2" /><div className="h-3 bg-muted/20 rounded w-1/2" /></CardHeader>
                      <CardContent><div className="h-3 bg-muted/20 rounded w-full mb-2" /><div className="h-3 bg-muted/20 rounded w-2/3" /></CardContent>
                    </Card>
                  ))}
                </div>
              ) : readyGenerations.length === 0 && generatingCourses.length === 0 && failedGenerations.length === 0 ? (
                <Card className="text-center py-12 border-dashed border-border/40">
                  <CardContent>
                    <div className="relative mx-auto mb-5 w-fit">
                      <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full scale-150" />
                      <Sparkles className="relative size-10 text-violet-500" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">No courses yet</h3>
                    <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                      Generate your first AI-powered course and it will appear here.
                    </p>
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 rounded-full px-6" onClick={() => (setActiveTab("generate"))}>
                      <Sparkles className="size-4 mr-2" />Generate Your First Course
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Generating courses — progress cards */}
                  {generatingCourses.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 mb-4">
                      {generatingCourses.map((gen) => {
                        const totalMods = gen.generation_total_modules || 0;
                        const completedMods = gen.generation_completed_modules || 0;
                        const hasProgress = totalMods > 0;
                        const progressPercent = hasProgress
                          ? Math.round(10 + (completedMods / totalMods) * 90)
                          : 5;
                        const progressMessage = gen.generation_progress || "AI is crafting your course";

                        return (
                          <Card key={gen.id} className="relative border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-indigo-500/3 to-violet-500/5 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 animate-pulse" />
                            <div className="h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 animate-pulse" />
                            <CardHeader className="relative pb-2 pt-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm leading-snug text-violet-400">{gen.topic}</h3>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{progressMessage}</p>
                                </div>
                                <Badge variant="outline" className="text-[10px] shrink-0 bg-violet-500/10 text-violet-400 border-violet-500/20 animate-pulse">
                                  <Sparkles className="size-2.5 mr-1" />
                                  {hasProgress ? `${completedMods}/${totalMods}` : "Generating"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="relative pt-0">
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <div className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                                  <span>{hasProgress ? `Module ${Math.min(completedMods + 1, totalMods)} of ${totalMods}` : "Designing course structure"}</span>
                                </div>
                              </div>
                              {hasProgress && (
                                <div className="mt-3">
                                  <div className="h-2 bg-muted/20 rounded-full w-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                  {failedGenerations.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 mb-4">
                      {failedGenerations.map((gen) => (
                        <FailedCourseCard
                          key={gen.id}
                          gen={gen}
                          onRetry={() => handleRetryFailed(gen)}
                          onDismiss={() => handleDismissFailed(gen.id)}
                        />
                      ))}
                    </div>
                  )}
                  {readyGenerations.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {readyGenerations.slice(0, 4).map((gen, i) => (
                        <CourseCard key={gen.id} gen={gen} index={i} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: MY COURSES
        ══════════════════════════════════════════════════ */}
        {activeTab === "courses" && (
          <div>
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input placeholder="Search by title, topic, or difficulty..." className="pl-9 text-sm h-9 bg-card/50 border-border/40" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse border-border/30">
                    <CardHeader className="pb-3"><div className="h-5 bg-muted/30 rounded w-3/4 mb-2" /><div className="h-3 bg-muted/20 rounded w-1/2" /></CardHeader>
                    <CardContent><div className="h-3 bg-muted/20 rounded w-full mb-2" /><div className="h-3 bg-muted/20 rounded w-2/3" /></CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredGenerations.length === 0 && generatingCourses.length === 0 && failedGenerations.length === 0 ? (
              <Card className="text-center py-16 border-dashed border-border/40">
                <CardContent>
                  {searchQuery ? (
                    <>
                      <Search className="size-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-base font-semibold mb-2">No matches found</h3>
                      <p className="text-sm text-muted-foreground">Try a different search term.</p>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-10 text-violet-500/40 mx-auto mb-4" />
                      <h3 className="text-base font-semibold mb-2">No courses yet</h3>
                      <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                        {plan.isMasterclass
                          ? "Your Masterclass toolkit is ready — PDF, Word, Notion, SCORM, NLM Audio & Slides. Generate your first course to unlock all eight formats."
                          : plan.isPlanner
                          ? "Your Planner toolkit is ready — PDF, Word, Notion and shareable links. Generate your first course to get started."
                          : "Generate your first AI-powered course and it will appear here — PDF & Markdown included on the free plan."}
                      </p>
                      <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0" onClick={() => (setActiveTab("generate"))}>Generate Your First Course</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : editingGenId ? (
              /* ── Course Editor View ── */
              (() => {
                const editingGen = generations.find((g) => g.id === editingGenId);
                if (!editingGen?.curriculum) { setEditingGenId(null); return null; }
                return (
                  <CourseEditor
                    curriculum={editingGen.curriculum}
                    onSave={(updated) => handleSaveEditedCourse(editingGenId, updated)}
                    onClose={() => setEditingGenId(null)}
                  />
                );
              })()
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-4">
                  {filteredGenerations.length} course{filteredGenerations.length !== 1 ? "s" : ""}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                {/* Generating courses — shown with progress tracking */}
                {generatingCourses.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    {generatingCourses.map((gen) => {
                      // Calculate progress percentage from chunked generation data
                      const totalMods = gen.generation_total_modules || 0;
                      const completedMods = gen.generation_completed_modules || 0;
                      const hasProgress = totalMods > 0;
                      // Skeleton phase = 10%, then modules fill the remaining 90%
                      const progressPercent = hasProgress
                        ? Math.round(10 + (completedMods / totalMods) * 90)
                        : 5; // indeterminate — just show a sliver
                      const progressMessage = gen.generation_progress || "AI is crafting your course";

                      return (
                        <Card key={gen.id} className="relative border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-indigo-500/3 to-violet-500/5 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 animate-pulse" />
                          <div className="h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 animate-pulse" />
                          <CardHeader className="relative pb-2 pt-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm leading-snug text-violet-400">{gen.topic}</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{progressMessage}</p>
                              </div>
                              <Badge variant="outline" className="text-[10px] shrink-0 bg-violet-500/10 text-violet-400 border-violet-500/20 animate-pulse">
                                <Sparkles className="size-2.5 mr-1" />
                                {hasProgress ? `${completedMods}/${totalMods}` : "Generating"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="relative pt-0">
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <div className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                                <span>{hasProgress ? `Module ${completedMods + 1 > totalMods ? totalMods : completedMods + 1} of ${totalMods}` : "Designing course structure"}</span>
                              </div>
                            </div>
                            <div className="mt-3 space-y-2">
                              <div className="h-2 bg-muted/20 rounded-full w-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              {hasProgress && (
                                <p className="text-[10px] text-muted-foreground/60 text-right">{progressPercent}%</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
                {failedGenerations.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    {failedGenerations.map((gen) => (
                      <FailedCourseCard
                        key={gen.id}
                        gen={gen}
                        onRetry={() => handleRetryFailed(gen)}
                        onDismiss={() => handleDismissFailed(gen.id)}
                      />
                    ))}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredGenerations.map((gen, i) => (
                    <CourseCard key={gen.id} gen={gen} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: GENERATE COURSE
        ══════════════════════════════════════════════════ */}
        {activeTab === "generate" && (
          <div className="space-y-6">
            {isGenerating ? (
              <CourseAssemblyLoader
                topic={genProgress?.topic}
                progressMessage={genProgress?.progress}
                completedModules={genProgress?.completedModules}
                totalModules={genProgress?.totalModules}
              />
            ) : (
              <>
                {/* Quick Start Templates */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="size-4 text-violet-500" />
                    Quick Start Templates
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {COURSE_TEMPLATES.map((template) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.title}
                          onClick={() => handleSelectTemplate(template.config)}
                          className="group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/50 to-card/30 p-4 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
                        >
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="absolute -top-8 -right-8 size-32 bg-violet-500/5 rounded-full blur-2xl" />
                          </div>
                          <div className="relative flex items-start justify-between gap-2 mb-2">
                            <Icon className="size-5 text-violet-500 shrink-0 mt-0.5" />
                            <span className="text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Use template</span>
                          </div>
                          <h4 className="font-semibold text-sm text-left group-hover:text-violet-400 transition-colors">{template.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 text-left">{template.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Curriculum Form */}
                <div className="bg-card/40 border border-border/30 rounded-lg p-6">
                  <CurriculumForm
                    onGenerated={handleFormGenerated}
                    onLoadingChange={handleFormLoadingChange}
                    onProgressUpdate={handleFormProgressUpdate}
                    isFreeUser={plan.isFree}
                    initialValues={templateConfig || duplicateConfig || undefined}
                  />
                </div>
              </>
            )}
          </div>
        )}



        {/* ══════════════════════════════════════════════════
            TAB: ACCOUNT SETTINGS
        ══════════════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="space-y-5 max-w-2xl">
            {/* Profile info */}
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><UserIcon className="size-4 text-violet-500" />Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={name}
                      width={48}
                      height={48}
                      unoptimized
                      className="size-12 rounded-xl ring-2 ring-violet-500/20 object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center size-12 rounded-xl bg-violet-500/15 text-violet-500"><UserIcon className="size-6" /></div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Separator className="border-border/30" />
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Authentication</span>
                    <div className="flex items-center gap-1.5 text-xs"><div className="size-1.5 rounded-full bg-emerald-400" />Connected via Google</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Member since</span>
                    <span className="text-xs">{user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/60 bg-muted/30 rounded-lg px-3 py-2">
                  Profile information is managed through your Google account.
                </p>
              </CardContent>
            </Card>

            {/* Plan & usage */}
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Zap className="size-4 text-violet-500" />Plan &amp; Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{planLabel} Plan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plan.isFree ? "1 course skeleton/month included" : plan.isPlanner ? "15 skeletons/month" : userProfile && userProfile.generations_limit > 0 && userProfile.generations_limit < 1000 ? `${userProfile.generations_limit} Masterclass generations` : "Unlimited generations"}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${planBadgeClass}`}>{planLabel}</Badge>
                </div>

                {userProfile && (!plan.isMasterclass || (userProfile.generations_limit > 0 && userProfile.generations_limit < 1000)) && (
                  <>
                    <Separator className="border-border/30" />
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{userProfile.generations_used} / {userProfile.generations_limit} generations used</span>
                        <span>{Math.round(usagePercent)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${usagePercent >= 90 ? "bg-rose-500" : usagePercent >= 70 ? "bg-amber-500" : "bg-violet-500"}`} style={{ width: `${usagePercent}%` }} />
                      </div>
                    </div>
                  </>
                )}

                {plan.isFree && (
                  <>
                    <Separator className="border-border/30" />
                    <div className="rounded-xl bg-violet-500/5 border border-violet-500/15 p-4">
                      <p className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Crown className="size-3.5 text-violet-500" />Upgrade to Planner</p>
                      <ul className="space-y-1 mb-3">
                        {["50 generations per month", "Standard & Bootcamp course lengths", "Advanced difficulty tier", "Priority support"].map((f) => (
                          <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5"><div className="size-1 rounded-full bg-violet-500 shrink-0" />{f}</li>
                        ))}
                      </ul>
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 h-8 text-xs" onClick={() => setShowPaywall(true)}>
                        View Pricing Plans<ExternalLink className="size-3 ml-1.5" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="size-4 text-violet-500" />Notifications
                  <Badge variant="secondary" className="text-[10px] ml-auto">Coming soon</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 opacity-50 pointer-events-none">
                  {[
                    { label: "Product updates", desc: "New features and improvements" },
                    { label: "Usage alerts", desc: "When you're close to your limit" },
                    { label: "Weekly summary", desc: "Your course activity digest" },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div><p className="text-xs font-medium">{label}</p><p className="text-[11px] text-muted-foreground">{desc}</p></div>
                      <div className="size-9 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground">—</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border-rose-500/20 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-rose-400 flex items-center gap-2"><Shield className="size-4" />Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="text-xs gap-2 border-border/50"
                  onClick={async () => { await supabaseBrowser.auth.signOut(); window.location.href = "/"; }}
                >
                  <LogOut className="size-3.5" />Sign out
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  To request account deletion, please contact{" "}
                  <a href="mailto:support@syllabi.online" className="underline hover:text-muted-foreground transition-colors">support@syllabi.online</a>.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Paywall Modal for Upgrade buttons */}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} currentPlan={plan.tier} />

      {/* Welcome Animation — plays on login */}
      <WelcomeAnimation
        show={showWelcome}
        userName={user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""}
        onComplete={handleWelcomeComplete}
      />

      {/* Onboarding Quiz — shown for new users after welcome animation */}
      <OnboardingQuiz
        open={showOnboarding && !showWelcome}
        onComplete={handleOnboardingComplete}
      />

      {/* Slide style selector for NotebookLM / Marp / Slidev export */}
      <SlideStyleModal
        open={slideExport !== null}
        defaultStyle={slideExport?.defaultStyle}
        onClose={() => setSlideExport(null)}
        onSelect={(style) => {
          if (slideExport) runSlideExport(slideExport.curriculum, style);
          setSlideExport(null);
        }}
      />
    </div>
  );
}
