import { TIERS } from "@/lib/pricing/tiers";

export type ResolvedPlan =
  | "planner"
  | "masterclass"
  | "masterclass_5pack"
  | "planner_body_unlock"
  | "unknown";
export type BillingInterval = "month" | "year" | "one_time";

export const LEGACY_PRICE_IDS = {
  pro: "price_1TKBpS3kBvceiBKLANxOEgzs",
  fivePack: "price_1TKBpT3kBvceiBKLgw6NIFap",
  proMax: "price_1TKBpU3kBvceiBKLmKdWHeub",
} as const;

/**
 * Resolves a Stripe price ID into our internal plan + billing interval.
 * Accepts env as a param so tests can inject their own map without mutating
 * process.env.
 */
export function resolvePriceId(
  priceId: string,
  env: NodeJS.ProcessEnv = process.env
): { plan: ResolvedPlan; interval: BillingInterval } {
  const plannerMonthly = env.NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID || "";
  const plannerAnnual = env.NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID || "";
  const masterclassMonthly = env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID || "";
  const masterclassAnnual = env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID || "";
  const masterclass5Pack = env.NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID || "";
  const plannerBodyUnlock = env.NEXT_PUBLIC_STRIPE_PLANNER_BODY_UNLOCK_PRICE_ID || "";

  if (priceId && priceId === plannerMonthly) return { plan: "planner", interval: "month" };
  if (priceId && priceId === plannerAnnual) return { plan: "planner", interval: "year" };
  if (priceId && priceId === masterclassMonthly) return { plan: "masterclass", interval: "month" };
  if (priceId && priceId === masterclassAnnual) return { plan: "masterclass", interval: "year" };
  if (priceId && priceId === masterclass5Pack) return { plan: "masterclass_5pack", interval: "one_time" };
  if (priceId && priceId === plannerBodyUnlock) return { plan: "planner_body_unlock", interval: "one_time" };

  if (priceId === LEGACY_PRICE_IDS.pro) return { plan: "planner", interval: "month" };
  if (priceId === LEGACY_PRICE_IDS.fivePack) return { plan: "masterclass_5pack", interval: "one_time" };
  if (priceId === LEGACY_PRICE_IDS.proMax) return { plan: "masterclass", interval: "month" };

  return { plan: "unknown", interval: "month" };
}

export function capForTier(
  tier: "planner" | "masterclass",
  interval: BillingInterval
): number {
  const monthlyCap = TIERS[tier].monthlyCap;
  return interval === "year" ? monthlyCap * 12 : monthlyCap;
}
