import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, ArrowRight, Check, Sparkles, BookOpen, Headphones, FileText, Globe, Brain } from "lucide-react";
import { getNicheBySlug, getAllNicheSlugs, NICHES, CATEGORY_LABELS, getNichesByCategory } from "@/data/niches";
import { JsonLd, breadcrumbJsonLd, BASE_URL } from "@/lib/seo";

// ── Static generation ────────────────────────────────────────
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({ niche }));
}

// ── Dynamic metadata per niche ───────────────────────────────
type Props = { params: Promise<{ niche: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche: slug } = await params;
  const niche = getNicheBySlug(slug);
  if (!niche) return {};

  return {
    title: niche.headline,
    description: niche.metaDescription,
    alternates: { canonical: `/generator/${niche.slug}` },
    keywords: niche.keywords,
    openGraph: {
      title: niche.headline,
      description: niche.metaDescription,
      url: `${BASE_URL}/generator/${niche.slug}`,
      siteName: "Syllabi",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: niche.headline,
      description: niche.metaDescription,
    },
  };
}

// ── Features (shared across all niche pages) ─────────────────
const FEATURES = [
  { icon: Brain, label: "AI-Powered Generation", desc: "Complete courses in under 60 seconds" },
  { icon: Headphones, label: "NotebookLM Export", desc: "One-click Markdown → conversational podcast via Google NotebookLM" },
  { icon: FileText, label: "Multi-Format Export", desc: "PDF, Notion, PPTX, DOCX, and JSON" },
  { icon: Globe, label: "16 Languages", desc: "Generate courses in any supported language" },
  { icon: BookOpen, label: "Quizzes & Assessments", desc: "Auto-generated per-module quizzes" },
  { icon: Sparkles, label: "Course Editor", desc: "Customize every module after generation" },
];

// ── Page component ───────────────────────────────────────────
export default async function NichePage({ params }: Props) {
  const { niche: slug } = await params;
  const niche = getNicheBySlug(slug);
  if (!niche) notFound();

  // Related niches (same category, excluding current)
  const byCategory = getNichesByCategory();
  const related = (byCategory[niche.category] || [])
    .filter((n) => n.slug !== niche.slug)
    .slice(0, 4);

  // JSON-LD: Breadcrumb + FAQPage
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Course Generators", url: "/generator" },
    { name: niche.headline.replace("AI Course Generator for ", ""), url: `/generator/${niche.slug}` },
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: niche.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark relative overflow-hidden">
      <JsonLd data={[breadcrumb, faqSchema]} />

      {/* Gradient background */}
      <div className="absolute inset-0 h-[600px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />
      <div className="absolute inset-0 h-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
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
        {/* ── BLUF: Direct Answer Block (for AEO) ─────────── */}
        <section className="mb-12 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-400 mb-2">
            {niche.emoji} What is Syllabi?
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Syllabi is the <strong className="text-foreground">#1 AI course generator</strong> that creates complete, structured courses in under 60 seconds. Perfect for {niche.headline.replace("AI Course Generator for ", "").toLowerCase()}.
          </p>
          <ol className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">1</span>
              Enter your course topic and target audience
            </li>
            <li className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">2</span>
              AI generates modules, lessons, quizzes, and pacing schedules
            </li>
            <li className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">3</span>
              Export to PDF, Notion, PPTX, or share with a link
            </li>
          </ol>
        </section>

        {/* ── Hero ────────────────────────────────────────── */}
        <div className="text-center mb-16">
          <span className="text-5xl mb-4 block">{niche.emoji}</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            {niche.headline}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            {niche.tagline}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-base font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/25"
          >
            Generate Your First Course — Free <ArrowRight className="size-5" />
          </Link>
        </div>

        {/* ── Description ─────────────────────────────────── */}
        <section className="mb-16 max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {niche.blurb}
          </p>
        </section>

        {/* ── Use Cases ───────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            What You Can Create
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {niche.useCases.map((uc) => (
              <div
                key={uc}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4"
              >
                <Check className="size-5 text-violet-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{uc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ───────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5"
              >
                <f.icon className="size-6 text-violet-500 mb-3" />
                <h3 className="font-semibold mb-1">{f.label}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ (with schema) ───────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {niche.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <summary className="cursor-pointer px-5 py-4 font-medium text-foreground flex items-center justify-between">
                  {faq.question}
                  <span className="text-violet-500 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <div className="px-5 pb-4 text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────── */}
        <section className="mb-16 text-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-3">
            Ready to Build Your Course?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of {niche.headline.replace("AI Course Generator for ", "").toLowerCase()} who use Syllabi to create professional courses in seconds. Start free — no credit card required.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-base font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/25"
          >
            Generate a Course Now <Sparkles className="size-5" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            3 free generations · No sign-up required · Export to PDF, Notion, PPTX
          </p>
        </section>

        {/* ── Related Niches ──────────────────────────────── */}
        {related.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-bold mb-4">
              Also Popular in {CATEGORY_LABELS[niche.category] || niche.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/generator/${r.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 hover:border-violet-500/40 transition-colors"
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <p className="font-medium text-sm">{r.headline.replace("AI Course Generator for ", "")}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{r.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Browse All Generators ───────────────────────── */}
        <section className="mb-8">
          <div className="text-center">
            <Link
              href="/generator"
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              Browse all course generators →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 relative">
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
