import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Best Tools for Course Creators in 2026 — The Complete Stack",
  description:
    "The essential tool stack for course creators in 2026. From AI course generators to email marketing, design, and distribution — every tool you need to create, launch, and sell online courses.",
  authors: [{ name: "Syllabi Team", url: "https://www.syllabi.online" }],
  alternates: { canonical: "/blog/best-tools-course-creators" },
  openGraph: {
    title: "Best Tools for Course Creators in 2026",
    description:
      "The essential tool stack for course creators. AI generators, email marketing, design, and distribution tools.",
    url: "https://www.syllabi.online/blog/best-tools-course-creators",
    siteName: "Syllabi",
    type: "article",
    publishedTime: "2026-04-06T08:00:00Z",
    authors: ["Syllabi Team"],
    tags: ["Course Creator Tools", "AI Tools", "Course Creation", "2026"],
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Syllabi — Best tools for course creators in 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Tools for Course Creators in 2026",
    description: "The essential tool stack for course creators. From AI generators to distribution.",
  },
};

function ToolCard({
  name,
  category,
  description,
  price,
  highlight,
}: {
  name: string;
  category: string;
  description: string;
  price: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        highlight
          ? "border-violet-500/30 bg-violet-500/5"
          : "border-border/30 bg-card/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {category}
          </span>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{price}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function Article() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: "Best Tools for Course Creators in 2026 — The Complete Stack",
            description:
              "The essential tool stack for course creators in 2026.",
            datePublished: "2026-04-06",
            dateModified: "2026-04-06",
            author: {
              "@type": "Organization",
              name: "Syllabi",
              url: "https://www.syllabi.online",
            },
            publisher: {
              "@type": "Organization",
              name: "Syllabi",
              logo: {
                "@type": "ImageObject",
                url: "https://www.syllabi.online/favicon.svg",
              },
            },
            image: "https://www.syllabi.online/og.png",
            url: "https://www.syllabi.online/blog/best-tools-course-creators",
            mainEntityOfPage:
              "https://www.syllabi.online/blog/best-tools-course-creators",
            inLanguage: "en-US",
          },
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: "Best Tools for Course Creators in 2026", url: "/blog/best-tools-course-creators" },
          ]),
        ]}
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
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Resources</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Best Tools for Course Creators in 2026
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Building and selling online courses requires more than just expertise. Here&apos;s the complete
            tool stack that the most successful course creators use in 2026 &mdash; from ideation to revenue.
          </p>
          <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              April 6, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              8 min read
            </span>
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              Syllabi Team
            </span>
          </div>
        </header>

        <div className="prose prose-invert prose-violet max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-muted-foreground [&>p]:mb-4 [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-6 [&>blockquote]:border-l-violet-500 [&>blockquote]:bg-violet-500/5 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-lg [&>blockquote]:text-muted-foreground [&>blockquote]:not-italic [&>blockquote]:mb-6">

          <p>
            We surveyed 200+ course creators and analyzed their tool stacks to find what actually
            moves the needle. The result is a curated list organized by workflow stage &mdash; so you know
            exactly what you need and when.
          </p>

          <h2>1. Course creation & structuring</h2>
          <p>
            The foundation of any successful course starts with solid structure. These tools help you
            go from topic idea to a complete course.
          </p>
        </div>

        {/* Tool cards */}
        <div className="space-y-3 my-6">
          <ToolCard
            name="Syllabi"
            category="AI Course Generator"
            description="Generate complete courses with modules, lessons, quizzes, and a NotebookLM-ready podcast export in 60 seconds. Supports 16 languages and exports to PDF, Notion, DOCX, and more."
            price="Free / from €29/mo"
            highlight
          />
          <ToolCard
            name="Notion"
            category="Content Organization"
            description="The Swiss army knife for course planning. Organize research, draft lessons, and collaborate with co-creators. Syllabi exports directly to Notion blocks."
            price="Free / from $10/mo"
          />
          <ToolCard
            name="Miro"
            category="Visual Planning"
            description="Map out your course visually before building it. Great for workshop-style courses where the learning path isn't linear."
            price="Free / from $8/mo"
          />
        </div>

        <div className="prose prose-invert prose-violet max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-muted-foreground [&>p]:mb-4 [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-6 [&>blockquote]:border-l-violet-500 [&>blockquote]:bg-violet-500/5 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-lg [&>blockquote]:text-muted-foreground [&>blockquote]:not-italic [&>blockquote]:mb-6">

          <h2>2. Content production</h2>
          <p>
            Once your structure is set, you need tools to produce the actual content &mdash; whether that&apos;s
            text, slides, or recordings.
          </p>
        </div>

        <div className="space-y-3 my-6">
          <ToolCard
            name="Claude / ChatGPT"
            category="AI Writing Assistant"
            description="Draft lesson content, generate quiz questions, and refine your course copy. Works best when you give it your outline and ask it to expand specific sections."
            price="Free / from $20/mo"
          />
          <ToolCard
            name="Canva"
            category="Visual Design"
            description="Create course thumbnails, social media graphics, and slide decks. The brand kit feature ensures consistency across all your course materials."
            price="Free / from $13/mo"
          />
          <ToolCard
            name="Descript"
            category="Audio/Video Editing"
            description="Record and edit audio or video lessons with AI-powered transcription and editing. Edit audio by editing text."
            price="Free / from $24/mo"
          />
          <ToolCard
            name="Loom"
            category="Screen Recording"
            description="Quick video lessons and walkthroughs. Perfect for technical courses where you need to show a screen while explaining concepts."
            price="Free / from $15/mo"
          />
        </div>

        <div className="prose prose-invert prose-violet max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-muted-foreground [&>p]:mb-4 [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-6 [&>blockquote]:border-l-violet-500 [&>blockquote]:bg-violet-500/5 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-lg [&>blockquote]:text-muted-foreground [&>blockquote]:not-italic [&>blockquote]:mb-6">

          <h2>3. Distribution & hosting</h2>
          <p>
            Your course needs a home. The right platform depends on whether you&apos;re selling direct,
            using it as a lead magnet, or distributing internally.
          </p>
        </div>

        <div className="space-y-3 my-6">
          <ToolCard
            name="Teachable"
            category="Course Platform"
            description="The most popular course hosting platform. Built-in payment processing, student management, and completion certificates."
            price="From $39/mo"
          />
          <ToolCard
            name="Gumroad"
            category="Digital Products"
            description="Sell your course as a digital product with minimal setup. Great for PDFs, bundles, and one-time purchases."
            price="10% transaction fee"
          />
          <ToolCard
            name="Syllabi Share Links"
            category="Direct Distribution"
            description="Generate a shareable link for any course — no platform needed. Add email gating to use courses as lead magnets."
            price="Included in Syllabi"
            highlight
          />
        </div>

        <div className="prose prose-invert prose-violet max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-muted-foreground [&>p]:mb-4 [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-6 [&>blockquote]:border-l-violet-500 [&>blockquote]:bg-violet-500/5 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-lg [&>blockquote]:text-muted-foreground [&>blockquote]:not-italic [&>blockquote]:mb-6">

          <h2>4. Marketing & growth</h2>
          <p>
            Building a great course is only half the battle. You need to get it in front of the right people.
          </p>
        </div>

        <div className="space-y-3 my-6">
          <ToolCard
            name="ConvertKit"
            category="Email Marketing"
            description="Purpose-built for creators. Automated sequences, landing pages, and subscriber tagging make it easy to nurture leads into students."
            price="Free / from $29/mo"
          />
          <ToolCard
            name="Typefully"
            category="Social Media"
            description="Write and schedule Twitter/LinkedIn threads that promote your course content. The analytics help you understand what resonates."
            price="Free / from $12/mo"
          />
          <ToolCard
            name="Testimonial.to"
            category="Social Proof"
            description="Collect and display student testimonials. Video testimonials convert 2x better than text. Embed them on your sales page."
            price="Free / from $20/mo"
          />
        </div>

        <div className="prose prose-invert prose-violet max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-muted-foreground [&>p]:mb-4 [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-6 [&>blockquote]:border-l-violet-500 [&>blockquote]:bg-violet-500/5 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-lg [&>blockquote]:text-muted-foreground [&>blockquote]:not-italic [&>blockquote]:mb-6">

          <h2>5. Analytics & improvement</h2>
          <p>
            Track what&apos;s working and iterate. The best course creators treat their courses like
            products &mdash; constantly measuring and improving.
          </p>
        </div>

        <div className="space-y-3 my-6">
          <ToolCard
            name="Hotjar"
            category="User Behavior"
            description="Heatmaps and session recordings for your course landing page. See where visitors drop off and optimize your conversion funnel."
            price="Free / from $32/mo"
          />
          <ToolCard
            name="Google Search Console"
            category="SEO"
            description="Track how your course content ranks in search. Essential for blog posts and landing pages that drive organic traffic."
            price="Free"
          />
        </div>

        <div className="prose prose-invert prose-violet max-w-none [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-muted-foreground [&>p]:mb-4 [&>blockquote]:border-l-violet-500 [&>blockquote]:bg-violet-500/5 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-lg [&>blockquote]:text-muted-foreground [&>blockquote]:not-italic [&>blockquote]:mb-6">

          <h2>The minimum viable stack</h2>
          <p>
            You don&apos;t need all of these tools to get started. The minimum viable course creator stack is:
          </p>
          <ol>
            <li><strong>Syllabi</strong> (free tier) &mdash; Generate your course structure and content</li>
            <li><strong>Notion</strong> (free) &mdash; Organize and host your course content</li>
            <li><strong>ConvertKit</strong> (free tier) &mdash; Collect emails and send updates</li>
            <li><strong>Canva</strong> (free) &mdash; Create visuals and social media assets</li>
          </ol>
          <p>
            Total cost: $0. You can build, distribute, and market a professional course without
            spending a cent. Upgrade individual tools as your revenue justifies it.
          </p>

          <blockquote>
            <p>
              The best tool stack is the one you actually use. Start small, ship your first course,
              and add tools as specific bottlenecks emerge &mdash; not before.
            </p>
          </blockquote>

          <h2>Start building</h2>
          <p>
            <Link href="/" className="text-violet-400 hover:text-violet-300 underline underline-offset-4">Create your first course with Syllabi</Link> for
            free and see how it fits into your workflow. Three free generations, no credit card required.
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
