import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import { getNichesByCategory, CATEGORY_LABELS } from "@/data/niches";
import { JsonLd, breadcrumbJsonLd, BASE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Course Generator by Industry & Role",
  description:
    "Create AI-powered courses for any industry or profession. Browse specialized course generators for teachers, corporate trainers, developers, coaches, healthcare professionals, and more.",
  alternates: { canonical: "/generator" },
  keywords: [
    "AI course generator",
    "course builder by industry",
    "online course creator",
    "curriculum generator",
    "training program builder",
  ],
  openGraph: {
    title: "AI Course Generator by Industry & Role | Syllabi",
    description:
      "Browse 30+ specialized AI course generators. Create professional curricula for any industry in under 60 seconds.",
    url: `${BASE_URL}/generator`,
    siteName: "Syllabi",
    type: "website",
  },
};

const CATEGORY_ORDER = [
  "education",
  "technology",
  "business",
  "corporate",
  "creative",
  "health",
  "language",
];

export default function GeneratorIndexPage() {
  const byCategory = getNichesByCategory();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Course Generators", url: "/generator" },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground dark relative overflow-hidden">
      <JsonLd data={breadcrumb} />

      {/* Gradient background */}
      <div className="absolute inset-0 h-[500px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />
      <div className="absolute inset-0 h-[500px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10 relative">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.online</span></span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
          >
            Try It Free <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            AI Course Generator for Every Industry
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Create professional, structured courses tailored to your specific industry, role, or audience. Pick your niche below and generate your first course in under 60 seconds.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-base font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/25"
          >
            Or Start Generating Now <Sparkles className="size-5" />
          </Link>
        </div>

        {/* Category sections */}
        {CATEGORY_ORDER.map((cat) => {
          const niches = byCategory[cat];
          if (!niches?.length) return null;
          return (
            <section key={cat} className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                {CATEGORY_LABELS[cat] || cat}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {niches.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/generator/${n.slug}`}
                    className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 hover:border-violet-500/40 transition-colors"
                  >
                    <span className="text-2xl mt-0.5">{n.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm group-hover:text-violet-400 transition-colors">
                        {n.headline.replace("AI Course Generator for ", "")}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.tagline}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Bottom CTA */}
        <section className="text-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-3">
            Don&apos;t See Your Niche?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Syllabi works for any topic. Just enter your subject, audience, and desired course length — the AI handles the rest.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-base font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/25"
          >
            Generate Any Course — Free <ArrowRight className="size-5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12 relative">
        <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <GraduationCap className="size-4 text-violet-500" />
            syllabi<span className="text-violet-500">.online</span>
          </Link>
          <div className="flex gap-6">
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
