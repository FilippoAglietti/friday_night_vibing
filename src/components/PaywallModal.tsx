"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Check,
  Sparkles,
  Crown,
  ArrowRight,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import { isPricingLive } from "@/lib/pricing/pricingLive";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan?: "free" | "planner" | "masterclass" | "enterprise";
  /** What triggered the paywall — used to customize copy. */
  reason?: "cap_exceeded" | "masterclass_body_on_planner" | "unknown";
}

/* Annual billing availability check */
const PLANNER_ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID;
const MASTERCLASS_ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID;
const ANNUAL_BILLING_AVAILABLE = Boolean(PLANNER_ANNUAL_PRICE_ID && MASTERCLASS_ANNUAL_PRICE_ID);

const plans = [
  {
    id: "planner",
    name: "Planner",
    price: "€29",
    priceAnnual: "€24",
    annualBilledLabel: "billed €290/year",
    period: "/month",
    description: "Best-in-class course skeletons on demand.",
    badge: "Most Popular",
    features: [
      "15 reviewed skeletons/month",
      "Opus-quality hallucination catcher",
      "€5 on-demand body unlock per skeleton",
      "PDF, Markdown & Notion export",
      "All course lengths",
    ],
    cta: "Start Planner — €29/mo",
    ctaAnnual: "Start Planner — €24/mo annually",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID,
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID,
    icon: Crown,
    gradient: "from-violet-600 to-indigo-600",
    badgeGradient: "from-violet-600 to-indigo-600",
    checkColor: "text-violet-500",
    highlight: false,
    hasAnnual: true,
  },
  {
    id: "masterclass",
    name: "Masterclass",
    price: "€99",
    priceAnnual: "€82",
    annualBilledLabel: "billed €990/year",
    period: "/month",
    description: "Polished, ready-to-teach courses with NotebookLM podcast export.",
    badge: "Best for teachers",
    features: [
      "20 full courses/month",
      "Opus strategic polish on key lessons",
      "NotebookLM-ready export → conversational podcast",
      "Masterclass-length courses",
      "White-label exports",
      "Priority queue",
    ],
    cta: "Start Masterclass — €99/mo",
    ctaAnnual: "Start Masterclass — €82/mo annually",
    priceId: process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID,
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID,
    icon: Headphones,
    gradient: "from-amber-500 to-orange-600",
    badgeGradient: "from-amber-500 to-orange-600",
    checkColor: "text-amber-500",
    highlight: true,
    hasAnnual: true,
  },
];

export default function PaywallModal({
  open,
  onClose,
  currentPlan = "free",
  reason = "unknown",
}: PaywallModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const pricingLive = isPricingLive();

  // Filter plans based on current plan — don't show what they already have
  const visiblePlans =
    currentPlan === "planner"
      ? plans.filter((p) => p.id !== "planner")  // Planner users: show Masterclass only
      : currentPlan === "masterclass" || currentPlan === "enterprise"
      ? []                                         // Masterclass/Enterprise: nothing to upgrade to
      : plans;                                     // Free users: show all

  const headerCopy = {
    cap_exceeded:
      currentPlan === "free"
        ? "You've used your free skeleton this month."
        : currentPlan === "planner"
        ? "You've used all 15 skeletons this month."
        : "You've hit the 20-generation cap.",
    masterclass_body_on_planner: "Masterclass-length bodies need Masterclass tier.",
    unknown: "Ready to unlock more?",
  }[reason];

  const handleCheckout = async (priceId: string | undefined) => {
    if (!isPricingLive()) {
      console.info("Checkout disabled: NEXT_PUBLIC_PRICING_LIVE not set to 'true'");
      return;
    }
    if (!priceId) {
      console.error("No price ID configured for this plan");
      return;
    }
    setLoading(priceId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-3xl rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Close upgrade modal"
              >
                <X className="size-5" />
              </button>

              {/* Header */}
              <div className="text-center pt-8 pb-4 px-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="size-5 text-violet-500" />
                  <span className="text-sm font-semibold text-violet-500 uppercase tracking-wider">
                    Upgrade Your Plan
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {headerCopy}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Choose your plan and start creating professional courses with AI.
                </p>

                {ANNUAL_BILLING_AVAILABLE && (
                  <div className="mt-5 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 p-1">
                    <button
                      type="button"
                      onClick={() => setBillingPeriod("monthly")}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                        billingPeriod === "monthly"
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-pressed={billingPeriod === "monthly"}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingPeriod("annual")}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        billingPeriod === "annual"
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-pressed={billingPeriod === "annual"}
                    >
                      Annual
                      <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                        Save 2 mo
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Plans grid */}
              <div
                className={`grid gap-4 px-6 pb-8 pt-2 ${
                  visiblePlans.length === 1
                    ? "max-w-sm mx-auto"
                    : "sm:grid-cols-2 max-w-2xl mx-auto"
                }`}
              >
                {visiblePlans.map((plan) => {
                  const showAnnual =
                    billingPeriod === "annual" && plan.hasAnnual && plan.priceIdAnnual;
                  const displayPrice = showAnnual ? plan.priceAnnual : plan.price;
                  const displayCta = showAnnual ? plan.ctaAnnual : plan.cta;
                  const activePriceId =
                    showAnnual && plan.priceIdAnnual ? plan.priceIdAnnual : plan.priceId;
                  const showBilledLabel = showAnnual && plan.annualBilledLabel && plan.hasAnnual;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-xl border p-5 transition-all ${
                        plan.highlight
                          ? "border-amber-500/40 bg-amber-500/5 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20"
                          : "border-border/50 bg-card/50"
                      }`}
                    >
                      {plan.badge && (
                        <Badge
                          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r ${plan.badgeGradient} px-3 py-0.5 text-[10px] font-semibold text-white border-0 shadow-md`}
                        >
                          {plan.badge}
                        </Badge>
                      )}

                      <div className="flex items-center gap-2 mb-2 mt-1">
                        <plan.icon
                          className={`size-5 ${
                            plan.highlight ? "text-amber-500" : "text-violet-500"
                          }`}
                        />
                        <span className="font-semibold text-sm">{plan.name}</span>
                      </div>

                      <div className="mb-1 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold">{displayPrice}</span>
                        <span className="text-xs text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                      {showBilledLabel && (
                        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                          {plan.annualBilledLabel}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        {plan.description}
                      </p>

                      <ul className="space-y-2 mb-5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs">
                            <Check className={`size-3.5 shrink-0 ${plan.checkColor}`} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleCheckout(activePriceId)}
                        disabled={!pricingLive || loading !== null}
                        className={`w-full rounded-full text-sm font-semibold border-0 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          pricingLive
                            ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg ${
                                plan.highlight
                                  ? "shadow-amber-500/20 hover:shadow-amber-500/40"
                                  : "shadow-violet-500/20 hover:shadow-violet-500/40"
                              }`
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                        }`}
                      >
                        {!pricingLive ? (
                          <span>Launching tomorrow</span>
                        ) : loading === activePriceId ? (
                          <span className="flex items-center gap-2">
                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Redirecting…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {displayCta}
                            <ArrowRight className="size-3.5" />
                          </span>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {visiblePlans.length === 0 && (
                <div className="px-6 pb-8 pt-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    You&apos;re already on the highest plan. Contact us at{" "}
                    <a
                      href="mailto:hello@syllabi.online"
                      className="text-violet-400 hover:text-violet-300 underline"
                    >
                      hello@syllabi.online
                    </a>{" "}
                    if you need anything.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
