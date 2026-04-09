import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Syllabi",
  description:
    "Get in touch with the Syllabi team. We're here to help with questions about our AI-powered course generator.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Syllabi",
    description:
      "Get in touch with the Syllabi team. We're here to help with questions about our AI-powered course generator.",
    url: "https://www.syllabi.online/contact",
    siteName: "Syllabi",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact Us | Syllabi",
    description:
      "Get in touch with the Syllabi team. We're here to help with questions about our AI-powered course generator.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
