import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, BookOpen, Zap, Download, Key, Sparkles, Layers } from "lucide-react";
import { JsonLd, breadcrumbJsonLd, BREADCRUMBS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Documentation — AI Course Generator Guide",
  description:
    "Complete guide to Syllabi's AI course generator. Learn how to create courses, export to PDF & Notion, add audio narration, and customize your courses.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Documentation — Syllabi AI Course Generator",
    description:
      "Complete guide to creating AI-powered courses with Syllabi. Modules, lessons, quizzes, audio, and export options explained.",
    url: "https://www.syllabi.online/docs",
    siteName: "Syllabi",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Syllabi Documentation — AI Course Generator Guide",
    description:
      "Learn how to create complete courses with Syllabi's AI. Quick start, export formats, plans, and best practices.",
  },
};

const sections = [
  {
    icon: Zap,
    title: "Quick Start",
    anchor: "quick-start",
    content: [
      {
        heading: "Generate your first course",
        body: "Head to the homepage and fill in the course form. Enter a topic (e.g. \"Machine Learning for Beginners\"), select your target audience, choose a course length, and optionally add a niche or context. Click Generate and your full course will be ready in seconds.",
      },
      {
        heading: "What gets generated",
        body: "Each generation produces a complete course: title, description, learning objectives, modules (each with lessons, lesson content, key points, and objectives), multiple-choice quizzes, bonus resources, and a pacing schedule tailored to your audience.",
      },
    ],
  },
  {
    icon: Layers,
    title: "Course Structure",
    anchor: "structure",
    content: [
      {
        heading: "Modules",
        body: "A course is divided into modules — thematic units that group related lessons. Each module has a title, description, estimated duration, and learning objectives.",
      },
      {
        heading: "Lessons",
        body: "Each lesson includes a title, format (video, reading, interactive, discussion, or project), estimated duration, objectives, key points, and suggested external resources.",
      },
      {
        heading: "Quizzes",
        body: "Auto-generated multiple-choice quizzes are attached to modules. Each question includes four answer choices, the correct answer, and a plain-language explanation.",
      },
      {
        heading: "Pacing Schedules",
        body: "Syllabi generates a recommended pacing schedule for self-paced, cohort, instructor-led, or blended delivery. The schedule breaks the course into weekly blocks.",
      },
    ],
  },
  {
    icon: Download,
    title: "Exporting",
    anchor: "exporting",
    content: [
      {
        heading: "JSON Export",
        body: "Download the raw course data as a structured JSON file. This is useful for importing into your own LMS, processing programmatically, or building on top of the data.",
      },
      {
        heading: "Markdown Export",
        body: "Export your course as a well-formatted Markdown document. Paste it directly into Notion, GitHub, or any Markdown-compatible editor.",
      },
      {
        heading: "PDF Export",
        body: "Generate a clean, formatted PDF of the entire course — ideal for sharing with clients, students, or stakeholders who prefer a polished document.",
      },
      {
        heading: "Notion Export",
        body: "Copy your course as Notion-compatible blocks that you can paste directly into any Notion page. Modules, lessons, and quizzes all render as proper Notion blocks.",
      },
    ],
  },
  {
    icon: Key,
    title: "Plans & Limits",
    anchor: "plans",
    content: [
      {
        heading: "Free tier",
        body: "3 free mini-course generations. Includes modules, lessons, quizzes, and all export formats (JSON, Markdown, PDF, Notion). Shareable course links included. No credit card required.",
      },
      {
        heading: "Pro (€28/month)",
        body: "15 course generations/month. All course lengths and styles (crash to masterclass). Full content including quizzes, pacing schedules, and all export formats. Custom pacing and priority AI processing.",
      },
      {
        heading: "Pro Max (€69/month)",
        body: "Unlimited generations with AI-generated audio narration, full chapter content generation, premium Notion and PDF export, DOCX and SCORM export, white-label branding, and dedicated AI processing.",
      },
      {
        heading: "5-Pack (€33 one-time)",
        body: "5 Pro Max generations with audio, chapter content, and all export formats. No subscription required. Perfect for one-time projects.",
      },
    ],
  },
  {
    icon: BookOpen,
    title: "Tips & Best Practices",
    anchor: "tips",
    content: [
      {
        heading: "Be specific with your topic",
        body: "\"Python for Data Science\" generates a better course than just \"Python\". The more specific you are, the more targeted and actionable the output.",
      },
      {
        heading: "Set the right audience level",
        body: "Choosing Beginner, Intermediate, or Advanced affects the complexity of lessons, prerequisites assumed, and the depth of quiz questions.",
      },
      {
        heading: "Use the niche field",
        body: "The niche/context field tailors the course for a specific industry or use case. For example, entering \"healthcare\" for a \"Data Analysis\" course will include healthcare-specific examples.",
      },
      {
        heading: "Iterate quickly",
        body: "If the first generation isn't quite right, adjust one parameter and regenerate. Each generation is independent, so you can experiment freely.",
      },
    ],
  },
  {
    icon: Sparkles,
    title: "FAQ",
    anchor: "faq",
    content: [
      {
        heading: "Can I edit the generated course?",
        body: "Yes! After generating, open the Course Editor to rewrite titles, edit lesson content, add or remove quiz questions, reorder modules, and delete anything that doesn't fit.",
      },
      {
        heading: "How long does generation take?",
        body: "Most courses generate in 15–60 seconds depending on length. Full courses with 8+ modules take under 60 seconds.",
      },
      {
        heading: "Are my generations saved?",
        body: "Yes. All generations are saved to your account and accessible from your profile page at any time.",
      },
      {
        heading: "What AI model powers Syllabi?",
        body: "Syllabi uses Anthropic's Claude — one of the most capable language models available — with a carefully crafted course generation prompt.",
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMBS.docs)} />
      {/* Gradient background */}
      <div className="absolute inset-0 h-[500px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />
      
      {/* Dot pattern */}
      <div className="absolute inset-0 h-[500px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header border gradient */}
      <div className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10 relative">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
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

      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 flex gap-10 relative z-0">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
            {sections.map((s) => (
              <a
                key={s.anchor}
                href={`#${s.anchor}`}
                className="block text-sm text-muted-foreground hover:text-foreground hover:bg-violet-500/5 rounded-lg px-2.5 py-1.5 transition-all duration-200"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Resources</p>
            <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
              Documentation
            </h1>
            <p className="text-muted-foreground text-base">
              Everything you need to know about generating, exporting, and sharing your courses.
            </p>
          </div>

          <div className="space-y-14">
            {sections.map((section) => (
              <section key={section.anchor} id={section.anchor} className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-violet-500/10 border border-violet-500/20 shrink-0 shadow-lg shadow-violet-500/10 transition-all duration-200">
                    <section.icon className="size-5 text-violet-500" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <div className="rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm p-6 hover:border-violet-500/20 transition-all duration-300">
                  <div className="space-y-5">
                    {section.content.map((item, i) => (
                      <div key={i}>
                        <h3 className="font-semibold text-foreground mb-2">{item.heading}</h3>
                        <p className="text-sm text-foreground/70 leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>

      <footer className="border-t border-border/40 mt-16 relative z-0">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}