import { describe, it, expect } from "vitest";
import { normalizePlan } from "@/lib/pricing/tiers";

describe("normalizePlan", () => {
  it("maps canonical plan strings to correct flags", () => {
    const p = normalizePlan("masterclass");
    expect(p.tier).toBe("masterclass");
    expect(p.isMasterclass).toBe(true);
    expect(p.isPaid).toBe(true);
    expect(p.isPlanner).toBe(false);
    expect(p.isFree).toBe(false);
    expect(p.label).toBe("Masterclass");
  });

  it("normalises legacy pro_max to masterclass", () => {
    const p = normalizePlan("pro_max");
    expect(p.tier).toBe("masterclass");
    expect(p.isMasterclass).toBe(true);
    expect(p.label).toBe("Masterclass");
  });

  it("normalises legacy pro to planner", () => {
    const p = normalizePlan("pro");
    expect(p.tier).toBe("planner");
    expect(p.isPlanner).toBe(true);
    expect(p.isPaid).toBe(true);
    expect(p.label).toBe("Planner");
  });

  it("treats enterprise as masterclass-equivalent for feature checks", () => {
    const p = normalizePlan("enterprise");
    expect(p.tier).toBe("enterprise");
    expect(p.isMasterclass).toBe(true);
    expect(p.isPaid).toBe(true);
    expect(p.label).toBe("Enterprise");
  });

  it("falls back to free for null/undefined/unknown", () => {
    expect(normalizePlan(null).isFree).toBe(true);
    expect(normalizePlan(undefined).isFree).toBe(true);
    expect(normalizePlan("garbage").isFree).toBe(true);
    expect(normalizePlan(null).label).toBe("Free");
  });

  it("isPaid excludes free only", () => {
    expect(normalizePlan("free").isPaid).toBe(false);
    expect(normalizePlan("planner").isPaid).toBe(true);
    expect(normalizePlan("masterclass").isPaid).toBe(true);
    expect(normalizePlan("enterprise").isPaid).toBe(true);
  });
});
