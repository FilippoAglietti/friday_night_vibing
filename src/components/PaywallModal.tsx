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
} from "lucide-react";
import { useState } from "react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: "pro",
    name: "Syllabi Pro",
    price: "$29",
    period: "/month",
    description: "Unlimited curriculum generations for serious course creators.",
    badge: "Most Popular",
    features: [
      "Unlimited generations",
      "Full modules, lessons & quizzes",
      "JSON, Markdown & PDF export",
      "Custom pacing schedules",
      "Priority AI processing",
    ],
    cta: "Start Pro — $29/mo",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    icon: Crown,
    gradient: "from-violet-600 to-indigo-600",
    highlight: true,
  },
  {
    id: "5pack",
    name: "5-Pack",
    price: "$39",
    period: "one-time",
    description: "5 additional curriculum generations. No subscription needed.",
    badge: null,
    features: [
      "5 curriculum generations",
      "Full modules, lessons & quizzes",
      "JSON, Markdown & PDF export",
      "Custom pacing schedules",
      "No recurring charges",
    ],
    cta: "Buy 5-Pack — $39",
    priceId: process.env.NEXT_PUBLIC_STRIPE_5PACK_PRICE_ID || "price_5pack",
    icon: Zap,
    gradient: "from-cyan-600 to-blue-600",
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
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-2xl rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden">
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
                  You&apos;ve used your free generation
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Upgrade to keep generating professional curricula with AI.
                  Choose the plan that works for you.
                </p>
              </div>

              {/* Plans grid */}
              <div className="grid gap-4 sm:grid-cols-2 px-6 pb-8 pt-2">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border p-5 transition-all ${
                      plan.highlight
                        ? "border-violet-500/40 bg-violet-500/5 shadow-lg shadow-violet-500/5"
                        : "border-border/50 bg-card/50"
                    }`}
                  >
                    {plan.badge && (
                      <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-0.5 text-[10px] font-semibold text-white border-0 shadow-md">
                        {plan.badge}
                      </Badge>
                    )}

                    <div className="flex items-center gap-2 mb-2 mt-1">
                      <plan.icon className={`size-5 ${plan.highlight ? "text-violet-500" : "text-cyan-500"}`} />
                      <span className="font-semibold text-sm">{plan.name}</span>
                    </div>

                    <div className="mb-2">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        {plan.period}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      {plan.description}
                    </p>

                    <ul className="space-y-2 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs">
                          <Check className={`size-3.5 shrink-0 ${plan.highlight ? "text-violet-500" : "text-cyan-500"}`} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleCheckout(plan.priceId)}
                      disabled={loading !== null}
                      className={`w-full rounded-full text-sm font-semibold border-0 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        plan.highlight
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
                          : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
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
