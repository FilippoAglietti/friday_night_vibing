import { describe, it, expect } from "vitest";
import { TIERS, tierOrFallback } from "@/lib/pricing/tiers";

describe("TIERS config", () => {
  it("has exactly four tiers", () => {
    expect(Object.keys(TIERS).sort()).toEqual(["enterprise", "free", "masterclass", "planner"]);
  });

  it("planner is skeleton-only (no module bodies)", () => {
    expect(TIERS.planner.hasModuleBodies).toBe(false);
    expect(TIERS.planner.hasReviewer).toBe(true);
  });

  it("masterclass has full pipeline", () => {
    expect(TIERS.masterclass.hasModuleBodies).toBe(true);
    expect(TIERS.masterclass.hasPolish).toBe(true);
    expect(TIERS.masterclass.hasNotebookLMExport).toBe(true);
    expect(TIERS.masterclass.hasWhiteLabel).toBe(true);
  });

  it("notebooklm export is masterclass+ only", () => {
    expect(TIERS.free.hasNotebookLMExport).toBe(false);
    expect(TIERS.planner.hasNotebookLMExport).toBe(false);
    expect(TIERS.masterclass.hasNotebookLMExport).toBe(true);
    expect(TIERS.enterprise.hasNotebookLMExport).toBe(true);
  });

  it("masterclass cap is 20 (not unlimited)", () => {
    expect(TIERS.masterclass.monthlyCap).toBe(20);
  });

  it("annual is 10× monthly for planner and masterclass", () => {
    expect(TIERS.planner.priceAnnual).toBe(TIERS.planner.priceMonthly! * 10);
    expect(TIERS.masterclass.priceAnnual).toBe(TIERS.masterclass.priceMonthly! * 10);
  });
});

describe("tierOrFallback", () => {
  it("passes new tiers through", () => {
    expect(tierOrFallback("planner")).toBe("planner");
    expect(tierOrFallback("masterclass")).toBe("masterclass");
    expect(tierOrFallback("enterprise")).toBe("enterprise");
    expect(tierOrFallback("free")).toBe("free");
  });

  it("maps legacy pro → planner and pro_max → masterclass", () => {
    expect(tierOrFallback("pro")).toBe("planner");
    expect(tierOrFallback("pro_max")).toBe("masterclass");
  });

  it("falls back to free for unknown / null", () => {
    expect(tierOrFallback(null)).toBe("free");
    expect(tierOrFallback("team")).toBe("free");
    expect(tierOrFallback(undefined)).toBe("free");
  });
});
