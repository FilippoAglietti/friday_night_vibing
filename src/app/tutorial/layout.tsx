import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutorial | Syllabi - Learn to Build Courses with AI",
  description:
    "Learn how to use Syllabi to generate complete AI-powered courses in minutes. Step-by-step tutorial for course creators.",
  alternates: {
    canonical: "/tutorial",
  },
  openGraph: {
    title: "Tutorial | Syllabi - Learn to Build Courses with AI",
    description:
      "Learn how to use Syllabi to generate complete AI-powered courses in minutes. Step-by-step tutorial for course creators.",
    url: "https://www.syllabi.online/tutorial",
    siteName: "Syllabi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tutorial | Syllabi - Learn to Build Courses with AI",
    description:
      "Learn how to use Syllabi to generate complete AI-powered courses in minutes. Step-by-step tutorial for course creators.",
  },
};

export default function TutorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
