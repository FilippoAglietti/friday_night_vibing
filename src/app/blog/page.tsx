import type { Metadata } from "next";
import { GraduationCap, ArrowLeft, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Syllabi.ai",
  description: "Insights, tips, and updates from the Syllabi.ai team on AI-powered course creation.",
};

const posts = [
  {
    slug: "#",
    category: "Product",
    date: "March 28, 2026",
    readTime: "4 min read",
    title: "Introducing Notion Export: Paste Your Course Directly into Notion",
    excerpt:
      "We're excited to launch Notion export — your entire curriculum, formatted as Notion blocks, ready to paste in one click. No more manual reformatting.",
    accent: "text-violet-400",
  },
  {
    slug: "#",
    category: "Guide",
    date: "March 20, 2026",
    readTime: "6 min read",
    title: "How to Write Better Course Prompts: 7 Tips from Our Power Users",
    excerpt:
      "The quality of your AI-generated curriculum depends heavily on what you put in. Here are seven proven strategies our top users use to get outstanding results.",
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
    title: "From Syllabus to Sale: Packaging Your Syllabi.ai Course for Platforms",
    excerpt:
      "You've generated a great curriculum. Now what? A step-by-step guide to turning your Syllabi output into a sellable product on Teachable, Kajabi, or your own site.",
    accent: "text-amber-400",
  },
  {
    slug: "#",
    category: "Product",
    date: "February 24, 2026",
    readTime: "3 min read",
    title: "PDF Export Is Here — Print-Ready Curricula in One Click",
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
      "We studied 500 highly-rated online courses across categories to find common structural patterns. The results shaped how Syllabi generates curricula.",
    accent: "text-cyan-400",
  },
];

const categories = ["All", "Product", "Guide", "Insights"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.ai</span></span>
          </a>
          <a href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Resources</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
          <p className="text-muted-foreground text-base max-w-xl">
            Tips, guides, and updates for course creators building with AI.
          </p>
        </div>

        {/* Category filter — static display */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {categories.map((cat, i) => (
            <span
              key={cat}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                i === 0
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-card/50 text-muted-foreground border border-border/50 hover:text-foreground"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Posts grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="group flex flex-col rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-border transition-colors"
            >
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
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground px-2 py-1 rounded bg-muted/50">
                  Coming Soon
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/40 mt-16">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/docs" className="hover:text-foreground transition-colors">Docs</a>
            <a href="/changelog" className="hover:text-foreground transition-colors">Changelog</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
