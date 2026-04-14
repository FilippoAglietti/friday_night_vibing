import type { Metadata } from "next";
import { GraduationCap, ArrowRight, BookOpen, Sparkles, Users, Code } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found (404) | Syllabi",
  description: "The page you're looking for doesn't exist. Explore Syllabi's AI course generator instead.",
  robots: { index: false, follow: true },
};

const POPULAR_GENERATORS = [
  { slug: "teachers", emoji: "📚", label: "Teachers" },
  { slug: "corporate-training", emoji: "🏢", label: "Corporate Training" },
  { slug: "python-developers", emoji: "🐍", label: "Python Developers" },
  { slug: "course-creators", emoji: "🎥", label: "Course Creators" },
  { slug: "coaches", emoji: "🎯", label: "Coaches" },
  { slug: "yoga-teachers", emoji: "🧘", label: "Yoga Teachers" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 inline-flex p-4 bg-violet-900/30 rounded-full">
          <GraduationCap className="w-16 h-16 text-violet-400" />
        </div>

        <h1 className="text-7xl font-bold text-white mb-2">404</h1>

        <h2 className="text-3xl font-bold text-violet-100 mb-4">
          Page not found
        </h2>

        <p className="text-slate-300 mb-8">
          This page doesn&apos;t exist, but your next course is just a click away.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-violet-500/50"
        >
          Generate a Course <Sparkles className="size-5" />
        </Link>

        {/* Popular generators */}
        <div className="mt-12">
          <p className="text-sm text-slate-400 mb-4 uppercase tracking-wider font-semibold">Popular Course Generators</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POPULAR_GENERATORS.map((g) => (
              <Link
                key={g.slug}
                href={`/generator/${g.slug}`}
                className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm text-slate-300 hover:border-violet-500/40 hover:text-white transition-colors"
              >
                <span>{g.emoji}</span>
                <span>{g.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <Link href="/docs" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <BookOpen className="size-4" /> Docs
          </Link>
          <Link href="/blog" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <Sparkles className="size-4" /> Blog
          </Link>
          <Link href="/generator" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <Users className="size-4" /> All Generators
          </Link>
          <Link href="/support" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <Code className="size-4" /> Support
          </Link>
        </div>
      </div>
    </div>
  );
}
