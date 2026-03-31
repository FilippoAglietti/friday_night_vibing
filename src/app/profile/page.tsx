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
} from "lucide-react";
import { generateCurriculumPDF } from "@/lib/pdf/generatePDF";

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
    lines.push("## 📋 Course Overview");
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
    lines.push("## 🎯 Learning Objectives");
    lines.push("");
    curriculum.objectives.forEach((obj) => lines.push(`- [ ] ${obj}`));
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## 📚 Curriculum");
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

  // ── Course card renderer (shared between Overview and Courses tabs) ──

  function CourseCard({ gen }: { gen: Generation }) {
    const c = gen.curriculum;
    const totalLessons =
      c.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0;
    const isExpanded = expandedId === gen.id;

    return (
      <Card
        className="group border-border/50 bg-card/50 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-200 cursor-pointer"
        onClick={() => setExpandedId(isExpanded ? null : gen.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-snug truncate">
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
          <div className="flex flex-wrap gap-2 mb-3">
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
            <div className="flex gap-1.5">
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
                Notion
              </Button>
            </div>
          </div>

          {isExpanded && (
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
                      <span className="text-violet-500 mt-0.5 shrink-0">•</span>
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
                    <li key={i} className="text-xs text-muted-foreground">
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
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
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
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Back to Generator
            </a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 sm:px-6">
        {/* ── Profile Header ──────────────────────────────── */}
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
              <Badge
                variant="outline"
                className="text-xs border-violet-500/30 text-violet-500"
              >
                {generations.length} course
                {generations.length !== 1 ? "s" : ""} generated
              </Badge>
            </div>
          </div>
        </div>

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
          <div className="space-y-8">
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Courses Generated",
                  value: loading ? "—" : generations.length,
                  icon: BookOpen,
                  color: "text-violet-500",
                  bg: "bg-violet-500/10",
                },
                {
                  label: "Total Hours",
                  value: loading ? "—" : `${totalHours}h`,
                  icon: Clock,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "This Month",
                  value: loading ? "—" : thisMonthCount,
                  icon: Calendar,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Current Plan",
                  value: loading ? "—" : planLabel,
                  icon: planLabel === "Free" ? Shield : Crown,
                  color:
                    planLabel === "Pro Max"
                      ? "text-amber-400"
                      : planLabel === "Pro"
                      ? "text-violet-400"
                      : "text-muted-foreground",
                  bg:
                    planLabel === "Pro Max"
                      ? "bg-amber-500/10"
                      : planLabel === "Pro"
                      ? "bg-violet-500/10"
                      : "bg-muted/50",
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label} className="border-border/50 bg-card/50">
                  <CardContent className="p-4">
                    <div
                      className={`flex items-center justify-center size-9 rounded-xl ${bg} mb-3`}
                    >
                      <Icon className={`size-4.5 ${color}`} />
                    </div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Usage bar (only for free/pro, not for Pro Max with unlimited) */}
            {userProfile && userProfile.plan !== "pro_max" && !loading && (
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="size-4 text-violet-500" />
                    Generation Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>
                      {userProfile.generations_used} of{" "}
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
                  {userProfile.plan === "free" && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Upgrade to Pro for 50 generations/month
                      </p>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
                        onClick={() => (window.location.href = "/")}
                      >
                        Upgrade
                        <ChevronRight className="size-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent courses */}
            <div>
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
                    <Sparkles className="size-10 text-violet-500/40 mx-auto mb-4" />
                    <h3 className="text-base font-semibold mb-2">
                      No courses yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                      Generate your first AI-powered course and it will appear
                      here. Export, revisit, and download anytime.
                    </p>
                    <Button
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
                      onClick={() => (window.location.href = "/")}
                    >
                      Generate Your First Course
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {generations.slice(0, 4).map((gen) => (
                    <CourseCard key={gen.id} gen={gen} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            {!loading && generations.length > 0 && (
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start h-10 sm:h-auto sm:justify-center"
                    onClick={() => (window.location.href = "/")}
                  >
                    <Sparkles className="size-3.5 mr-1.5 text-violet-500 shrink-0" />
                    Generate New Course
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start h-10 sm:h-auto sm:justify-center"
                    onClick={() => setActiveTab("courses")}
                  >
                    <BookOpen className="size-3.5 mr-1.5 text-violet-500 shrink-0" />
                    Browse All Courses
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start h-10 sm:h-auto sm:justify-center"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="size-3.5 mr-1.5 text-muted-foreground shrink-0" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
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
                placeholder="Search by title, topic, or difficulty…"
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
                  {filteredGenerations.map((gen) => (
                    <CourseCard key={gen.id} gen={gen} />
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
                    { label: "Product updates", desc: "New features and improvements" },
                    { label: "Usage alerts", desc: "When you're close to your limit" },
                    { label: "Weekly summary", desc: "Your course activity digest" },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-center justify-between">
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
