import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Sparkles, Wrench, Zap, Bug } from "lucide-react";
import { JsonLd, breadcrumbJsonLd, BREADCRUMBS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Changelog — What's New in Syllabi",
  description:
    "Full history of Syllabi updates: new features, improvements, and bug fixes. See what's new in the AI course generator.",
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: "Syllabi Changelog — Product Updates & New Features",
    description: "See what's new in Syllabi's AI course generator. Full release history with features, improvements, and fixes.",
    url: "https://www.syllabi.online/changelog",
    siteName: "Syllabi",
    type: "website",
  },
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
    version: "1.5.0",
    date: "April 8, 2026",
    highlight: "AI Audio Lessons & Inngest Pipeline",
    changes: [
      { type: "new", text: "AI-powered audio narration for every lesson — choose from multiple voices and generate podcast-style content." },
      { type: "new", text: "Inngest background processing pipeline for faster, more reliable course generation." },
      { type: "new", text: "Shareable course links — one-click sharing with a beautiful public course view." },
      { type: "new", text: "PPTX and DOCX export formats alongside existing PDF and Notion exports." },
      { type: "improvement", text: "Rewritten generation prompts — courses are now topic-aware and audience-calibrated for better output." },
      { type: "improvement", text: "Tutorial page completely redesigned with interactive 6-step timeline." },
      { type: "improvement", text: "Rate limiting via Upstash for fair usage across all plans." },
      { type: "fix", text: "Fixed registration flow for new email/password sign-ups." },
      { type: "fix", text: "Fixed pg_cron cleanup for stuck course generations." },
    ],
  },
  {
    version: "1.4.0",
    date: "March 28, 2026",
    highlight: "Notion Export",
    changes: [
      { type: "new", text: "Notion export — copy your course as Notion blocks and paste directly into any Notion page." },
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
      { type: "new", text: "PDF export — download a print-ready, formatted course document in one click." },
      { type: "new", text: "Markdown export — copy your course as clean Markdown for Notion, GitHub, or any editor." },
      { type: "improvement", text: "Course output now shows module progress indicators during expanded view." },
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
      { type: "improvement", text: "Bonus resources section added to all generated courses." },
      { type: "improvement", text: "Quiz questions now include answer explanations." },
    ],
  },
  {
    version: "1.0.0",
    date: "December 20, 2025",
    highlight: "Initial Launch",
    changes: [
      { type: "new", text: "AI-powered course generation with modules, lessons, and quizzes." },
      { type: "new", text: "Support for Beginner, Intermediate, and Advanced audience levels." },
      { type: "new", text: "Niche/context field for industry-specific course generation." },
      { type: "new", text: "JSON export for all generated courses." },
      { type: "new", text: "Free tier — 3 free mini-course generations, no credit card required." },
      { type: "new", text: "Dark mode UI with smooth scroll animations." },
    ],
  },
];

const typeConfig: Record<ChangeType, { icon: typeof Sparkles; label: string; classes: string }> = {
  new: {
    icon: Sparkles,
    label: "New",
    classes: "bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]",
  },
  feature: {
    icon: Zap,
    label: "Feature",
    classes: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]",
  },
  improvement: {
    icon: Wrench,
    label: "Improved",
    classes: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
  },
  fix: {
    icon: Bug,
    label: "Fix",
    classes: "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(217,119,6,0.3)]",
  },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMBS.changelog)} />
      {/* Gradient background top */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-violet-950/40 via-background/20 to-background/0 pointer-events-none" />
      
      {/* Dot pattern overlay */}
      <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none opacity-30" 
        style={{
          backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="border-b border-violet-500/20 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.online</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 py-12 sm:py-16 z-20">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Resources</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-violet-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">Changelog</h1>
          <p className="text-muted-foreground text-base">
            A full history of product updates, new features, and bug fixes.
          </p>
        </div>

        <div className="space-y-6">
          {releases.map((release, idx) => (
            <div key={release.version} className="relative pl-8">
              {/* Glowing timeline line */}
              <div className="absolute left-0 top-2 bottom-0 w-px before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-violet-500/40 before:to-violet-500/10 before:blur-sm" />
              
              {/* Timeline dot with glow */}
              <div className="absolute left-[-4px] top-1.5 size-2 rounded-full bg-violet-500 ring-4 ring-background shadow-[0_0_8px_rgba(139,92,246,0.4)]" />

              {/* Glass morphism card */}
              <div className="rounded-lg border border-violet-500/20 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm p-5 hover:border-violet-500/30 transition-colors">
                <div className="mb-4 flex flex-wrap items-baseline gap-3">
                  <h2 className="text-lg font-bold">v{release.version}</h2>
                  {idx === 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-xs font-semibold text-violet-400">
                      <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
                      Latest
                    </span>
                  )}
                  {release.highlight && (
                    <span className="text-sm font-semibold text-violet-400">{release.highlight}</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{release.date}</span>
                </div>

                <ul className="space-y-3">
                  {release.changes.map((change, i) => {
                    const cfg = typeConfig[change.type];
                    return (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className={`mt-0.5 shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.classes}`}>
                          <cfg.icon className="size-3" />
                          {cfg.label}
                        </span>
                        <span className="text-foreground/80 leading-snug">{change.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative border-t border-border/40 mt-16 z-20">
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