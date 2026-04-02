"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Curriculum } from "@/types/curriculum";
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
  Flame,
  ArrowUpRight,
  BarChart3,
  Award,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { generateCurriculumPDF } from "@/lib/pdf/generatePDF";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────

interface Generation {
  id: string;
  topic: string;
  audience: string;
  length: string;
  niche: string | null;
  curriculum: Curriculum;
  created_at: string;
}

interface UserProfile {
  plan: string;
  generations_used: number;
  generations_limit: number;
}

type TabId = "overview" | "courses" | "settings";

// ─── Constants ────────────────────────────────────────────────

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "settings", label: "Account", icon: Settings },
];

// ─── Animation variants ──────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
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

  // Go back 84 days (12 weeks)
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

  const dates = new Set(
    generations.map((g) => new Date(g.created_at).toISOString().slice(0, 10))
  );

  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);

  // Check today first
  const todayStr = checkDate.toISOString().slice(0, 10);
  if (!dates.has(todayStr)) {
    // Check if yesterday had activity (streak still alive)
    checkDate.setDate(checkDate.getDate() - 1);
    if (!dates.has(checkDate.toISOString().slice(0, 10))) return 0;
  }

  // Count consecutive days
  checkDate = new Date(today);
  if (!dates.has(todayStr)) checkDate.setDate(checkDate.getDate() - 1);

  while (dates.has(checkDate.toISOString().slice(0, 10))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
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
  percent,
  size = 80,
  stroke = 6,
  color = "text-violet-500",
}: {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`${color} transition-all duration-1000 ease-out`}
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dark, setDark] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();
      setUser(user);

      if (user) {
        const [{ data: courses }, { data: profileData }] = await Promise.all([
          supabaseBrowser
            .from("courses")
            .select("id, topic, audience, length, niche, curriculum, created_at")
            .order("created_at", { ascending: false }),
          supabaseBrowser
            .from("profiles")
            .select("plan, generations_used, generations_limit")
            .eq("id", user.id)
            .single(),
        ]);

        if (courses) setGenerations(courses as unknown as Generation[]);
        setUserProfile(
          (profileData as UserProfile | null) ?? {
            plan: "free",
            generations_used: 0,
            generations_limit: 1,
          }
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  // ── Derived stats ──────────────────────────────────────────

  const filteredGenerations = useMemo(() => {
    if (!searchQuery.trim()) return generations;
    const q = searchQuery.toLowerCase();
    return generations.filter(
      (g) =>
        g.curriculum?.title?.toLowerCase().includes(q) ||
        g.topic?.toLowerCase().includes(q) ||
        g.curriculum?.difficulty?.toLowerCase().includes(q)
    );
  }, [generations, searchQuery]);

  const totalHours = useMemo(
    () =>
      generations.reduce(
        (sum, g) => sum + (g.curriculum?.pacing?.totalHours || 0),
        0
      ),
    [generations]
  );

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return generations.filter((g) => {
      const d = new Date(g.created_at);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [generations]);

  const totalLessonsAll = useMemo(
    () =>
      generations.reduce(
        (sum, g) =>
          sum +
          (g.curriculum?.modules?.reduce(
            (a, m) => a + (m.lessons?.length || 0),
            0
          ) || 0),
        0
      ),
    [generations]
  );

  const totalQuizzes = useMemo(
    () =>
      generations.reduce(
        (sum, g) =>
          sum +
          (g.curriculum?.modules?.reduce(
            (a, m) => a + (m.quiz?.length || 0),
            0
          ) || 0),
        0
      ),
    [generations]
  );

  const difficultyBreakdown = useMemo(() => {
    const counts = { beginner: 0, intermediate: 0, advanced: 0 };
    generations.forEach((g) => {
      const d = g.curriculum?.difficulty?.toLowerCase() || "beginner";
      if (d in counts) counts[d as keyof typeof counts]++;
    });
    return counts;
  }, [generations]);

  const heatmapData = useMemo(() => buildHeatmap(generations), [generations]);
  const streak = useMemo(() => getStreak(generations), [generations]);

  // ── Handlers ───────────────────────────────────────────────

  const handleDownloadPDF = useCallback((curriculum: Curriculum) => {
    try {
      const pdf = generateCurriculumPDF(curriculum);
      pdf.save(
        `${curriculum.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_syllabus.pdf`
      );
    } catch (e) {
      console.error("Failed to generate PDF:", e);
    }
  }, []);

  const handleExportNotion = useCallback((curriculum: Curriculum) => {
    const lines: string[] = [];
    lines.push(`# ${curriculum.title}`);
    lines.push("");
    lines.push(`> ${curriculum.subtitle}`);
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## Course Overview");
    lines.push("");
    lines.push("| Detail | Info |");
    lines.push("|---|---|");
    lines.push(`| **Difficulty** | ${curriculum.difficulty} |`);
    lines.push(`| **Target Audience** | ${curriculum.targetAudience} |`);
    lines.push(`| **Modules** | ${curriculum.modules.length} |`);
    const totalLessons = curriculum.modules.reduce(
      (a, m) => a + (m.lessons?.length || 0),
      0
    );
    lines.push(`| **Lessons** | ${totalLessons} |`);
    lines.push(
      `| **Duration** | ${curriculum.pacing?.totalHours || "N/A"} hours |`
    );
    lines.push("");
    lines.push(`${curriculum.description}`);
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## Learning Objectives");
    lines.push("");
    curriculum.objectives.forEach((obj) => lines.push(`- [ ] ${obj}`));
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## Course Content");
    lines.push("");
    curriculum.modules.forEach((mod) => {
      lines.push(`### Module ${(mod.order ?? 0) + 1}: ${mod.title}`);
      lines.push("");
      lines.push(`> ${mod.description}`);
      lines.push("");
      mod.lessons?.forEach((l, idx) => {
        lines.push(
          `#### ${idx + 1}. ${l.title} *(${l.durationMinutes} min)*`
        );
        if (l.keyPoints?.length) {
          l.keyPoints.forEach((kp) => lines.push(`- ${kp}`));
        }
        lines.push("");
      });
      if (mod.quiz?.length) {
        lines.push(`#### Quiz`);
        mod.quiz.forEach((q, i) => {
          lines.push(`**Q${i + 1}:** ${q.question}`);
          q.options?.forEach((opt) => lines.push(`- ${opt}`));
          lines.push("");
        });
      }
      lines.push("---");
      lines.push("");
    });
    lines.push(`> *Generated by [Syllabi.ai](https://syllabi.ai)*`);

    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${curriculum.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_notion.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleShareCourse = useCallback(
    (gen: Generation) => {
      const encoded = btoa(
        encodeURIComponent(JSON.stringify(gen.curriculum))
      );
      const url = `${window.location.origin}/share?data=${encoded}`;
      navigator.clipboard.writeText(url);
      setCopiedId(gen.id);
      setTimeout(() => setCopiedId(null), 2000);
    },
    []
  );

  // ── Sign-in gate ───────────────────────────────────────────

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-center size-16 rounded-2xl bg-violet-500/10 mx-auto mb-5">
              <UserIcon className="size-8 text-violet-500" />
            </div>
            <h1 className="text-xl font-bold mb-2">
              Sign in to view your dashboard
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in with Google to see your generated courses, track your
              usage, and manage your account.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                Back to Home
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
                onClick={async () => {
                  await supabaseBrowser.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
                    },
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
  const name =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const firstName = name.split(" ")[0];

  const planLabel =
    userProfile?.plan === "pro_max"
      ? "Pro Max"
      : userProfile?.plan === "pro"
      ? "Pro"
      : "Free";

  const planBadgeClass =
    userProfile?.plan === "pro_max"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : userProfile?.plan === "pro"
      ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
      : "border-border/60 text-muted-foreground";

  const usagePercent = userProfile
    ? Math.min(
        100,
        (userProfile.generations_used / Math.max(userProfile.generations_limit, 1)) * 100
      )
    : 0;

  // ── Course card renderer ──────────────────────────────────

  function CourseCard({ gen, index }: { gen: Generation; index: number }) {
    const c = gen.curriculum;
    const totalLessons =
      c.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0;
    const isExpanded = expandedId === gen.id;

    // Generate a gradient based on the course topic hash
    const gradients = [
      "from-violet-500/10 to-indigo-500/10",
      "from-cyan-500/10 to-blue-500/10",
      "from-rose-500/10 to-pink-500/10",
      "from-amber-500/10 to-orange-500/10",
      "from-emerald-500/10 to-teal-500/10",
      "from-fuchsia-500/10 to-purple-500/10",
    ];
    const accentColors = [
      "border-violet-500/30",
      "border-cyan-500/30",
      "border-rose-500/30",
      "border-amber-500/30",
      "border-emerald-500/30",
      "border-fuchsia-500/30",
    ];
    const gIdx = Math.abs((gen.topic || "").length + (gen.id || "").charCodeAt(0)) % gradients.length;

    return (
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ delay: index * 0.05 }}
      >
        <Card
          className={`group border-border/50 bg-gradient-to-br ${gradients[gIdx]} backdrop-blur-sm hover:${accentColors[gIdx]} hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer overflow-hidden`}
          onClick={() => setExpandedId(isExpanded ? null : gen.id)}
        >
          {/* Top accent line */}
          <div className={`h-0.5 bg-gradient-to-r ${
            c.difficulty === "advanced"
              ? "from-rose-500 to-pink-500"
              : c.difficulty === "intermediate"
              ? "from-amber-500 to-orange-500"
              : "from-emerald-500 to-teal-500"
          }`} />

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-snug truncate group-hover:text-violet-400 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {c.subtitle}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] shrink-0 ${difficultyColors[c.difficulty] || ""}`}
              >
                {c.difficulty}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="size-3" />
                {c.modules?.length || 0} modules
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="size-3" />
                {totalLessons} lessons
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {c.pacing?.totalHours || 0}h
              </div>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {c.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground/60">
                {new Date(gen.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] hover:bg-violet-500/10 hover:text-violet-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPDF(c);
                  }}
                >
                  <Download className="size-3 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] hover:bg-purple-500/10 hover:text-purple-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportNotion(c);
                  }}
                >
                  <FileText className="size-3 mr-1" />
                  MD
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] hover:bg-cyan-500/10 hover:text-cyan-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareCourse(gen);
                  }}
                >
                  {copiedId === gen.id ? (
                    <Check className="size-3 text-emerald-400" />
                  ) : (
                    <Share2 className="size-3" />
                  )}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Learning Objectives
                      </p>
                      <ul className="space-y-1">
                        {c.objectives?.slice(0, 5).map((obj, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground flex items-start gap-1.5"
                          >
                            <span className="text-violet-500 mt-0.5 shrink-0">
                              •
                            </span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Modules
                      </p>
                      <ul className="space-y-1">
                        {c.modules?.map((mod, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground"
                          >
                            <span className="text-foreground font-medium">
                              {i + 1}.
                            </span>{" "}
                            {mod.title}
                            <span className="text-muted-foreground/50 ml-1">
                              ({mod.lessons?.length || 0} lessons)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {c.tags && c.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {c.tags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <GraduationCap className="size-5 text-violet-500" />
            <span>
              syllabi<span className="text-violet-500">.ai</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-violet-500/30 text-violet-500 hover:bg-violet-500/10 hidden sm:flex"
              onClick={() => (window.location.href = "/")}
            >
              <Sparkles className="size-3" />
              New Course
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 sm:px-6">
        {/* ── Welcome Banner ─────────────────────────────── */}
        {!loading && user && activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-cyan-500/10 p-5 sm:p-6">
              {/* Decorative blobs */}
              <div className="absolute -top-12 -right-12 size-40 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="relative flex items-center gap-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="size-14 sm:size-16 rounded-2xl ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/20 shrink-0"
                  />
                ) : (
                  <div className="flex items-center justify-center size-14 sm:size-16 rounded-2xl bg-violet-500/15 text-violet-500 ring-2 ring-violet-500/30 shrink-0">
                    <UserIcon className="size-7 sm:size-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-violet-400 font-medium mb-0.5">
                    {getGreeting()},
                  </p>
                  <h1 className="text-xl sm:text-2xl font-bold truncate">
                    {firstName}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs flex items-center gap-1 ${planBadgeClass}`}
                    >
                      {planLabel === "Pro Max" && <Crown className="size-3" />}
                      {planLabel === "Pro" && <Zap className="size-3" />}
                      {planLabel} Plan
                    </Badge>
                    {streak > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 border-amber-500/30 text-amber-400 bg-amber-500/10"
                      >
                        <Flame className="size-3" />
                        {streak} day streak
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick CTA for mobile */}
                <Button
                  size="sm"
                  className="sm:hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shrink-0"
                  onClick={() => (window.location.href = "/")}
                >
                  <Sparkles className="size-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Profile Header (non-overview tabs) ─────────── */}
        {activeTab !== "overview" && (
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="size-12 sm:size-16 rounded-2xl ring-2 ring-violet-500/30 shadow-lg shrink-0"
              />
            ) : (
              <div className="flex items-center justify-center size-12 sm:size-16 rounded-2xl bg-violet-500/15 text-violet-500 ring-2 ring-violet-500/30 shrink-0">
                <UserIcon className="size-6 sm:size-8" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{name}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-xs flex items-center gap-1 ${planBadgeClass}`}
                >
                  {planLabel === "Pro Max" && <Crown className="size-3" />}
                  {planLabel === "Pro" && <Zap className="size-3" />}
                  {planLabel} Plan
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Navigation ──────────────────────────────── */}
        <div className="flex gap-0 mb-6 sm:mb-8 border-b border-border/40 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-violet-500 border-violet-500"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════
            TAB: OVERVIEW
        ════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {/* ── Stat Cards ───────────────────────────────── */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Courses",
                  value: loading ? "—" : generations.length,
                  subtext: `${thisMonthCount} this month`,
                  icon: BookOpen,
                  gradient: "from-violet-500/15 to-indigo-500/15",
                  iconBg: "bg-violet-500/15",
                  iconColor: "text-violet-400",
                  border: "border-violet-500/20",
                },
                {
                  label: "Learning Hours",
                  value: loading ? "—" : `${totalHours}h`,
                  subtext: `${totalLessonsAll} total lessons`,
                  icon: Clock,
                  gradient: "from-cyan-500/15 to-blue-500/15",
                  iconBg: "bg-cyan-500/15",
                  iconColor: "text-cyan-400",
                  border: "border-cyan-500/20",
                },
                {
                  label: "Quiz Questions",
                  value: loading ? "—" : totalQuizzes,
                  subtext: `across ${generations.length} courses`,
                  icon: Award,
                  gradient: "from-amber-500/15 to-orange-500/15",
                  iconBg: "bg-amber-500/15",
                  iconColor: "text-amber-400",
                  border: "border-amber-500/20",
                },
                {
                  label: "Day Streak",
                  value: loading ? "—" : streak,
                  subtext: streak > 0 ? "Keep it going!" : "Start today!",
                  icon: Flame,
                  gradient: "from-rose-500/15 to-pink-500/15",
                  iconBg: "bg-rose-500/15",
                  iconColor: "text-rose-400",
                  border: "border-rose-500/20",
                },
              ].map(({ label, value, subtext, icon: Icon, gradient, iconBg, iconColor, border }) => (
                <Card
                  key={label}
                  className={`border ${border} bg-gradient-to-br ${gradient} backdrop-blur-sm hover:scale-[1.02] transition-transform duration-200`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`flex items-center justify-center size-9 rounded-xl ${iconBg}`}
                      >
                        <Icon className={`size-4 ${iconColor}`} />
                      </div>
                      <ArrowUpRight className="size-3.5 text-muted-foreground/30" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {subtext}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* ── Activity Heatmap + Usage Ring ─────────────── */}
            <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">
              {/* Activity heatmap */}
              <Card className="sm:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="size-4 text-violet-500" />
                    Activity
                    <span className="text-[10px] text-muted-foreground font-normal ml-auto">
                      Last 12 weeks
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[100px] bg-muted/20 rounded-lg animate-pulse" />
                  ) : (
                    <>
                      <div className="grid grid-cols-12 gap-[3px]">
                        {/* Group by weeks (7 days each) */}
                        {Array.from({ length: 12 }, (_, weekIdx) => (
                          <div key={weekIdx} className="flex flex-col gap-[3px]">
                            {heatmapData
                              .slice(weekIdx * 7, weekIdx * 7 + 7)
                              .map((day, dayIdx) => (
                                <div
                                  key={dayIdx}
                                  className={`aspect-square rounded-[3px] ${heatmapColors[day.level]} transition-colors hover:ring-1 hover:ring-violet-400/50`}
                                  title={`${day.date}: ${day.count} course${day.count !== 1 ? "s" : ""}`}
                                />
                              ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-[10px] text-muted-foreground/50">
                          {generations.length} courses generated total
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                          <span>Less</span>
                          {[0, 1, 2, 3, 4].map((lvl) => (
                            <div
                              key={lvl}
                              className={`size-2.5 rounded-[2px] ${heatmapColors[lvl]}`}
                            />
                          ))}
                          <span>More</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Usage ring */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="size-4 text-violet-500" />
                    Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[120px] bg-muted/20 rounded-lg animate-pulse" />
                  ) : userProfile?.plan === "pro_max" ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="relative">
                        <ProgressRing percent={100} color="text-amber-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Crown className="size-6 text-amber-400" />
                        </div>
                      </div>
                      <p className="text-xs font-semibold mt-3">Unlimited</p>
                      <p className="text-[10px] text-muted-foreground">
                        Pro Max Plan
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="relative">
                        <ProgressRing
                          percent={usagePercent}
                          color={
                            usagePercent >= 90
                              ? "text-rose-500"
                              : usagePercent >= 70
                              ? "text-amber-500"
                              : "text-violet-500"
                          }
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold">
                            {userProfile?.generations_used || 0}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            / {userProfile?.generations_limit || 0}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-medium mt-2">
                        {Math.round(usagePercent)}% used
                      </p>
                      {userProfile?.plan === "free" && (
                        <Button
                          size="sm"
                          className="mt-3 h-7 text-[10px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 rounded-full"
                          onClick={() => (window.location.href = "/")}
                        >
                          Upgrade
                          <ChevronRight className="size-3 ml-0.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Difficulty Breakdown ──────────────────────── */}
            {!loading && generations.length > 0 && (
              <motion.div variants={fadeUp}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="size-4 text-violet-500" />
                      Course Difficulty Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      {/* Bar visualization */}
                      <div className="flex-1 flex h-3 rounded-full overflow-hidden bg-muted/20">
                        {generations.length > 0 && (
                          <>
                            {difficultyBreakdown.beginner > 0 && (
                              <div
                                className="bg-emerald-500 transition-all duration-700"
                                style={{
                                  width: `${(difficultyBreakdown.beginner / generations.length) * 100}%`,
                                }}
                              />
                            )}
                            {difficultyBreakdown.intermediate > 0 && (
                              <div
                                className="bg-amber-500 transition-all duration-700"
                                style={{
                                  width: `${(difficultyBreakdown.intermediate / generations.length) * 100}%`,
                                }}
                              />
                            )}
                            {difficultyBreakdown.advanced > 0 && (
                              <div
                                className="bg-rose-500 transition-all duration-700"
                                style={{
                                  width: `${(difficultyBreakdown.advanced / generations.length) * 100}%`,
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs">
                      {[
                        {
                          label: "Beginner",
                          count: difficultyBreakdown.beginner,
                          color: "bg-emerald-500",
                          text: "text-emerald-400",
                        },
                        {
                          label: "Intermediate",
                          count: difficultyBreakdown.intermediate,
                          color: "bg-amber-500",
                          text: "text-amber-400",
                        },
                        {
                          label: "Advanced",
                          count: difficultyBreakdown.advanced,
                          color: "bg-rose-500",
                          text: "text-rose-400",
                        },
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

            {/* ── Recent Courses ────────────────────────────── */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="size-4 text-violet-500" />
                  Recent Courses
                </h2>
                {generations.length > 4 && (
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="text-xs text-violet-500 hover:text-violet-400 transition-colors flex items-center gap-1"
                  >
                    View all {generations.length}
                    <ChevronRight className="size-3" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-3">
                        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-3 bg-muted rounded w-full mb-2" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : generations.length === 0 ? (
                <Card className="text-center py-12 border-dashed border-border/60">
                  <CardContent>
                    <div className="relative mx-auto mb-5 w-fit">
                      <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                      <Sparkles className="relative size-10 text-violet-500" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">
                      No courses yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                      Generate your first AI-powered course and it will appear
                      here. Export, revisit, and download anytime.
                    </p>
                    <Button
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 rounded-full px-6"
                      onClick={() => (window.location.href = "/")}
                    >
                      <Sparkles className="size-4 mr-2" />
                      Generate Your First Course
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {generations.slice(0, 4).map((gen, i) => (
                    <CourseCard key={gen.id} gen={gen} index={i} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── Quick Actions ──────────────────────────────── */}
            {!loading && (
              <motion.div variants={fadeUp}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start h-10 sm:h-auto sm:justify-center gap-1.5 border-violet-500/20 hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/30 transition-all"
                      onClick={() => (window.location.href = "/")}
                    >
                      <Sparkles className="size-3.5 text-violet-500 shrink-0" />
                      Generate New Course
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start h-10 sm:h-auto sm:justify-center gap-1.5 border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                      onClick={() => setActiveTab("courses")}
                    >
                      <BookOpen className="size-3.5 text-cyan-500 shrink-0" />
                      Browse All Courses
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start h-10 sm:h-auto sm:justify-center gap-1.5 hover:bg-muted/50 transition-all"
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="size-3.5 text-muted-foreground shrink-0" />
                      Account Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════
            TAB: MY COURSES
        ════════════════════════════════════════════════════ */}
        {activeTab === "courses" && (
          <div>
            {/* Search bar */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by title, topic, or difficulty..."
                className="pl-9 text-sm h-9 bg-card/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-3">
                      <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredGenerations.length === 0 ? (
              <Card className="text-center py-16 border-dashed border-border/60">
                <CardContent>
                  {searchQuery ? (
                    <>
                      <Search className="size-10 text-muted-foreground/40 mx-auto mb-4" />
                      <h3 className="text-base font-semibold mb-2">
                        No matches found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Try a different search term.
                      </p>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-10 text-violet-500/40 mx-auto mb-4" />
                      <h3 className="text-base font-semibold mb-2">
                        No courses yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                        Generate your first AI-powered course and it will appear
                        here.
                      </p>
                      <Button
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
                        onClick={() => (window.location.href = "/")}
                      >
                        Generate Your First Course
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-4">
                  {filteredGenerations.length} course
                  {filteredGenerations.length !== 1 ? "s" : ""}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredGenerations.map((gen, i) => (
                    <CourseCard key={gen.id} gen={gen} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            TAB: ACCOUNT SETTINGS
        ════════════════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="space-y-5 max-w-2xl">
            {/* Profile info */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserIcon className="size-4 text-violet-500" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="size-12 rounded-xl ring-2 ring-violet-500/20"
                    />
                  ) : (
                    <div className="flex items-center justify-center size-12 rounded-xl bg-violet-500/15 text-violet-500">
                      <UserIcon className="size-6" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Separator className="border-border/30" />
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      Authentication
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="size-1.5 rounded-full bg-emerald-400" />
                      Connected via Google
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      Member since
                    </span>
                    <span className="text-xs">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            { month: "long", year: "numeric" }
                          )
                        : "—"}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/60 bg-muted/30 rounded-lg px-3 py-2">
                  Profile information is managed through your Google account.
                  Sign in to a different Google account to change it.
                </p>
              </CardContent>
            </Card>

            {/* Plan & usage */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="size-4 text-violet-500" />
                  Plan &amp; Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{planLabel} Plan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {userProfile?.plan === "free"
                        ? "1 generation included"
                        : userProfile?.plan === "pro"
                        ? "50 generations / month"
                        : "Unlimited generations"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${planBadgeClass}`}
                  >
                    {planLabel}
                  </Badge>
                </div>

                {userProfile && userProfile.plan !== "pro_max" && (
                  <>
                    <Separator className="border-border/30" />
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>
                          {userProfile.generations_used} /{" "}
                          {userProfile.generations_limit} generations used
                        </span>
                        <span>{Math.round(usagePercent)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            usagePercent >= 90
                              ? "bg-rose-500"
                              : usagePercent >= 70
                              ? "bg-amber-500"
                              : "bg-violet-500"
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {userProfile?.plan === "free" && (
                  <>
                    <Separator className="border-border/30" />
                    <div className="rounded-xl bg-violet-500/5 border border-violet-500/15 p-4">
                      <p className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                        <Crown className="size-3.5 text-violet-500" />
                        Upgrade to Pro
                      </p>
                      <ul className="space-y-1 mb-3">
                        {[
                          "50 generations per month",
                          "Standard & Bootcamp course lengths",
                          "Advanced difficulty tier",
                          "Priority support",
                        ].map((f) => (
                          <li
                            key={f}
                            className="text-xs text-muted-foreground flex items-center gap-1.5"
                          >
                            <div className="size-1 rounded-full bg-violet-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 h-8 text-xs"
                        onClick={() => (window.location.href = "/")}
                      >
                        View Pricing Plans
                        <ExternalLink className="size-3 ml-1.5" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notifications (placeholder) */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="size-4 text-violet-500" />
                  Notifications
                  <Badge variant="secondary" className="text-[10px] ml-auto">
                    Coming soon
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 opacity-50 pointer-events-none">
                  {[
                    {
                      label: "Product updates",
                      desc: "New features and improvements",
                    },
                    {
                      label: "Usage alerts",
                      desc: "When you're close to your limit",
                    },
                    {
                      label: "Weekly summary",
                      desc: "Your course activity digest",
                    },
                  ].map(({ label, desc }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-medium">{label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {desc}
                        </p>
                      </div>
                      <div className="size-9 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                        —
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border-rose-500/20 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-rose-400 flex items-center gap-2">
                  <Shield className="size-4" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-2 border-border/50"
                  onClick={async () => {
                    await supabaseBrowser.auth.signOut();
                    window.location.href = "/";
                  }}
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </Button>
                <p className="text-[11px] text-muted-foreground/50">
                  To request account deletion, please contact{" "}
                  <a
                    href="mailto:support@syllabi.ai"
                    className="underline hover:text-muted-foreground transition-colors"
                  >
                    support@syllabi.ai
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
