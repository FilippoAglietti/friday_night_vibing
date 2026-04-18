import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowLeft, ChevronDown, Mail, MessageCircle, BookOpen, Search } from "lucide-react";
import { JsonLd, breadcrumbJsonLd, BREADCRUMBS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Support & FAQ — Help with AI Course Generator",
  description:
    "Get help with Syllabi's AI course generator. FAQ on generating courses, exporting to PDF, billing plans, and troubleshooting.",
  alternates: { canonical: "/support" },
  openGraph: {
    title: "Syllabi Support — Help & FAQ",
    description: "Frequently asked questions and support for Syllabi's AI course generator.",
    url: "https://www.syllabi.online/support",
    siteName: "Syllabi",
    type: "website",
  },
};

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "Do I need a credit card to try Syllabi?",
        a: "No. The free tier gives you 3 free mini-course generations with no credit card required. Just create an account and start generating.",
      },
      {
        q: "How do I create an account?",
        a: "Click the Sign In button on the homepage and use Google OAuth — it's the quickest way. You can also sign up with your email address.",
      },
      {
        q: "What should I type into the course topic field?",
        a: "Be specific. Instead of \"Photography\", try \"Portrait Photography for Beginners\" or \"Food Photography for Instagram\". A clear topic produces a tighter, more actionable course.",
      },
      {
        q: "Can I edit my course after generating?",
        a: "Yes! Open the Course Editor to rewrite titles, edit lesson content, add or remove quiz questions, reorder modules, and delete anything that doesn't fit. Every element is fully editable.",
      },
    ],
  },
  {
    category: "Generating Courses",
    questions: [
      {
        q: "How long does generation take?",
        a: "Most courses are ready in 15–30 seconds. Longer courses (30+ lessons) may take up to 60 seconds. If a generation fails, try again — timeouts are rare.",
      },
      {
        q: "Why does my generation sometimes look different from my last one?",
        a: "AI generation has some inherent variability — this is by design. Each run produces a fresh, unique course. If you want to explore different structures for the same topic, try generating multiple times.",
      },
      {
        q: "Can I adjust the number of modules or lessons?",
        a: "After generation, open the Course Editor to reorder, add, or remove modules. You can also adjust course length before generating (mini, standard, or comprehensive).",
      },
      {
        q: "What does the 'niche' field do?",
        a: "It scopes your course to a specific industry or context. For example, 'Data Analysis' + niche 'healthcare' produces a course with healthcare data examples and use cases, rather than generic ones.",
      },
    ],
  },
  {
    category: "Exports",
    questions: [
      {
        q: "Which export formats are available?",
        a: "All plans include JSON, Markdown, PDF, and Notion export. Masterclass adds AI-generated audio narration, PPTX and DOCX exports, white-label branding, and shareable course links with email capture. The Notion export copies blocks you can paste directly into any Notion page.",
      },
      {
        q: "Can I re-export a course I generated earlier?",
        a: "Yes. All generations are saved to your account. Visit your profile page, find the course, and re-export in any available format.",
      },
      {
        q: "My PDF looks broken — what should I do?",
        a: "Try refreshing the page and exporting again. If the issue persists, contact support with your course title and a screenshot of the problem.",
      },
    ],
  },
  {
    category: "Billing & Plans",
    questions: [
      {
        q: "How do I cancel my Planner or Masterclass subscription?",
        a: "Log in, go to your profile, and click Manage Subscription. You'll be redirected to the Stripe billing portal where you can cancel. Your access continues until the end of the paid period.",
      },
      {
        q: "Can I get a refund?",
        a: "Monthly subscription charges are non-refundable for past periods. If you cancel within 24 hours of your first subscription charge and haven't used any generations, contact us and we'll consider a courtesy refund.",
      },
      {
        q: "What's the difference between Planner and the 5-Pack?",
        a: "Planner (€29/month) gives you 15 reviewed course skeletons per month — ideal if you create courses regularly. The 5-Pack (€39 one-time) gives you 5 full Masterclass generations with no recurring charges — ideal if you just need a few courses.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All payments are processed by Stripe — we never store your card details. Stripe is PCI DSS Level 1 certified, the highest level of payment security.",
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        q: "Which browsers are supported?",
        a: "Syllabi works in all modern browsers: Chrome, Firefox, Safari, and Edge. We recommend keeping your browser up to date for the best experience.",
      },
      {
        q: "Is there an API?",
        a: "A public API is on our roadmap. If you're interested in early access, reach out to us at api@syllabi.online.",
      },
      {
        q: "Are my generations private?",
        a: "Yes. Your generated courses are private to your account and not visible to other users or shared publicly.",
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMBS.support)} />
      {/* Gradient background */}
      <div className="absolute inset-0 -top-40 h-[600px] bg-gradient-to-b from-violet-600/10 via-indigo-600/5 to-transparent pointer-events-none" />
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Header */}
      <header className="border-b border-gradient-to-r from-violet-500/20 via-indigo-500/20 to-transparent bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between relative z-20">
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

      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16 relative z-20">
        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Help Center</p>
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Support
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Find answers to common questions, or reach out to our team directly.
          </p>

          {/* Search bar visual */}
          <div className="relative max-w-md mx-auto mb-10 mt-8">
            <Search className="absolute left-4 top-3 size-4 text-muted-foreground/50" />
            <div className="w-full h-11 rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm pl-11 pr-4 flex items-center text-sm text-muted-foreground/40">
              Search for help...
            </div>
          </div>
        </div>

        {/* Contact cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-14">
          <a
            href="mailto:support@syllabi.online"
            className="flex flex-col items-center text-center gap-3 rounded-2xl border border-border/40 bg-card/10 backdrop-blur-sm p-6 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors">
              <Mail className="size-5 text-violet-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Email Support</p>
              <p className="text-xs text-muted-foreground mt-1">support@syllabi.online</p>
            </div>
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScHZQ9cSmQwUnDnHiSPSFaRyeS1Ijh4jbnueFAJ4fdedQZdfA/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-center gap-3 rounded-2xl border border-border/40 bg-card/10 backdrop-blur-sm p-6 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors">
              <MessageCircle className="size-5 text-violet-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Send Feedback</p>
              <p className="text-xs text-muted-foreground mt-1">Feature requests & ideas</p>
            </div>
          </a>
          <Link
            href="/docs"
            className="flex flex-col items-center text-center gap-3 rounded-2xl border border-border/40 bg-card/10 backdrop-blur-sm p-6 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors">
              <BookOpen className="size-5 text-violet-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Documentation</p>
              <p className="text-xs text-muted-foreground mt-1">Guides & reference</p>
            </div>
          </Link>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>

          <div className="space-y-10">
            {faqs.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-4 border-l-2 border-violet-500/40 pl-3">
                  {section.category}
                </h3>
                <div className="space-y-3">
                  {section.questions.map((item, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm overflow-hidden hover:border-violet-500/20 transition-colors"
                    >
                      <summary className="flex items-center justify-between gap-4 cursor-pointer select-none px-5 py-4 text-sm font-medium hover:text-violet-300 transition-colors list-none">
                        {item.q}
                        <ChevronDown className="size-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div className="mt-14 rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-indigo-500/5 p-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/5 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <h3 className="text-lg font-semibold mb-2 relative z-10">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto relative z-10">
            Our team typically responds within one business day.
          </p>
          <a
            href="mailto:support@syllabi.online"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:shadow-xl transition-all hover:scale-[1.02] relative z-10"
          >
            <Mail className="size-4" />
            Email us
          </a>
        </div>
      </main>

      <footer className="border-t border-border/40 mt-16 relative z-20">
        <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
