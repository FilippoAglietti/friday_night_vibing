import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Clock, ArrowRight, Mail } from "lucide-react";
import { JsonLd, breadcrumbJsonLd, BREADCRUMBS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog — AI Course Creation Tips & Updates",
  description:
    "Tips, guides, and product updates for course creators using AI. Learn how to create better online courses, grow your audience, and sell your courses.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Syllabi Blog — AI Course Creation Tips & Updates",
    description:
      "Insights, guides, and updates for educators and course creators building with AI.",
    url: "https://www.syllabi.online/blog",
    siteName: "Syllabi",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Syllabi Blog — AI Course Creation Tips",
    description: "Tips and guides for creating better online courses with AI.",
  },
};

const posts = [
  {
    slug: "/blog/how-to-create-online-course-2026",
    category: "Guide",
    date: "April 10, 2026",
    readTime: "12 min read",
    title: "How to Create an Online Course in 2026 — Complete Guide",
    excerpt:
      "The definitive step-by-step guide to creating a professional online course in 2026. From topic validation to launch, using AI tools and proven frameworks.",
    accent: "text-violet-400",
    featured: true,
  },
  {
    slug: "/blog/ai-course-generator-comparison",
    category: "Comparison",
    date: "April 8, 2026",
    readTime: "10 min read",
    title: "AI Course Generator Comparison 2026 — Syllabi vs CourseAI vs Coursebox",
    excerpt:
      "Honest side-by-side comparison of the top AI course generators. We break down features, pricing, output quality, and where each tool shines.",
    accent: "text-cyan-400",
  },
  {
    slug: "/blog/best-tools-course-creators",
    category: "Resources",
    date: "April 6, 2026",
    readTime: "8 min read",
    title: "Best Tools for Course Creators in 2026 — The Complete Stack",
    excerpt:
      "The essential tool stack for course creators: from AI course generators to email marketing, design, and distribution. Every tool you need, organized by workflow.",
    accent: "text-emerald-400",
  },
  {
    slug: "#",
    category: "Product",
    date: "April 4, 2026",
    readTime: "3 min read",
    title: "NotebookLM Export Is Here — Turn Your Course into a Conversational Podcast",
    excerpt:
      "Masterclass users can now export any course as NotebookLM-ready Markdown. Drop the file into Google NotebookLM to generate a two-host conversational podcast on demand.",
    accent: "text-rose-400",
  },
  {
    slug: "#",
    category: "Guide",
    date: "April 2, 2026",
    readTime: "5 min read",
    title: "How to Create a Lead Magnet Mini-Course in 60 Seconds",
    excerpt:
      "The fastest way to grow your email list: create a free mini-course, add email capture, and share the link. Here's exactly how to do it with Syllabi.",
    accent: "text-amber-400",
  },
  {
    slug: "#",
    category: "Product",
    date: "March 28, 2026",
    readTime: "4 min read",
    title: "Introducing Notion Export: Paste Your Course Directly into Notion",
    excerpt:
      "We're excited to launch Notion export — your entire course, formatted as Notion blocks, ready to paste in one click. No more manual reformatting.",
    accent: "text-violet-400",
  },
  {
    slug: "#",
    category: "Guide",
    date: "March 20, 2026",
    readTime: "6 min read",
    title: "How to Write Better Course Prompts: 7 Tips from Our Power Users",
    excerpt:
      "The quality of your AI-generated course depends heavily on what you put in. Here are seven proven strategies our top users use to get outstanding results.",
    accent: "text-cyan-400",
  },
  {
    slug: "#",
    category: "Insights",
    date: "March 12, 2026",
    readTime: "5 min read",
    title: "The Course Creator's 2026 Landscape: Why AI-First Tools Are Winning",
    excerpt:
      "The online education market has shifted dramatically. We break down why course creators who adopt AI tools early are seeing 3x faster production cycles.",
    accent: "text-emerald-400",
  },
  {
    slug: "#",
    category: "Guide",
    date: "March 4, 2026",
    readTime: "7 min read",
    title: "From Syllabus to Sale: Packaging Your Syllabi Course for Platforms",
    excerpt:
      "You've generated a great course. Now what? A step-by-step guide to turning your Syllabi output into a sellable product on Teachable, Kajabi, or your own site.",
    accent: "text-amber-400",
  },
  {
    slug: "#",
    category: "Product",
    date: "February 24, 2026",
    readTime: "3 min read",
    title: "PDF Export Is Here — Print-Ready Courses in One Click",
    excerpt:
      "Share polished course outlines with clients, co-creators, and students without leaving Syllabi. Our new PDF export generates a beautifully formatted document instantly.",
    accent: "text-violet-400",
  },
  {
    slug: "#",
    category: "Insights",
    date: "February 15, 2026",
    readTime: "8 min read",
    title: "What Makes a Great Online Course? We Analyzed 500 Top Courses",
    excerpt:
      "We studied 500 highly-rated online courses across categories to find common structural patterns. The results shaped how Syllabi generates courses.",
    accent: "text-cyan-400",
  },
];

const categories = ["All", "Product", "Guide", "Comparison", "Resources", "Insights"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark overflow-hidden">
      <JsonLd data={[
        breadcrumbJsonLd(BREADCRUMBS.blog),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Syllabi Blog — AI Course Creation Tips & Updates",
          description: "Tips, guides, and product updates for course creators using AI.",
          url: "https://www.syllabi.online/blog",
          publisher: {
            "@type": "Organization",
            name: "Syllabi",
            url: "https://www.syllabi.online",
          },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: posts.map((post, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "BlogPosting",
                headline: post.title,
                description: post.excerpt,
                datePublished: new Date(post.date).toISOString().split("T")[0],
                author: { "@type": "Organization", name: "Syllabi" },
                publisher: { "@type": "Organization", name: "Syllabi", url: "https://www.syllabi.online" },
                url: "https://www.syllabi.online/blog",
              },
            })),
          },
        },
      ]} />
      {/* Gradient background */}
      <div className="absolute inset-0 h-[500px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative border-b border-transparent bg-gradient-to-r from-transparent via-violet-500/5 to-transparent bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.online</span></span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {/* Hero section */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Resources</p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
            Blog
          </h1>
          <p className="text-muted-foreground text-base max-w-xl">
            Tips, guides, and updates for course creators building with AI.
          </p>
        </div>

        {/* Category filter — glass style */}
        <div className="flex gap-2 mb-12 flex-wrap">
          {categories.map((cat, i) => (
            <span
              key={cat}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                i === 0
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-white/5 backdrop-blur-sm border border-border/40 text-muted-foreground hover:text-foreground hover:border-violet-500/30"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Featured post */}
        {posts[0].slug !== "#" ? (
          <Link href={posts[0].slug} className="block mb-12">
            <article className="rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm p-8 sm:p-10 group relative overflow-hidden hover:border-violet-500/30 transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-indigo-500" />
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${posts[0].accent}`}>{posts[0].category}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{posts[0].readTime}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold leading-snug mb-4 text-foreground group-hover:text-violet-300 transition-colors">{posts[0].title}</h2>
                <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-2xl">{posts[0].excerpt}</p>
                <div className="flex items-center justify-between mt-8">
                  <span className="text-xs text-muted-foreground/60">{posts[0].date}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                    Read article <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ) : (
          <article className="mb-12 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm p-8 sm:p-10 group relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-indigo-500" />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <span className={`text-xs font-semibold uppercase tracking-wider ${posts[0].accent}`}>{posts[0].category}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{posts[0].readTime}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-snug mb-4 text-foreground">{posts[0].title}</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-2xl">{posts[0].excerpt}</p>
              <div className="flex items-center justify-between mt-8">
                <span className="text-xs text-muted-foreground/60">{posts[0].date}</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50">Coming Soon</span>
              </div>
            </div>
          </article>
        )}

        {/* Posts grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {posts.slice(1).map((post) => {
            const isLive = post.slug !== "#";
            const cardContent = (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${post.accent}`}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {post.readTime}
                  </span>
                </div>
                <h2 className="font-bold leading-snug mb-3 text-foreground group-hover:text-violet-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-muted-foreground/60">{post.date}</span>
                  {isLive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 px-2 py-1 rounded bg-violet-500/10 border border-violet-500/20">
                      Read <ArrowRight className="size-3" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground px-2 py-1 rounded bg-muted/50">
                      Coming Soon
                    </span>
                  )}
                </div>
              </>
            );

            const className = "group flex flex-col rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm p-6 hover:border-violet-500/20 hover:scale-[1.01] transition-all duration-300";

            return isLive ? (
              <Link key={post.title} href={post.slug} className={className}>
                {cardContent}
              </Link>
            ) : (
              <div key={post.title} className={className}>
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Newsletter CTA */}
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-indigo-500/10 p-8 sm:p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Mail className="size-6 text-violet-400" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Stay in the loop</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Get the latest updates on AI course creation, tips from power users, and product launches delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-border/40 flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="you@example.com"
                className="bg-transparent flex-1 text-sm placeholder-muted-foreground/50 outline-none"
                disabled
              />
            </div>
            <button className="px-6 py-3 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 font-medium hover:bg-violet-500/30 transition-colors text-sm whitespace-nowrap" disabled>
              Subscribe
            </button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-4">No spam, unsubscribe anytime.</p>
        </div>
      </main>

      <footer className="relative border-t border-border/40 mt-20">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="/changelog" className="hover:text-foreground transition-colors">
              Changelog
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
