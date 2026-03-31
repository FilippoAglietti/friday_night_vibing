import type { Metadata } from "next";
import { GraduationCap, ArrowLeft, BookOpen, Zap, Download, Key, Sparkles, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation — Syllabi.ai",
  description: "Learn how to use Syllabi.ai to generate AI-powered course curricula.",
};

const sections = [
  {
    icon: Zap,
    title: "Quick Start",
    anchor: "quick-start",
    content: [
      {
        heading: "Generate your first course",
        body: "Head to the homepage and fill in the course form. Enter a topic (e.g. \"Machine Learning for Beginners\"), select your target audience, choose a course length, and optionally add a niche or context. Click Generate and your full curriculum will be ready in seconds.",
      },
      {
        heading: "What gets generated",
        body: "Each generation produces a complete curriculum: course title, description, learning objectives, modules (each with lessons, lesson content, key points, and objectives), multiple-choice quizzes, bonus resources, and a pacing schedule tailored to your audience.",
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
        body: "Download the raw curriculum as a structured JSON file. This is useful for importing into your own LMS, processing programmatically, or building on top of the data.",
      },
      {
        heading: "Markdown Export",
        body: "Export the curriculum as a well-formatted Markdown document. Paste it directly into Notion, GitHub, or any Markdown-compatible editor.",
      },
      {
        heading: "PDF Export",
        body: "Generate a clean, formatted PDF of the entire curriculum — ideal for sharing with clients, students, or stakeholders who prefer a polished document.",
      },
      {
        heading: "Notion Export",
        body: "Copy the curriculum as Notion-compatible blocks that you can paste directly into any Notion page. Modules, lessons, and quizzes all render as proper Notion blocks.",
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
        body: "Generate 1 mini-course at no cost. Exports are limited to JSON. No credit card required.",
      },
      {
        heading: "Pro ($29/month)",
        body: "Unlimited course generations. Full content including quizzes, pacing schedules, and all export formats (JSON, Markdown, PDF, Notion). Custom pacing and priority AI processing.",
      },
      {
        heading: "5-Pack ($39 one-time)",
        body: "5 full course generations with no recurring subscription. All export formats included.",
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
        body: "\"Python for Data Science\" generates a better curriculum than just \"Python\". The more specific you are, the more targeted and actionable the output.",
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
        heading: "Can I edit the generated curriculum?",
        body: "Currently, Syllabi generates complete curricula that you export and edit in your preferred tool. In-app editing is on our roadmap.",
      },
      {
        heading: "How long does generation take?",
        body: "Most courses generate in 10–30 seconds, depending on course length and server load.",
      },
      {
        heading: "Are my generations saved?",
        body: "Yes. All generations are saved to your account and accessible from your profile page at any time.",
      },
      {
        heading: "What AI model powers Syllabi?",
        body: "Syllabi uses Anthropic's Claude — one of the most capable language models available — with a carefully crafted curriculum generation prompt.",
      },
    ],
  },
];

export default function DocsPage() {
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

      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
            {sections.map((s) => (
              <a
                key={s.anchor}
                href={`#${s.anchor}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Resources</p>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
            <p className="text-muted-foreground text-base">
              Everything you need to know about generating, exporting, and using Syllabi.ai curricula.
            </p>
          </div>

          <div className="space-y-14">
            {sections.map((section) => (
              <section key={section.anchor} id={section.anchor}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center size-9 rounded-lg bg-violet-500/10 border border-violet-500/20 shrink-0">
                    <section.icon className="size-4 text-violet-500" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <div className="space-y-5 pl-12">
                  {section.content.map((item, i) => (
                    <div key={i}>
                      <h3 className="font-semibold text-foreground mb-1">{item.heading}</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>

      <footer className="border-t border-border/40 mt-8">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/support" className="hover:text-foreground transition-colors">Support</a>
            <a href="/changelog" className="hover:text-foreground transition-colors">Changelog</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
