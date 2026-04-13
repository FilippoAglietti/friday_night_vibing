"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  Flame,
  Headphones,
  BookOpen,
  Palette,
  Cpu,
} from "lucide-react";
import { useState } from "react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan?: "free" | "pro" | "pro_max";
}

/* Launch promo — mirrors the config in page.tsx */
const PROMO_ACTIVE = true;
const PROMO_EXPIRES = new Date("2026-05-11T23:59:59Z");

const PRO_ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID;
const PROMAX_ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PROMAX_ANNUAL_PRICE_ID;
const ANNUAL_BILLING_AVAILABLE = Boolean(PRO_ANNUAL_PRICE_ID && PROMAX_ANNUAL_PRICE_ID);

const plans = [
  {
    id: "pro",
    name: "Pro",
    price: PROMO_ACTIVE ? "€28" : "€35",
    priceAnnual: "€19",
    annualBilledLabel: "billed €228/year",
    originalPrice: "€35/mo",
    period: "/month",
    description: "For creators who ship courses every week.",
    badge: PROMO_ACTIVE ? "Launch Special" : "Most Popular",
    discountPct: PROMO_ACTIVE ? "20% OFF" : null,
    features: [
      "15 course generations/month",
      "Full modules, lessons & quizzes",
      "PDF, Markdown & Notion export",
      "All course lengths & styles",
      "Priority AI processing",
    ],
    cta: PROMO_ACTIVE ? "Start Pro — €28/mo" : "Start Pro — €35/mo",
    ctaAnnual: "Start Pro — €19/mo annually",
    // Fallback = canonical EUR Pro price ID (€28/mo) — keeps checkout working
    // even if the NEXT_PUBLIC env var is missing on Vercel.
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1TKBpS3kBvceiBKLANxOEgzs",
    priceIdAnnual: PRO_ANNUAL_PRICE_ID,
    icon: Crown,
    gradient: "from-violet-600 to-indigo-600",
    badgeGradient: "from-violet-600 to-indigo-600",
    checkColor: "text-violet-500",
    highlight: false,
    hasAnnual: true,
  },
  {
    id: "promax",
    name: "Pro Max",
    price: PROMO_ACTIVE ? "€69" : "€79",
    priceAnnual: "€49",
    annualBilledLabel: "billed €588/year",
    originalPrice: "€79/mo",
    period: "/month",
    description: "The ultimate toolkit to create & sell courses.",
    badge: PROMO_ACTIVE ? "Save 13%" : "Best Value",
    discountPct: PROMO_ACTIVE ? "13% OFF" : null,
    features: [
      "Everything in Pro",
      "AI-generated audio lessons",
      "Full chapter content generation",
      "Premium Notion & PDF export",
      "Sell-ready course packages",
      "White-label branding",
      "Dedicated AI processing",
    ],
    cta: PROMO_ACTIVE ? "Go Pro Max — €69/mo" : "Go Pro Max — €79/mo",
    ctaAnnual: "Go Pro Max — €49/mo annually",
    // Fallback = canonical EUR Pro Max price ID (€69/mo).
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROMAX_PRICE_ID || "price_1TKBpU3kBvceiBKLmKdWHeub",
    priceIdAnnual: PROMAX_ANNUAL_PRICE_ID,
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-600",
    badgeGradient: "from-amber-500 to-orange-600",
    checkColor: "text-amber-500",
    highlight: true,
    hasAnnual: true,
  },
  {
    id: "5pack",
    name: "Pro Max · 5-Pack",
    price: PROMO_ACTIVE ? "€33" : "€42",
    originalPrice: "€42",
    period: "one-time",
    description: "Try Pro Max with 5 premium generations.",
    badge: null,
    discountPct: PROMO_ACTIVE ? "21% OFF" : null,
    features: [
      "5 Pro Max generations",
      "AI-generated audio lessons",
      "Full chapter content generation",
      "Premium Notion & PDF export",
      "White-label branding",
      "No recurring charges",
    ],
    cta: PROMO_ACTIVE ? "Try Pro Max — €33" : "Try Pro Max — €42",
    ctaAnnual: PROMO_ACTIVE ? "Try Pro Max — €33" : "Try Pro Max — €42",
    priceAnnual: PROMO_ACTIVE ? "€33" : "€42",
    annualBilledLabel: "one-time",
    // Fallback = canonical EUR 5-Pack price ID (€33 one-time).
    priceId: process.env.NEXT_PUBLIC_STRIPE_5PACK_PRICE_ID || "price_1TKBpT3kBvceiBKLgw6NIFap",
    priceIdAnnual: undefined,
    icon: Crown,
    gradient: "from-amber-600 to-orange-600",
    badgeGradient: "from-amber-600 to-orange-600",
    checkColor: "text-amber-400",
    highlight: false,
    hasAnnual: false,
  },
];

export default function PaywallModal({ open, onClose, currentPlan = "free" }: PaywallModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  // Filter plans based on current plan — don't show what they already have
  const visiblePlans = currentPlan === "pro"
    ? plans.filter((p) => p.id !== "pro")       // Pro users: show Pro Max + 5-Pack only
    : currentPlan === "pro_max"
    ? []                                          // Pro Max users: nothing to upgrade to
    : plans;                                      // Free users: show all

  const handleCheckout = async (priceId: string) => {
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
                  Unlock the full power of Syllabi
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
                        −30%
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Plans grid */}
              <div className={`grid gap-4 px-6 pb-8 pt-2 ${visiblePlans.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-3"}`}>
                {visiblePlans.map((plan) => {
                  const showAnnual = billingPeriod === "annual" && plan.hasAnnual && plan.priceIdAnnual;
                  const displayPrice = showAnnual ? plan.priceAnnual : plan.price;
                  const displayCta = showAnnual ? plan.ctaAnnual : plan.cta;
                  const activePriceId = showAnnual && plan.priceIdAnnual ? plan.priceIdAnnual : plan.priceId;
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
                      <Badge className={`absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r ${plan.badgeGradient} px-3 py-0.5 text-[10px] font-semibold text-white border-0 shadow-md`}>
                        {plan.badge}
                      </Badge>
                    )}

                    <div className="flex items-center gap-2 mb-2 mt-1">
                      <plan.icon className={`size-5 ${plan.highlight || plan.id === "5pack" ? "text-amber-500" : plan.id === "pro" ? "text-violet-500" : "text-cyan-500"}`} />
                      <span className="font-semibold text-sm">{plan.name}</span>
                      {plan.discountPct && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                          <Flame className="size-3" />
                          {plan.discountPct}
                        </span>
                      )}
                    </div>

                    <div className="mb-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold">{displayPrice}</span>
                      <span className="text-xs text-muted-foreground">
                        {plan.period}
                      </span>
                      {PROMO_ACTIVE && !showAnnual && (
                        <span className="text-sm text-muted-foreground/50 line-through">{plan.originalPrice}</span>
                      )}
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
                      disabled={loading !== null}
                      className={`w-full rounded-full text-sm font-semibold border-0 transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r ${plan.gradient} text-white shadow-lg ${
                        plan.highlight || plan.id === "5pack"
                          ? "shadow-amber-500/20 hover:shadow-amber-500/40"
                          : plan.id === "pro"
                          ? "shadow-violet-500/20 hover:shadow-violet-500/40"
                          : "shadow-amber-500/20 hover:shadow-amber-500/40"
                      }`}
                    >
                      {loading === activePriceId ? (
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
