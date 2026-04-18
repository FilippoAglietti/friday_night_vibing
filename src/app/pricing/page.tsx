import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PricingCards from "./PricingCards";

const BASE_URL = "https://www.syllabi.online";

export const metadata: Metadata = {
  title: "Pricing — Free, Planner, Masterclass, Enterprise | Syllabi AI Course Generator",
  description:
    "Simple pricing for the AI course generator. Free skeleton to start, Planner at €29/mo for 15 reviewed skeletons, Masterclass at €99/mo with polish + audio + white-label, Enterprise on request.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Syllabi Pricing — Free / Planner / Masterclass / Enterprise",
    description:
      "Free skeleton to start. €29/mo Planner. €99/mo Masterclass with audio + polish + white-label. Enterprise contact us.",
    url: `${BASE_URL}/pricing`,
    type: "website",
  },
};

function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Pricing",
            item: `${BASE_URL}/pricing`,
          },
        ],
      },
      {
        "@type": "Product",
        name: "Syllabi — AI Course Generator",
        description:
          "AI course generator that builds complete courses with modules, lessons, quizzes, and audio narration.",
        brand: { "@type": "Brand", name: "Syllabi" },
        offers: [
          {
            "@type": "Offer",
            name: "Free",
            price: "0",
            priceCurrency: "EUR",
            url: `${BASE_URL}/pricing`,
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Planner",
            price: "29",
            priceCurrency: "EUR",
            url: `${BASE_URL}/pricing`,
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Masterclass",
            price: "99",
            priceCurrency: "EUR",
            url: `${BASE_URL}/pricing`,
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Masterclass 5-Pack",
            price: "39",
            priceCurrency: "EUR",
            url: `${BASE_URL}/pricing`,
            availability: "https://schema.org/InStock",
          },
        ],
      },
    ],
  };
}

export default function PricingPage() {
  const jsonLd = buildJsonLd();

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        aria-hidden
        className="absolute inset-0 h-[500px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none"
      />

      <header className="relative border-b border-border/40 bg-background/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            ← Syllabi
          </Link>
          <Link
            href="/#generate"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Try it free
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-12 md:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground">Pricing</li>
          </ol>
        </nav>

        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500">
            Pricing
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl">
            Simple pricing. Real courses.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Start free, upgrade when you&apos;re ready. No trial, no credit card to
            get started.
          </p>
        </div>

        {/* Interactive cards with billing toggle — client component */}
        <PricingCards />

        <section className="mt-16 md:mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                No trial needed — the Free plan gives you 1 course skeleton per month
                with no credit card required.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes. You can cancel Planner or Masterclass from your profile at any
                time. You keep access until the end of the billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Is annual billing cheaper?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes — annual billing saves you 2 months. Planner drops to €24/mo
                (€290/year) and Masterclass drops to €82/mo (€990/year). You&apos;re
                charged once for the full year.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                What&apos;s the difference between a skeleton and a full course?
              </h3>
              <p className="text-sm text-muted-foreground">
                A skeleton includes lesson titles, learning objectives, pacing, and
                structure — but not full lesson bodies. Planner gives you best-in-class
                skeletons; Masterclass generates the complete lesson content too.
                Planner users can unlock bodies for any skeleton at €5 on demand.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                What&apos;s the 5-Pack and when should I pick it?
              </h3>
              <p className="text-sm text-muted-foreground">
                The 5-Pack is a one-time purchase of 5 Masterclass generations — ideal
                if you have a short list of courses to build and don&apos;t want a
                subscription. You have 90 days to use them, and get €20 off a
                Masterclass subscription if you upgrade within 30 days.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                What does AI audio narration include?
              </h3>
              <p className="text-sm text-muted-foreground">
                Masterclass uses ElevenLabs to generate natural-sounding narration for
                every lesson in your course, so you can listen while you learn or share
                audio-first experiences.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-16 text-center">
          <Link
            href="/#generate"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white h-12 px-8 text-sm font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02]"
          >
            Create your first course free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
