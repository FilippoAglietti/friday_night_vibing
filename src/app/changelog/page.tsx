import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Sparkles, Wrench, Zap, Bug } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog — Syllabi.ai",
  description: "What's new in Syllabi.ai — product updates, new features, and fixes.",
};

type ChangeType = "feature" | "improvement" | "fix" | "new";

interface Change {
  type: ChangeType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  highlight?: string;
  changes: Change[];
}

const releases: Release[] = [
  {
    version: "1.4.0",
    date: "March 28, 2026",
    highlight: "Notion Export",
    changes: [
      { type: "new", text: "Notion export — copy your curriculum as Notion blocks and paste directly into any Notion page." },
      { type: "improvement", text: "Pricing page redesign with improved card alignment across all plans." },
      { type: "improvement", text: "Pro Max card now shows a Join Waitlist CTA instead of a disabled button." },
      { type: "fix", text: "Fixed profile page querying the wrong database table for past generations." },
    ],
  },
  {
    version: "1.3.0",
    date: "February 24, 2026",
    highlight: "PDF & Markdown Export",
    changes: [
      { type: "new", text: "PDF export — download a print-ready, formatted curriculum document in one click." },
      { type: "new", text: "Markdown export — copy your curriculum as clean Markdown for Notion, GitHub, or any editor." },
      { type: "improvement", text: "CurriculumOutput now shows module progress indicators during expanded view." },
      { type: "improvement", text: "Faster AI generation — average latency reduced by 35% via prompt optimization." },
      { type: "fix", text: "Fixed scroll behavior when navigating from footer links on mobile." },
    ],
  },
  {
    version: "1.2.0",
    date: "January 31, 2026",
    highlight: "User Profiles & Generation History",
    changes: [
      { type: "new", text: "Profile page — view and re-export all past course generations." },
      { type: "new", text: "Delete individual generations from your history." },
      { type: "improvement", text: "Auth modal now supports Google OAuth as the primary sign-in method." },
      { type: "improvement", text: "Pacing schedules are now included for all Pro generations." },
      { type: "fix", text: "Fixed animation jank on pricing card entrance on Safari." },
      { type: "fix", text: "Fixed CSS class conflict between animate-* and tw-animate-css classes." },
    ],
  },
  {
    version: "1.1.0",
    date: "January 12, 2026",
    highlight: "Pro Subscription & 5-Pack",
    changes: [
      { type: "new", text: "Pro subscription (€28/month) — 15 generations/month and all export formats." },
      { type: "new", text: "5-Pack one-time purchase (€33) — 5 full generations, no subscription." },
      { type: "new", text: "Stripe integration for secure payment processing." },
      { type: "new", text: "Paywall modal with clear plan comparison and one-click checkout." },
      { type: "improvement", text: "Bonus resources section added to all generated curricula." },
      { type: "improvement", text: "Quiz questions now include answer explanations." },
    ],
  },
  {
    version: "1.0.0",
    date: "December 20, 2025",
    highlight: "Initial Launch",
    changes: [
      { type: "new", text: "AI-powered course curriculum generation with modules, lessons, and quizzes." },
      { type: "new", text: "Support for Beginner, Intermediate, and Advanced audience levels." },
      { type: "new", text: "Niche/context field for industry-specific course generation." },
      { type: "new", text: "JSON export for all generated curricula." },
      { type: "new", text: "Free tier — 1 mini-course generation, no credit card required." },
      { type: "new", text: "Dark mode UI with smooth scroll animations." },
    ],
  },
];

const typeConfig: Record<ChangeType, { icon: typeof Sparkles; label: string; classes: string }> = {
  new: {
    icon: Sparkles,
    label: "New",
    classes: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  feature: {
    icon: Zap,
    label: "Feature",
    classes: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  improvement: {
    icon: Wrench,
    label: "Improved",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  fix: {
    icon: Bug,
    label: "Fix",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.ai</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Resources</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Changelog</h1>
          <p className="text-muted-foreground text-base">
            A full history of product updates, new features, and bug fixes.
          </p>
        </div>

        <div className="space-y-12">
          {releases.map((release) => (
            <div key={release.version} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-border/50">
              {/* Timeline dot */}
              <div className="absolute left-[-4px] top-1.5 size-2 rounded-full bg-violet-500 ring-4 ring-background" />

              <div className="mb-4 flex flex-wrap items-baseline gap-3">
                <h2 className="text-lg font-bold">v{release.version}</h2>
                {release.highlight && (
                  <span className="text-sm font-semibold text-violet-400">{release.highlight}</span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">{release.date}</span>
              </div>

              <ul className="space-y-2">
                {release.changes.map((change, i) => {
                  const cfg = typeConfig[change.type];
                  return (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className={`mt-0.5 shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.classes}`}>
                        <cfg.icon className="size-2.5" />
                        {cfg.label}
                      </span>
                      <span className="text-foreground/80 leading-snug">{change.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/40 mt-16">
        <div className="mx-auto max-w-3xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
