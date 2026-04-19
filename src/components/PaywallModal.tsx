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
  Building2,
} from "lucide-react";
import { useState } from "react";
import { isPricingLive } from "@/lib/pricing/pricingLive";
import { useTranslation } from "@/lib/i18n";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan?: "free" | "planner" | "masterclass" | "enterprise";
  /** What triggered the paywall — used to customize copy. */
  reason?: "cap_exceeded" | "masterclass_body_on_planner" | "unknown";
  /**
   * When set, render a focused single-plan view (monthly/annual toggle only)
   * instead of the full plan grid. Used when user clicked a specific plan CTA.
   */
  preSelectedPlan?: "planner" | "masterclass" | "fivepack";
}

type PlanCard = {
  id: "planner" | "masterclass" | "fivepack" | "enterprise";
  name: string;
  price: string;
  priceAnnual?: string;
  annualBilledLabel?: string;
  period: string;
  description: string;
  badge?: string;
  features: string[];
  cta: string;
  ctaAnnual?: string;
  priceId?: string;
  priceIdAnnual?: string;
  icon: typeof Crown;
  gradient: string;
  badgeGradient: string;
  checkColor: string;
  highlight: boolean;
  hasAnnual: boolean;
  contactSales?: boolean;
  mailto?: string;
};

export default function PaywallModal({
  open,
  onClose,
  currentPlan = "free",
  reason = "unknown",
  preSelectedPlan,
}: PaywallModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const pricingLive = isPricingLive();
  const { t } = useTranslation();

  const plans: PlanCard[] = [
    {
      id: "planner",
      name: t("pricing.tiers.planner.name"),
      price: "€29",
      priceAnnual: "€24",
      annualBilledLabel: t("pricing.billedPlannerAnnual"),
      period: t("pricing.month"),
      description: t("pricing.proDesc"),
      badge: t("pricing.mostPopular"),
      features: [
        t("pricing.pro1"),
        t("pricing.pro2"),
        t("pricing.pro3"),
        t("pricing.pro4"),
        t("pricing.pro5"),
        t("pricing.pro6"),
      ],
      cta: t("pricing.startProBtn"),
      ctaAnnual: t("pricing.startProBtnAnnual"),
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
      name: t("pricing.tiers.masterclass.name"),
      price: "€99",
      priceAnnual: "€82",
      annualBilledLabel: t("pricing.billedMasterclassAnnual"),
      period: t("pricing.month"),
      description: t("pricing.proMaxDesc"),
      badge: t("pricing.bestForTeachers"),
      features: [
        t("pricing.pm1"),
        t("pricing.pm2"),
        t("pricing.pm3"),
        t("pricing.pm4"),
        t("pricing.pm5"),
        t("pricing.pm6"),
      ],
      cta: t("pricing.goProMaxBtn"),
      ctaAnnual: t("pricing.goProMaxBtnAnnual"),
      priceId: process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID,
      priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID,
      icon: Headphones,
      gradient: "from-amber-500 to-orange-600",
      badgeGradient: "from-amber-500 to-orange-600",
      checkColor: "text-amber-500",
      highlight: true,
      hasAnnual: true,
    },
    {
      id: "fivepack",
      name: "Masterclass · 5-Pack",
      price: "€39",
      period: t("pricing.oneTimeLabel"),
      description: t("pricing.fivePackDesc"),
      badge: t("pricing.oneTime"),
      features: [
        t("pricing.pack1"),
        t("pricing.pack2"),
        t("pricing.pack3"),
        t("pricing.pack4"),
        t("pricing.pack5"),
        t("pricing.pack6"),
      ],
      cta: t("pricing.tryProMaxBtn"),
      priceId: process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID,
      icon: Crown,
      gradient: "from-amber-600 to-orange-600",
      badgeGradient: "from-amber-600 to-orange-600",
      checkColor: "text-amber-400",
      highlight: false,
      hasAnnual: false,
    },
    {
      id: "enterprise",
      name: t("pricing.tiers.enterprise.name"),
      price: "Custom",
      period: "",
      description: t("pricing.enterpriseDesc"),
      features: [
        t("pricing.ent1"),
        t("pricing.ent2"),
        t("pricing.ent3"),
        t("pricing.ent4"),
        t("pricing.ent5"),
      ],
      cta: t("pricing.tiers.enterprise.cta"),
      icon: Building2,
      gradient: "from-slate-600 to-slate-800",
      badgeGradient: "from-slate-600 to-slate-800",
      checkColor: "text-slate-400",
      highlight: false,
      hasAnnual: false,
      contactSales: true,
      mailto:
        "mailto:hello@syllabi.online?subject=Syllabi%20Enterprise%20Inquiry&body=Hi%20Syllabi%20team%2C%0A%0AWe%27re%20interested%20in%20Syllabi%20Enterprise.%20Here%27s%20some%20context%20about%20our%20team%3A%0A%0A-%20Team%20size%3A%20%0A-%20Use%20case%3A%20%0A-%20Expected%20monthly%20generations%3A%20%0A%0AThanks%21",
    },
  ];

  const visiblePlans = preSelectedPlan
    ? plans.filter((p) => p.id === preSelectedPlan)
    : currentPlan === "planner"
    ? plans.filter((p) => p.id !== "planner" && p.id !== "fivepack")
    : currentPlan === "masterclass"
    ? plans.filter((p) => p.id === "enterprise")
    : currentPlan === "enterprise"
    ? []
    : plans.filter((p) => p.id !== "fivepack");

  const headerCopy = preSelectedPlan
    ? t("pricing.upgradeEyebrow")
    : {
        cap_exceeded:
          currentPlan === "free"
            ? t("paywall.fromFree.title")
            : currentPlan === "planner"
            ? t("paywall.fromPlannerCap.title")
            : t("paywall.fromMasterclassCap.title"),
        masterclass_body_on_planner: t("paywall.fromPlannerMasterclassBody.title"),
        unknown: t("pricing.upgradeEyebrow"),
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

  const isFocused = Boolean(preSelectedPlan) && visiblePlans.length === 1;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          >
            <div className={`relative w-full ${isFocused ? "max-w-md" : "max-w-5xl"} rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden max-h-[90vh] overflow-y-auto`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Close upgrade modal"
              >
                <X className="size-5" />
              </button>

              <div className="text-center pt-8 pb-4 px-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="size-5 text-violet-500" />
                  <span className="text-sm font-semibold text-violet-500 uppercase tracking-wider">
                    {t("pricing.upgradeEyebrow")}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {headerCopy}
                </h2>
                {!isFocused && (
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    {t("pricing.upgradeSubtitle")}
                  </p>
                )}

                {!isFocused && (
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
                      {t("pricing.toggle.monthly")}
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
                      {t("pricing.toggle.annual")}
                      <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                        {t("pricing.toggle.savePitch")}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div
                className={`grid gap-4 px-6 pb-8 pt-2 ${
                  isFocused
                    ? "max-w-md mx-auto"
                    : visiblePlans.length === 1
                    ? "max-w-sm mx-auto"
                    : visiblePlans.length === 2
                    ? "sm:grid-cols-2 max-w-2xl mx-auto"
                    : "sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
                }`}
              >
                {visiblePlans.map((plan) => {
                  const showAnnual =
                    billingPeriod === "annual" && plan.hasAnnual && plan.priceAnnual;
                  const displayPrice = showAnnual ? plan.priceAnnual : plan.price;
                  const displayCta = showAnnual && plan.ctaAnnual ? plan.ctaAnnual : plan.cta;
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
                      {plan.badge && !isFocused && (
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

                      {isFocused && plan.hasAnnual && (
                        <div className="mb-3 inline-flex w-full items-center gap-1 rounded-full border border-border/60 bg-card/80 p-1">
                          <button
                            type="button"
                            onClick={() => setBillingPeriod("monthly")}
                            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              billingPeriod === "monthly"
                                ? `bg-gradient-to-r ${plan.gradient} text-white shadow-md`
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            aria-pressed={billingPeriod === "monthly"}
                          >
                            {t("pricing.toggle.monthly")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setBillingPeriod("annual")}
                            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                              billingPeriod === "annual"
                                ? `bg-gradient-to-r ${plan.gradient} text-white shadow-md`
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            aria-pressed={billingPeriod === "annual"}
                          >
                            {t("pricing.toggle.annual")}
                            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                              {t("pricing.toggle.savePitch")}
                            </span>
                          </button>
                        </div>
                      )}

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

                      {plan.contactSales ? (
                        <a
                          href={plan.mailto}
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-full text-sm font-semibold border-0 transition-all hover:scale-[1.02] active:scale-[0.98] px-4 py-2 bg-gradient-to-r ${plan.gradient} text-white shadow-lg shadow-slate-500/20 hover:shadow-slate-500/40`}
                        >
                          {displayCta}
                          <ArrowRight className="size-3.5" />
                        </a>
                      ) : (
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
                            <span>{t("pricing.launching")}</span>
                          ) : loading === activePriceId ? (
                            <span className="flex items-center gap-2">
                              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              {t("pricing.redirecting")}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {displayCta}
                              <ArrowRight className="size-3.5" />
                            </span>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {visiblePlans.length === 0 && (
                <div className="px-6 pb-8 pt-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("pricing.topPlanNote")}
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
