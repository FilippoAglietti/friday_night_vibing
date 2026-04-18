export type Tier = "free" | "planner" | "masterclass" | "enterprise";
export type BillingInterval = "monthly" | "annual" | "one_time";

export type CapResult =
  | { allowed: true }
  | { allowed: false; reason: "cap_exceeded"; tier: Tier; cap: number; resetAt: string };

export interface TierConfig {
  id: Tier;
  priceMonthly: number | null;
  priceAnnual: number | null;
  monthlyCap: number;
  hasReviewer: boolean;
  hasModuleBodies: boolean;
  hasPolish: boolean;
  hasAudio: boolean;
  hasWhiteLabel: boolean;
}
