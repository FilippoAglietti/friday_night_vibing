import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Syllabi",
  description:
    "Manage your Syllabi account, view your generated courses, and control your subscription settings.",
  alternates: {
    canonical: "/profile",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
