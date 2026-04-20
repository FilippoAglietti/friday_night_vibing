import type { Tier, TierConfig } from "@/types/pricing";

export const TIERS: Record<Tier, TierConfig> = {
  free: {
    id: "free",
    priceMonthly: 0,
    priceAnnual: 0,
    monthlyCap: 1,
    hasReviewer: false,
    hasModuleBodies: false,
    hasPolish: false,
    hasNotebookLMExport: false,
    hasWhiteLabel: false,
  },
  planner: {
    id: "planner",
    priceMonthly: 29,
    priceAnnual: 290,
    monthlyCap: 15,
    hasReviewer: true,
    hasModuleBodies: false,
    hasPolish: false,
    hasNotebookLMExport: false,
    hasWhiteLabel: false,
  },
  masterclass: {
    id: "masterclass",
    priceMonthly: 99,
    priceAnnual: 990,
    monthlyCap: 20,
    hasReviewer: true,
    hasModuleBodies: true,
    hasPolish: true,
    hasNotebookLMExport: true,
    hasWhiteLabel: true,
  },
  enterprise: {
    id: "enterprise",
    priceMonthly: null,
    priceAnnual: null,
    monthlyCap: -1,
    hasReviewer: true,
    hasModuleBodies: true,
    hasPolish: true,
    hasNotebookLMExport: true,
    hasWhiteLabel: true,
  },
};

export const BODY_UNLOCK_PRICE_EUR = 5;
export const SINGLE_MASTERCLASS_PRICE_EUR = 10;
export const FIVE_PACK_PRICE_EUR = 39;
export const FIVE_PACK_CREDIT_EUR = 20;
export const FIVE_PACK_CREDIT_WINDOW_DAYS = 30;
export const FIVE_PACK_COUNT = 5;
export const FIVE_PACK_WINDOW_DAYS = 90;

export function tierOrFallback(raw: string | null | undefined): Tier {
  if (raw === "planner" || raw === "masterclass" || raw === "enterprise" || raw === "free") {
    return raw;
  }
  if (raw === "pro") return "planner";
  if (raw === "pro_max") return "masterclass";
  return "free";
}

export function normalizePlan(rawPlan: string | null | undefined): {
  tier: Tier;
  isPaid: boolean;
  isMasterclass: boolean;
  isPlanner: boolean;
  isFree: boolean;
  label: "Free" | "Planner" | "Masterclass" | "Enterprise";
} {
  const tier = tierOrFallback(rawPlan);
  const labels = { free: "Free", planner: "Planner", masterclass: "Masterclass", enterprise: "Enterprise" } as const;
  return {
    tier,
    isPaid: tier !== "free",
    isMasterclass: tier === "masterclass" || tier === "enterprise",
    isPlanner: tier === "planner",
    isFree: tier === "free",
    label: labels[tier],
  };
}
