import type { Metadata } from "next";
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
    default: "Syllabi — #1 AI Course Generator | Create Full Courses in Seconds",
    template: "%s | Syllabi",
  },
  description:
    "The AI course generator that builds complete courses with audio narration, modules, lessons, quizzes, and PDF export. Create professional online courses in 60 seconds — free to start.",
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
    title: "Syllabi — #1 AI Course Generator | Full Courses in 60 Seconds",
    description:
      "Generate complete online courses with AI — modules, lessons, quizzes, audio narration & PDF export. Used by educators, coaches, and course creators worldwide.",
    type: "website",
    url: BASE_URL,
    siteName: "Syllabi",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Syllabi — AI Course Generator: Create full courses with audio, quizzes, and beautiful design in seconds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syllabi — AI Course Generator | Full Courses in 60 Seconds",
    description:
      "Generate complete courses with AI — audio narration, quizzes, modules & PDF export. Free to start.",
    images: ["/og.png"],
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
      description: "AI-powered course generator — create full online courses with audio, quizzes, and PDF export in seconds.",
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
      description: "Generate complete online courses with AI-powered audio narration, modules, lessons, quizzes, pacing schedules, and export to PDF, Notion, PPTX, and DOCX.",
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
          name: "Pro",
          price: "28",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/pricing`,
          description: "15 generations/month, all export formats, custom pacing, priority AI",
        },
        {
          "@type": "Offer",
          name: "5-Pack",
          price: "33",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/pricing`,
          description: "5 full course generations with all features, one-time purchase",
        },
        {
          "@type": "Offer",
          name: "Pro Max",
          price: "69",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/pricing`,
          description: "Unlimited generations, AI audio narration, white-label, shareable links",
        },
      ],
      featureList: "AI Course Generation, Audio Narration, PDF Export, Notion Export, PPTX Export, Quizzes, Pacing Schedules, 16 Languages, Shareable Links",
      screenshot: `${BASE_URL}/og.png`,
    },
    // ── HowTo (for "how to create a course" rich snippets) ──
    {
      "@type": "HowTo",
      "@id": `${BASE_URL}/#howto`,
      name: "How to Create an Online Course with AI",
      description: "Generate a complete, professional online course in under 60 seconds using Syllabi's AI course generator.",
      totalTime: "PT1M",
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
          text: "Click Generate and Syllabi's AI creates a full course: modules, lessons, quizzes, learning objectives, and pacing schedules in 15–60 seconds.",
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
          name: "Add Audio Narration",
          text: "Pro Max users can generate professional AI voice narration for every lesson, turning the course into podcast-style content.",
        },
        {
          "@type": "HowToStep",
          position: 6,
          name: "Export and Share",
          text: "Download as PDF, Notion, PPTX, or DOCX. Share via a beautiful public link with email capture for lead generation.",
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
            text: "Syllabi is an AI-powered course generator that creates complete online courses — including modules, lessons, quizzes, audio narration, and pacing schedules — from a single topic in under 60 seconds. It's used by educators, coaches, and course creators worldwide.",
          },
        },
        {
          "@type": "Question",
          name: "Is Syllabi free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Syllabi offers 3 free mini-course generations with no credit card required. Paid plans start at €28/month for Pro (15 generations, all export formats) and €69/month for Pro Max (unlimited generations, AI audio narration, shareable links).",
          },
        },
        {
          "@type": "Question",
          name: "What export formats does Syllabi support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Syllabi supports JSON, Markdown, PDF, Notion, PPTX, and DOCX export formats. Free users get JSON export. Pro and Pro Max users get all formats plus shareable course links.",
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
            text: "Most courses generate in 15–60 seconds depending on length. Mini courses are ready in under 15 seconds, while full courses with 8+ modules take up to 60 seconds.",
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
          name: "Can I generate courses with audio narration?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Pro Max subscribers can generate professional AI voice narration for every lesson in their courses, effectively turning each course into podcast-style content that students can listen to on the go.",
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
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
      <body className="min-h-full flex flex-col font-sans">
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
