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
  title: "Syllabi - AI-Powered Course Generator | Create Custom Learning Plans",
  description:
    "Turn any topic into a full course in seconds. AI-generated modules, lessons, quizzes, pacing schedules & PDF export. Build better courses faster.",
  keywords: [
    "AI course generator",
    "course creator tool",
    "course design",
    "online course outline",
    "AI course builder",
    "syllabi",
    "course planner",
    "lesson plan generator",
    "learning plan",
    "educational AI",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Syllabi - AI-Powered Course Generator | Create Custom Learning Plans",
    description:
      "Turn any topic into a full course in seconds. AI-generated modules, lessons, quizzes, pacing schedules & PDF export.",
    type: "website",
    url: BASE_URL,
    siteName: "Syllabi",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Syllabi - AI-Powered Course Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syllabi - AI-Powered Course Generator | Create Custom Learning Plans",
    description:
      "Turn any topic into a full course in seconds. AI-generated modules, lessons, quizzes & PDF export.",
    images: ["/og.png"],
    creator: "@syllabi_ai",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
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
        "https://twitter.com/syllabi_ai",
        "https://github.com/syllabi-ai",
      ],
    },
    {
      "@type": "WebApplication",
      "@id": `${BASE_URL}/#webapp`,
      name: "Syllabi - AI Course Generator",
      description:
        "Turn any topic into a complete course in seconds. AI-generated modules, lessons, quizzes, pacing schedules, and PDF export.",
      url: BASE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Syllabi",
      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },
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
