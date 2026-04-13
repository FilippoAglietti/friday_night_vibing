import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Flame, Crown, Headphones, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE_URL = "https://www.syllabi.online";

export const metadata: Metadata = {
  title: "Pricing — Free, Pro, Pro Max | Syllabi AI Course Generator",
  description:
    "Simple pricing for the AI course generator. Free to start (3 courses), Pro at €28/mo, Pro Max at €69/mo with AI audio narration, and a one-time 5-pack. No trial required.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Syllabi Pricing — Free, Pro, Pro Max",
    description:
      "Free to start, €28/mo Pro, €69/mo Pro Max with AI audio narration, plus a one-time 5-pack.",
    url: `${BASE_URL}/pricing`,
    type: "website",
  },
};

type Plan = {
  id: string;
  name: string;
  eyebrow: string;
  price: string;
  unit: string;
  strikethrough?: string;
  saveLabel?: string;
  description: string;
  features: { included: boolean; label: string }[];
  cta: string;
  ctaHref: string;
  highlight?: "popular" | "best" | "onetime";
  accent: "muted" | "violet" | "amber";
  icon?: "crown" | null;
  audioHighlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    eyebrow: "Free",
    price: "€0",
    unit: "forever",
    description: "Create 3 mini-courses free. No card required.",
    features: [
      { included: true, label: "3 courses total" },
      { included: true, label: "Up to 4 modules per course" },
      { included: true, label: "Text lessons + basic quizzes" },
      { included: true, label: "PDF export (watermarked)" },
      { included: false, label: "AI audio narration" },
      { included: false, label: "Unlimited courses" },
    ],
    cta: "Get started free",
    ctaHref: "/#generate",
    accent: "muted",
  },
  {
    id: "pro",
    name: "Pro",
    eyebrow: "Pro",
    price: "€28",
    unit: "/month",
    strikethrough: "€35/mo",
    saveLabel: "Save 20%",
    description: "For creators and educators shipping real courses.",
    features: [
      { included: true, label: "Unlimited courses" },
      { included: true, label: "Up to 10 modules per course" },
      { included: true, label: "Full quizzes + flashcards" },
      { included: true, label: "Clean PDF export (no watermark)" },
      { included: true, label: "Priority generation" },
      { included: true, label: "Email support" },
    ],
    cta: "Start Pro",
    ctaHref: "/#pricing",
    highlight: "popular",
    accent: "violet",
  },
  {
    id: "5pack",
    name: "Pro Max · 5-Pack",
    eyebrow: "Pro Max · 5-Pack",
    price: "€33",
    unit: " one-time",
    strikethrough: "€42",
    saveLabel: "Save 21%",
    description: "Five Pro Max courses, no subscription.",
    features: [
      { included: true, label: "5 Pro Max courses" },
      { included: true, label: "AI audio narration included" },
      { included: true, label: "Up to 15 modules per course" },
      { included: true, label: "Full quizzes + flashcards" },
      { included: true, label: "Clean PDF export" },
      { included: true, label: "Courses never expire" },
    ],
    cta: "Try Pro Max",
    ctaHref: "/#pricing",
    highlight: "onetime",
    accent: "amber",
    icon: "crown",
  },
  {
    id: "promax",
    name: "Pro Max",
    eyebrow: "Pro Max",
    price: "€69",
    unit: "/month",
    strikethrough: "€79/mo",
    saveLabel: "Save 13%",
    description: "The full Syllabi experience — audio, depth, priority.",
    features: [
      { included: true, label: "Everything in Pro" },
      { included: true, label: "AI audio narration on every lesson" },
      { included: true, label: "Up to 15 modules per course" },
      { included: true, label: "Priority queue" },
      { included: true, label: "Priority email support" },
      { included: true, label: "Early access to new features" },
    ],
    cta: "Go Pro Max",
    ctaHref: "/#pricing",
    highlight: "best",
    accent: "amber",
    icon: "crown",
    audioHighlight: true,
  },
];

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
            name: "Pro",
            price: "28",
            priceCurrency: "EUR",
            url: `${BASE_URL}/pricing`,
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Pro Max 5-Pack",
            price: "33",
            priceCurrency: "EUR",
            url: `${BASE_URL}/pricing`,
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Pro Max",
            price: "69",
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
          <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-rose-500/25 bg-gradient-to-r from-rose-500/10 via-violet-500/5 to-amber-500/10 px-5 py-2.5 backdrop-blur-sm shadow-lg shadow-rose-500/5">
            <Flame className="size-4 text-rose-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-rose-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
              Launch special — save up to 21%
            </span>
            <Flame className="size-4 text-rose-400 shrink-0" />
          </div>
        </div>

        <div className="grid gap-6 xl:gap-8 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {PLANS.map((plan) => {
            const borderClass =
              plan.accent === "violet"
                ? "border-violet-500/30 shadow-xl shadow-violet-500/5"
                : plan.accent === "amber"
                ? plan.highlight === "best"
                  ? "border-amber-500/30 shadow-xl shadow-amber-500/5 bg-gradient-to-b from-amber-500/5 via-card/50 to-card/50"
                  : "border-amber-500/20 bg-gradient-to-b from-amber-500/[0.03] via-card/50 to-card/50"
                : "border-border/50";
            const eyebrowClass =
              plan.accent === "violet"
                ? "text-violet-500"
                : plan.accent === "amber"
                ? "text-amber-500"
                : "text-muted-foreground";
            const checkClass =
              plan.accent === "violet"
                ? "text-violet-500"
                : plan.accent === "amber"
                ? plan.highlight === "onetime"
                  ? "text-amber-400"
                  : "text-amber-500"
                : "text-emerald-500";
            const ctaClass =
              plan.accent === "violet"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
                : plan.accent === "amber"
                ? plan.highlight === "onetime"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
                : "border border-border/60 hover:bg-muted/30";

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col w-full overflow-visible bg-card/50 backdrop-blur-sm ${borderClass}`}
              >
                {plan.highlight === "popular" && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white border-0 shadow-lg shadow-violet-500/25">
                      Most popular
                    </Badge>
                  </div>
                )}
                {plan.highlight === "best" && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white border-0 shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                      <Crown className="size-3" />
                      Best value
                    </Badge>
                  </div>
                )}
                {plan.highlight === "onetime" && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white border-0 shadow-lg shadow-amber-500/30">
                      One-time
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-8">
                  <CardDescription
                    className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${eyebrowClass}`}
                  >
                    {plan.icon === "crown" && <Crown className="size-3.5" />}
                    {plan.eyebrow}
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-base font-normal text-muted-foreground">
                      {plan.unit}
                    </span>
                  </CardTitle>
                  {plan.strikethrough && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm line-through text-muted-foreground/60">
                        {plan.strikethrough}
                      </span>
                      {plan.saveLabel && (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-rose-400 bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full shadow-sm shadow-rose-500/10">
                          <Flame className="size-3" />
                          {plan.saveLabel}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="flex-1">
                  {plan.audioHighlight && (
                    <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-3">
                      <div className="flex items-center justify-center size-9 shrink-0 rounded-lg bg-amber-500/10">
                        <Headphones className="size-5 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-amber-500">
                          AI audio narration
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Every lesson read aloud in natural voice.
                        </p>
                      </div>
                    </div>
                  )}
                  <ul className="space-y-3">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        {f.included ? (
                          <Check
                            className={`size-4 shrink-0 ${checkClass}`}
                          />
                        ) : (
                          <X className="size-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span
                          className={
                            f.included ? "" : "text-muted-foreground/50"
                          }
                        >
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto pt-0">
                  <Link
                    href={plan.ctaHref}
                    className={`w-full inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium transition-all hover:scale-[1.02] ${ctaClass}`}
                  >
                    {plan.cta}
                    {plan.highlight === "best" && (
                      <ArrowRight className="ml-2 size-4" />
                    )}
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <section className="mt-16 md:mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                No trial needed — the Free plan lets you create up to 3 courses
                with no credit card required.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes. You can cancel Pro or Pro Max from your profile at any
                time. You keep access until the end of the billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                What&apos;s the 5-Pack and when should I pick it?
              </h3>
              <p className="text-sm text-muted-foreground">
                The 5-Pack is a one-time purchase of 5 Pro Max courses — ideal
                if you have a short list of courses to build and don&apos;t
                want a monthly subscription.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                What does AI audio narration include?
              </h3>
              <p className="text-sm text-muted-foreground">
                Pro Max generates natural-sounding narration for every lesson
                in your course, so you can listen while you learn or share
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
