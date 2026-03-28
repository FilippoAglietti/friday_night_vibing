import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Syllabi — AI Curriculum Generator for Course Creators",
  description:
    "Turn any topic into a complete course curriculum in seconds. AI-powered curriculum design for course creators, educators, and coaches. Stop staring at blank outlines.",
  keywords: [
    "AI curriculum generator",
    "course creator tool",
    "curriculum design",
    "online course outline",
    "AI course builder",
  ],
  openGraph: {
    title: "Syllabi — AI Curriculum Generator",
    description:
      "Turn any topic into a complete course curriculum in seconds.",
    type: "website",
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
      </body>
    </html>
  );
}
