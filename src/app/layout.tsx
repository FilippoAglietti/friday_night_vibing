import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Syllabi.ai — AI Course Generator for Course Creators",
  description:
    "Turn any topic into a complete course in seconds. Modules, lessons, quizzes, pacing schedules, and PDF export — powered by AI. Stop staring at blank outlines.",
  keywords: [
    "AI course generator",
    "course creator tool",
    "course design",
    "online course outline",
    "AI course builder",
    "syllabi",
    "course planner",
    "lesson plan generator",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Syllabi.ai — AI Course Generator",
    description:
      "Turn any topic into a complete course in seconds. Modules, lessons, quizzes & PDF export.",
    type: "website",
    siteName: "Syllabi.ai",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Syllabi.ai — AI Course Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syllabi.ai — AI Course Generator",
    description:
      "Turn any topic into a complete course in seconds.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>{children}</ToastProvider>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
