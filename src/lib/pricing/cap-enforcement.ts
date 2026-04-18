import type { Tier, CapResult } from "@/types/pricing";
import { TIERS } from "@/lib/pricing/tiers";

const ENTERPRISE_DEFAULT_CAP = 100;

export interface CanGenerateInput {
  tier: Tier;
  generationsUsedThisMonth: number;
  enterpriseGenCap?: number | null;
  now?: Date;
}

export function canGenerate(input: CanGenerateInput): CapResult {
  const { tier, generationsUsedThisMonth } = input;
  const now = input.now ?? new Date();

  let cap: number;
  if (tier === "enterprise") {
    cap = input.enterpriseGenCap ?? ENTERPRISE_DEFAULT_CAP;
  } else {
    cap = TIERS[tier].monthlyCap;
  }

  if (generationsUsedThisMonth < cap) return { allowed: true };

  return {
    allowed: false,
    reason: "cap_exceeded",
    tier,
    cap,
    resetAt: nextMonthStartUtc(now).toISOString(),
  };
}

function nextMonthStartUtc(now: Date): Date {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0));
}
