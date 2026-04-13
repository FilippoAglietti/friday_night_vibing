import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Clock, Calendar, User, Check, X } from "lucide-react";
import { JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Course Generator Comparison 2026 — Syllabi vs CourseAI vs Coursebox",
  description:
    "Honest comparison of the top AI course generators in 2026. We break down Syllabi, CourseAI, Coursebox, and others by features, pricing, output quality, and ease of use.",
  alternates: { canonical: "/blog/ai-course-generator-comparison" },
  openGraph: {
    title: "AI Course Generator Comparison 2026",
    description:
      "Side-by-side comparison of the best AI course generators. Features, pricing, and real output quality.",
    url: "https://www.syllabi.online/blog/ai-course-generator-comparison",
    siteName: "Syllabi",
    type: "article",
    publishedTime: "2026-04-08T08:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Course Generator Comparison 2026",
    description: "Honest comparison of the top AI course generators by features, pricing, and output quality.",
  },
};

function FeatureRow({ feature, values }: { feature: string; values: (boolean | string)[] }) {
  return (
    <tr className="border-b border-border/20">
      <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">{feature}</td>
      {values.map((v, i) => (
        <td key={i} className="py-3 px-4 text-center text-sm">
          {typeof v === "boolean" ? (
            v ? (
              <Check className="size-4 text-emerald-400 mx-auto" />
            ) : (
              <X className="size-4 text-muted-foreground/30 mx-auto" />
            )
          ) : (
            <span className="text-muted-foreground">{v}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

export default function Article() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: "AI Course Generator Comparison 2026 — Syllabi vs CourseAI vs Coursebox",
          description:
            "Side-by-side comparison of the top AI course generators in 2026.",
          datePublished: "2026-04-08",
          dateModified: "2026-04-08",
          author: { "@type": "Organization", name: "Syllabi", url: "https://www.syllabi.online" },
          publisher: { "@type": "Organization", name: "Syllabi", url: "https://www.syllabi.online" },
          url: "https://www.syllabi.online/blog/ai-course-generator-comparison",
        }}
      />

      <div className="absolute inset-0 h-[500px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />

      <header className="relative border-b border-transparent bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.online</span></span>
          </Link>
          <Link href="/blog" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            All posts
          </Link>
        </div>
      </header>

      <article className="relative mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Comparison</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            AI Course Generator Comparison 2026
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            We tested every major AI course generator on the market and compared them across the
            features that actually matter: output quality, audio support, export options, and pricing.
          </p>
          <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              April 8, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              10 min read
            </span>
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              Syllabi Team
            </span>
          </div>
        </header>

        <div className="prose prose-invert prose-violet max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-muted-foreground [&>p]:mb-4 [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-6 [&>ol]:text-muted-foreground [&>ol]:space-y-2 [&>ol]:mb-6 [&>blockquote]:border-l-violet-500 [&>blockquote]:bg-violet-500/5 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-lg [&>blockquote]:text-muted-foreground [&>blockquote]:not-italic [&>blockquote]:mb-6">

          <p>
            <strong>Disclosure:</strong> We built Syllabi, so we have a clear bias. That said, we&apos;ve
            tried to be as fair as possible. We&apos;ll point out where competitors genuinely do things
            better and where Syllabi falls short.
          </p>

          <h2>The landscape in 2026</h2>
          <p>
            AI course generators have exploded in the last 18 months. What started as simple outline
            generators have evolved into comprehensive platforms that produce structured courses with
            quizzes, audio narration, and export capabilities. Here are the major players:
          </p>
          <ul>
            <li><strong>Syllabi</strong> &mdash; Full-stack course generator with audio narration, multilingual support, and rich export options</li>
            <li><strong>CourseAI</strong> &mdash; Established player focused on video-based course creation</li>
            <li><strong>Coursebox</strong> &mdash; AI-powered LMS with built-in course creation</li>
            <li><strong>MindSmith</strong> &mdash; Microlearning-focused platform for corporate training</li>
            <li><strong>Teachable AI</strong> &mdash; Teachable&apos;s built-in AI course assistant</li>
          </ul>

          <h2>Feature comparison</h2>
        </div>

        {/* Comparison table */}
        <div className="my-8 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border/40">
                <th className="py-3 pr-4 text-left text-sm font-semibold text-foreground">Feature</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-violet-400">Syllabi</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground">CourseAI</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground">Coursebox</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground">MindSmith</th>
              </tr>
            </thead>
            <tbody>
              <FeatureRow feature="AI course generation" values={[true, true, true, true]} />
              <FeatureRow feature="AI audio narration" values={[true, false, false, false]} />
              <FeatureRow feature="Quiz generation" values={[true, true, true, true]} />
              <FeatureRow feature="PDF export" values={[true, true, true, false]} />
              <FeatureRow feature="Notion export" values={[true, false, false, false]} />
              <FeatureRow feature="PPTX / DOCX export" values={[true, false, true, true]} />
              <FeatureRow feature="Shareable course links" values={[true, false, true, true]} />
              <FeatureRow feature="Lead magnet / email gate" values={[true, false, false, false]} />
              <FeatureRow feature="Multilingual (16+ languages)" values={[true, false, "5 langs", false]} />
              <FeatureRow feature="Full lesson content" values={[true, "Outline only", true, "Micro only"]} />
              <FeatureRow feature="Course editor" values={[true, true, true, true]} />
              <FeatureRow feature="Built-in LMS" values={[false, false, true, false]} />
              <FeatureRow feature="Free tier" values={[true, false, true, true]} />
              <FeatureRow feature="Starting price" values={["€29/mo", "$49/mo", "$42/mo", "$25/mo"]} />
            </tbody>
          </table>
        </div>

        <div className="prose prose-invert prose-violet max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-muted-foreground [&>p]:mb-4 [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-6 [&>blockquote]:border-l-violet-500 [&>blockquote]:bg-violet-500/5 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-lg [&>blockquote]:text-muted-foreground [&>blockquote]:not-italic [&>blockquote]:mb-6">

          <h2>Where Syllabi stands out</h2>

          <h3>AI audio narration</h3>
          <p>
            Syllabi is currently the only AI course generator that produces professional audio narration
            for every lesson. This isn&apos;t text-to-speech bolted on &mdash; it&apos;s integrated into the
            generation pipeline. Students get podcast-style audio they can listen to on the go, which
            dramatically improves completion rates.
          </p>

          <h3>Export versatility</h3>
          <p>
            No other tool matches Syllabi&apos;s export range: PDF, DOCX, PPTX, Notion blocks, Markdown,
            and shareable web links with optional email gating. If you&apos;re a consultant or agency
            delivering courses to clients, this flexibility is a significant advantage.
          </p>

          <h3>Multilingual support</h3>
          <p>
            Syllabi supports 16 languages natively &mdash; not just translating an English outline, but
            generating culturally appropriate content in the target language from scratch. This is a
            major differentiator for non-English markets.
          </p>

          <h2>Where competitors do better</h2>

          <h3>Built-in LMS (Coursebox)</h3>
          <p>
            If you need a complete learning management system with student progress tracking, grading,
            and certificates, Coursebox has this built in. Syllabi focuses on course creation and
            distribution rather than student management. You&apos;d pair Syllabi with an external LMS like
            Teachable or Notion for that workflow.
          </p>

          <h3>Video integration (CourseAI)</h3>
          <p>
            CourseAI has deeper video creation integration, helping you script and produce video lessons.
            Syllabi focuses on text + audio, which covers most use cases but doesn&apos;t generate video.
          </p>

          <h2>Our recommendation</h2>
          <p>
            There&apos;s no single &quot;best&quot; tool &mdash; it depends on your use case:
          </p>
          <ul>
            <li><strong>You want the most complete course output</strong> (with audio, quizzes, and export): Syllabi</li>
            <li><strong>You need a full LMS</strong> with student management: Coursebox</li>
            <li><strong>You&apos;re making video courses</strong>: CourseAI</li>
            <li><strong>You need microlearning for corporate teams</strong>: MindSmith</li>
          </ul>

          <blockquote>
            <p>
              The best approach? Try the free tier of each and generate the same course. Compare the
              output quality side by side &mdash; that&apos;s what will matter most to your students.
            </p>
          </blockquote>

          <h2>Try it yourself</h2>
          <p>
            <Link href="/" className="text-violet-400 hover:text-violet-300 underline underline-offset-4">Create a free course with Syllabi</Link> and
            see how the output compares. Three free generations, no credit card required.
          </p>
        </div>
      </article>

      <footer className="relative border-t border-border/40">
        <div className="mx-auto max-w-3xl px-4 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            &larr; All posts
          </Link>
        </div>
      </footer>
    </div>
  );
}
