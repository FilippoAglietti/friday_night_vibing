"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Crown, Headphones, ArrowRight } from "lucide-react";
import { EnterpriseMailtoCta } from "@/components/EnterpriseMailtoCta";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Plan = {
  id: string;
  name: string;
  eyebrow: string;
  price: string;
  priceAnnual?: string;
  unit: string;
  unitAnnual?: string;
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
    eyebrow: "Start free",
    price: "€0",
    unit: "forever",
    description: "Try Syllabi with a free skeleton — see exactly what you'd ship.",
    features: [
      { included: true, label: "1 course skeleton per month" },
      { included: true, label: "Lesson titles, learning objectives, pacing" },
      { included: true, label: "PDF / Notion / Markdown export" },
      { included: false, label: "Module bodies" },
      { included: false, label: "Audio narration" },
      { included: false, label: "White-label exports" },
    ],
    cta: "Get started free",
    ctaHref: "/#generate",
    accent: "muted",
  },
  {
    id: "planner",
    name: "Planner",
    eyebrow: "Plan, then build",
    price: "€29",
    priceAnnual: "€24",
    unit: "/month",
    unitAnnual: "/mo · billed €290/yr",
    strikethrough: "€290/year · save 2 months",
    description: "The best course structures in the market. Skeletons on demand.",
    features: [
      { included: true, label: "15 reviewed skeletons per month" },
      { included: true, label: "Opus-quality skeleton review (hallucination catcher)" },
      { included: true, label: "All lengths (Crash / Short / Full / Masterclass)" },
      { included: true, label: "€5 on-demand body unlock per skeleton" },
      { included: false, label: "Module bodies by default" },
      { included: false, label: "Audio narration" },
    ],
    cta: "Start Planner",
    ctaHref: "/api/checkout?tier=planner",
    accent: "violet",
    highlight: "popular",
  },
  {
    id: "masterclass",
    name: "Masterclass",
    eyebrow: "Ready to teach from",
    price: "€99",
    priceAnnual: "€82",
    unit: "/month",
    unitAnnual: "/mo · billed €990/yr",
    strikethrough: "€990/year · save 2 months",
    description: "Reviewed, polished, narrated — every course ready for your audience.",
    features: [
      { included: true, label: "20 full courses per month" },
      { included: true, label: "Opus strategic polish on key lessons" },
      { included: true, label: "Masterclass-length courses included" },
      { included: true, label: "ElevenLabs audio narration" },
      { included: true, label: "White-label exports (no Syllabi branding)" },
      { included: true, label: "Priority queue" },
    ],
    cta: "Start Masterclass",
    ctaHref: "/api/checkout?tier=masterclass",
    accent: "amber",
    highlight: "best",
    icon: "crown",
    audioHighlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    eyebrow: "For teams",
    price: "Contact us",
    unit: "",
    description: "White-label, done-for-you courses, dedicated learning designer.",
    features: [
      { included: true, label: "Custom subdomain (learn.yourcompany.com)" },
      { included: true, label: "Done-for-you course creation" },
      { included: true, label: "Curated source library + citation allowlist" },
      { included: true, label: "Executive voice cloning (ElevenLabs)" },
      { included: true, label: "Dedicated Slack/Teams channel · 24h SLA" },
      { included: true, label: "EU data residency · GDPR · DPA on request" },
    ],
    cta: "Contact sales",
    ctaHref: "mailto:hello@syllabi.online?subject=Enterprise%20inquiry",
    accent: "muted",
  },
];

export default function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <>
      {/* Billing toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={billingCycle === "monthly"}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={billingCycle === "annual"}
          >
            Annual
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
              Save 2 mo
            </span>
          </button>
        </div>
      </div>

      {/* 4-card grid */}
      <div className="grid gap-6 xl:gap-8 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        {PLANS.map((plan) => {
          const isAnnual = billingCycle === "annual";
          const displayPrice =
            isAnnual && plan.priceAnnual ? plan.priceAnnual : plan.price;
          const displayUnit =
            isAnnual && plan.unitAnnual ? plan.unitAnnual : plan.unit;

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
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
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

              <CardHeader className="pt-8">
                <CardDescription
                  className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${eyebrowClass}`}
                >
                  {plan.icon === "crown" && <Crown className="size-3.5" />}
                  {plan.eyebrow}
                </CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {displayPrice}
                  <span className="text-base font-normal text-muted-foreground">
                    {displayUnit}
                  </span>
                </CardTitle>
                {!isAnnual && plan.strikethrough && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm line-through text-muted-foreground/60">
                      {plan.strikethrough}
                    </span>
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
                    <li key={i} className="flex items-center gap-2.5 text-sm">
                      {f.included ? (
                        <Check className={`size-4 shrink-0 ${checkClass}`} />
                      ) : (
                        <X className="size-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground/50"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto pt-0">
                {plan.id === "enterprise" ? (
                  <EnterpriseMailtoCta label={plan.cta} />
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className={`w-full inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium transition-all hover:scale-[1.02] ${ctaClass}`}
                  >
                    {plan.cta}
                    {plan.highlight === "best" && (
                      <ArrowRight className="ml-2 size-4" />
                    )}
                  </Link>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* 5-Pack sub-card */}
      <div className="mt-12 rounded-2xl border border-amber-200/30 bg-amber-50/5 dark:bg-amber-500/5 dark:border-amber-500/20 p-6 text-center">
        <h3 className="text-lg font-semibold">Try Masterclass without committing</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          5 full Masterclass generations · 90 days to use · €20 off if you upgrade within 30 days.
        </p>
        <Link
          href="/api/checkout?tier=5pack"
          className="mt-4 inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.02]"
        >
          Buy the 5-Pack — €39
        </Link>
      </div>
    </>
  );
}
