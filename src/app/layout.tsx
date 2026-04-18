import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import CookieConsent from "@/components/CookieConsent";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://www.syllabi.online";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Syllabi — The AI Course Generator Worth Listening To",
    template: "%s | Syllabi",
  },
  description:
    "The AI course generator that builds complete courses with NotebookLM podcast export, beautiful design, quizzes, and PDF export. Free to start — no credit card required.",
  keywords: [
    "AI course generator",
    "AI course creator",
    "AI syllabus generator",
    "online course builder",
    "course outline generator",
    "AI lesson plan generator",
    "course design tool",
    "course structure generator",
    "AI course maker",
    "create online course",
    "course creation platform",
    "AI education tool",
    "syllabi generator",
    "course planner AI",
    "automated course builder",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "it": "/?lang=it",
      "es": "/?lang=es",
      "fr": "/?lang=fr",
      "de": "/?lang=de",
      "pt": "/?lang=pt",
      "ja": "/?lang=ja",
      "ar": "/?lang=ar",
      "nl": "/?lang=nl",
      "hi": "/?lang=hi",
      "ru": "/?lang=ru",
      "tr": "/?lang=tr",
      "sv": "/?lang=sv",
      "ko": "/?lang=ko",
      "zh": "/?lang=zh",
      "pl": "/?lang=pl",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "Syllabi — The AI Course Generator Worth Listening To",
    description:
      "Generate complete online courses with AI — modules, lessons, quizzes, NotebookLM podcast export & PDF. Used by educators, coaches, and course creators worldwide.",
    type: "website",
    url: BASE_URL,
    siteName: "Syllabi",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Syllabi — AI Course Generator: Create full courses with NotebookLM podcast export, quizzes, and beautiful design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syllabi — The AI Course Generator Worth Listening To",
    description:
      "Generate complete courses with AI — NotebookLM podcast export, quizzes, modules & PDF. Free to start.",
    images: ["/og.png"],
    site: "@syllabi_online",
    creator: "@syllabi_online",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  category: "education",
  other: {
    "application/rss+xml": "/feed.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a1a1a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // ── Organization ──
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Syllabi",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/favicon.svg`,
      },
      sameAs: [
        "https://twitter.com/syllabi_online",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@syllabi.online",
        contactType: "customer support",
        availableLanguage: ["English", "Italian", "Spanish", "French", "German", "Portuguese", "Japanese", "Arabic", "Dutch", "Hindi", "Russian", "Turkish", "Swedish", "Korean", "Chinese", "Polish"],
      },
    },
    // ── WebSite (enables sitelinks search box) ──
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Syllabi",
      description: "AI-powered course generator — create full online courses with NotebookLM podcast export, quizzes, and PDF export.",
      publisher: { "@id": `${BASE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/?topic={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    // ── SoftwareApplication (rich snippet for apps) ──
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#app`,
      name: "Syllabi — AI Course Generator",
      description: "Generate complete online courses with AI — modules, lessons, quizzes, pacing schedules, NotebookLM-ready podcast export, and output to PDF, Notion, DOCX, and SCORM.",
      url: BASE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires a modern web browser",
      softwareVersion: "1.5.0",
      publisher: { "@id": `${BASE_URL}/#organization` },
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/pricing`,
          description: "3 free mini-course generations with JSON export",
        },
        {
          "@type": "Offer",
          name: "Planner",
          price: "29",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/pricing`,
          description: "15 reviewed skeletons/month, all export formats, custom pacing, priority AI",
        },
        {
          "@type": "Offer",
          name: "Masterclass 5-Pack",
          price: "39",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/pricing`,
          description: "5 full Masterclass course generations, no subscription required",
        },
        {
          "@type": "Offer",
          name: "Masterclass",
          price: "99",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/pricing`,
          description: "20 full courses/month, NotebookLM podcast export, white-label, polish + review",
        },
      ],
      featureList: "AI Course Generation, NotebookLM Podcast Export, PDF Export, Notion Export, DOCX Export, SCORM Export, Quizzes, Pacing Schedules, 16 Languages, Shareable Links",
      screenshot: `${BASE_URL}/og.png`,
    },
    // ── HowTo (for "how to create a course" rich snippets) ──
    {
      "@type": "HowTo",
      "@id": `${BASE_URL}/#howto`,
      name: "How to Create an Online Course with AI",
      description: "Generate a complete, professional online course with Syllabi's AI course generator — modules, lessons, quizzes, NotebookLM podcast export, and a shareable link.",
      tool: { "@type": "HowToTool", name: "Syllabi AI Course Generator" },
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Choose Your Topic",
          text: "Enter any topic — from Python programming to yoga instruction. Add an optional niche or context to focus the course.",
          url: `${BASE_URL}/#form`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Set Your Audience Level",
          text: "Select beginner, intermediate, or advanced to calibrate the depth, prerequisites, and complexity of the generated course.",
          url: `${BASE_URL}/#form`,
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Generate with AI",
          text: "Click Generate and Syllabi's AI creates a full course: modules, lessons, quizzes, learning objectives, and pacing schedules — with a live progress loader throughout.",
          url: `${BASE_URL}/#form`,
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Edit and Customize",
          text: "Use the built-in Course Editor to rewrite titles, edit content, reorder modules, add quizzes, and personalize every element.",
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Export for NotebookLM",
          text: "Masterclass subscribers can export any course as NotebookLM-ready Markdown. Drop it into Google NotebookLM to generate a two-host conversational podcast on demand.",
        },
        {
          "@type": "HowToStep",
          position: 6,
          name: "Export and Share",
          text: "Download as PDF, Notion, DOCX, or SCORM. Share via a beautiful public link with email capture for lead generation.",
        },
      ],
    },
    // ── FAQPage (for FAQ rich snippets in search) ──
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Syllabi?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Syllabi is an AI-powered course generator that creates complete online courses — including modules, lessons, quizzes, NotebookLM-ready podcast export, and pacing schedules — from a single topic. It's used by educators, coaches, and course creators worldwide.",
          },
        },
        {
          "@type": "Question",
          name: "Is Syllabi free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Syllabi offers 1 free course skeleton per month with no credit card required. Paid plans start at €29/month for Planner (15 reviewed skeletons, all export formats) and €99/month for Masterclass (20 full courses/month, NotebookLM podcast export, polish + white-label).",
          },
        },
        {
          "@type": "Question",
          name: "What export formats does Syllabi support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Syllabi supports JSON, Markdown, PDF, Notion, DOCX, and SCORM export formats. Free users get PDF / Notion / Markdown export. Planner and Masterclass users get all formats plus shareable course links.",
          },
        },
        {
          "@type": "Question",
          name: "Can I edit the generated course?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. After generating, open the Course Editor to rewrite titles, edit lesson content, add or remove quiz questions, reorder modules, and delete anything that doesn't fit. Every element is fully editable.",
          },
        },
        {
          "@type": "Question",
          name: "What AI model powers Syllabi?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Syllabi uses Anthropic's Claude — one of the most capable language models available — with carefully crafted prompts that are topic-aware and audience-calibrated for professional course output.",
          },
        },
        {
          "@type": "Question",
          name: "How long does course generation take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Generation time depends on course length. Short courses are ready in a few minutes; masterclass courses can take around ten minutes. A live progress loader runs throughout so you always know where you stand.",
          },
        },
        {
          "@type": "Question",
          name: "Does Syllabi support multiple languages?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Syllabi supports 16 languages including English, Italian, Spanish, French, German, Portuguese, Japanese, Arabic, Dutch, Hindi, Russian, Turkish, Swedish, Korean, Chinese, and Polish.",
          },
        },
        {
          "@type": "Question",
          name: "Can I export my course as a podcast?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — Masterclass tier includes a one-click NotebookLM-ready Markdown export. Drop the file into Google NotebookLM to generate a two-host conversational podcast of your course on demand. No TTS bills, better output than per-lesson narration.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
      style={{ background: "#1a1a1a" }}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://gmxseuttpurnxbluvcwx.supabase.co" />
        <link rel="dns-prefetch" href="https://gmxseuttpurnxbluvcwx.supabase.co" />
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
