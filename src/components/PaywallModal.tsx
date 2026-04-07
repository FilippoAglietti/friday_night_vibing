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
}

/* Launch promo — mirrors the config in page.tsx */
const PROMO_ACTIVE = true;
const PROMO_EXPIRES = new Date("2026-05-11T23:59:59Z");

const plans = [
  {
    id: "pro",
    name: "Pro",
    price: PROMO_ACTIVE ? "$19" : "$29",
    originalPrice: "$29/mo",
    period: "/month",
    description: "For creators who ship courses every week.",
    badge: PROMO_ACTIVE ? "Launch Special" : "Most Popular",
    discountPct: PROMO_ACTIVE ? "34% OFF" : null,
    features: [
      "Unlimited course generations",
      "Full modules, lessons & quizzes",
      "PDF, Markdown & Notion export",
      "All course lengths & styles",
      "Priority AI processing",
    ],
    cta: PROMO_ACTIVE ? "Start Pro — $19/mo" : "Start Pro — $29/mo",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    icon: Crown,
    gradient: "from-violet-600 to-indigo-600",
    badgeGradient: "from-violet-600 to-indigo-600",
    checkColor: "text-violet-500",
    highlight: false,
  },
  {
    id: "promax",
    name: "Pro Max",
    price: PROMO_ACTIVE ? "$69" : "$79",
    originalPrice: "$79/mo",
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
    cta: PROMO_ACTIVE ? "Go Pro Max — $69/mo" : "Go Pro Max — $79/mo",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROMAX_PRICE_ID || "price_promax_monthly",
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-600",
    badgeGradient: "from-amber-500 to-orange-600",
    checkColor: "text-amber-500",
    highlight: true,
  },
  {
    id: "5pack",
    name: "Pro Max · 5-Pack",
    price: PROMO_ACTIVE ? "$29" : "$39",
    originalPrice: "$39",
    period: "one-time",
    description: "Try Pro Max with 5 premium generations.",
    badge: null,
    discountPct: PROMO_ACTIVE ? "26% OFF" : null,
    features: [
      "5 Pro Max generations",
      "AI-generated audio lessons",
      "Full chapter content generation",
      "Premium Notion & PDF export",
      "White-label branding",
      "No recurring charges",
    ],
    cta: PROMO_ACTIVE ? "Try Pro Max — $29" : "Try Pro Max — $39",
    priceId: process.env.NEXT_PUBLIC_STRIPE_5PACK_PRICE_ID || "price_5pack",
    icon: Crown,
    gradient: "from-amber-600 to-orange-600",
    badgeGradient: "from-amber-600 to-orange-600",
    checkColor: "text-amber-400",
    highlight: false,
  },
];

export default function PaywallModal({ open, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

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
              </div>

              {/* Plans grid */}
              <div className="grid gap-4 sm:grid-cols-3 px-6 pb-8 pt-2">
                {plans.map((plan) => (
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

                    <div className="mb-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">
                        {plan.period}
                      </span>
                      {PROMO_ACTIVE && (
                        <span className="text-sm text-muted-foreground/50 line-through">{plan.originalPrice}</span>
                      )}
                    </div>

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
                      onClick={() => handleCheckout(plan.priceId)}
                      disabled={loading !== null}
                      className={`w-full rounded-full text-sm font-semibold border-0 transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r ${plan.gradient} text-white shadow-lg ${
                        plan.highlight || plan.id === "5pack"
                          ? "shadow-amber-500/20 hover:shadow-amber-500/40"
                          : plan.id === "pro"
                          ? "shadow-violet-500/20 hover:shadow-violet-500/40"
                          : "shadow-amber-500/20 hover:shadow-amber-500/40"
                      }`}
                    >
                      {loading === plan.priceId ? (
                        <span className="flex items-center gap-2">
                          <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Redirecting…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {plan.cta}
                          <ArrowRight className="size-3.5" />
                        </span>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
