import type { Metadata } from "next";
import QuickCourseClient from "./quick-client";

export const metadata: Metadata = {
  title: "Course in a Tweet — Instant Course Outline",
  description:
    "Type any topic and get a shareable one-screen course outline in seconds. No signup needed. Screenshot it, share it, and impress your audience.",
  alternates: { canonical: "/quick" },
  openGraph: {
    title: "Course in a Tweet — Instant Course Outline by Syllabi",
    description:
      "Type a topic, get a shareable course outline in seconds. No signup needed.",
    url: "https://www.syllabi.online/quick",
    siteName: "Syllabi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Course in a Tweet",
    description: "Type any topic and get a shareable one-screen course outline in seconds.",
  },
};

export default function QuickCoursePage() {
  return <QuickCourseClient />;
}
