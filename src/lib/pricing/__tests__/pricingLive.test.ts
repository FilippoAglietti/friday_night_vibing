import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isPricingLive } from "@/lib/pricing/pricingLive";

describe("isPricingLive", () => {
  const originalFlag = process.env.NEXT_PUBLIC_PRICING_LIVE;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_PRICING_LIVE;
  });

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.NEXT_PUBLIC_PRICING_LIVE;
    } else {
      process.env.NEXT_PUBLIC_PRICING_LIVE = originalFlag;
    }
  });

  it("returns false when the flag is unset", () => {
    expect(isPricingLive()).toBe(false);
  });

  it("returns true when the flag is exactly 'true'", () => {
    process.env.NEXT_PUBLIC_PRICING_LIVE = "true";
    expect(isPricingLive()).toBe(true);
  });

  it("returns false when the flag is 'false'", () => {
    process.env.NEXT_PUBLIC_PRICING_LIVE = "false";
    expect(isPricingLive()).toBe(false);
  });

  it("returns false when the flag is case-mismatched ('TRUE')", () => {
    process.env.NEXT_PUBLIC_PRICING_LIVE = "TRUE";
    expect(isPricingLive()).toBe(false);
  });

  it("returns false for any other string", () => {
    process.env.NEXT_PUBLIC_PRICING_LIVE = "yes";
    expect(isPricingLive()).toBe(false);
  });
});
