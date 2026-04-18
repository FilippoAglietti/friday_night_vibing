import { describe, it, expect } from "vitest";
import { canGenerate } from "@/lib/pricing/cap-enforcement";

describe("canGenerate", () => {
  it("free user under cap → allowed", () => {
    const r = canGenerate({ tier: "free", generationsUsedThisMonth: 0 });
    expect(r.allowed).toBe(true);
  });

  it("free user at cap → denied", () => {
    const r = canGenerate({ tier: "free", generationsUsedThisMonth: 1 });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.cap).toBe(1);
  });

  it("planner under 15 → allowed", () => {
    const r = canGenerate({ tier: "planner", generationsUsedThisMonth: 14 });
    expect(r.allowed).toBe(true);
  });

  it("planner at 15 → denied", () => {
    const r = canGenerate({ tier: "planner", generationsUsedThisMonth: 15 });
    expect(r.allowed).toBe(false);
  });

  it("masterclass at 20 → denied (no more unlimited)", () => {
    const r = canGenerate({ tier: "masterclass", generationsUsedThisMonth: 20 });
    expect(r.allowed).toBe(false);
  });

  it("masterclass at 19 → allowed", () => {
    const r = canGenerate({ tier: "masterclass", generationsUsedThisMonth: 19 });
    expect(r.allowed).toBe(true);
  });

  it("enterprise with null cap → allowed (100 default)", () => {
    const r = canGenerate({ tier: "enterprise", generationsUsedThisMonth: 50, enterpriseGenCap: null });
    expect(r.allowed).toBe(true);
  });

  it("enterprise with per-contract cap honoured", () => {
    const r = canGenerate({ tier: "enterprise", generationsUsedThisMonth: 30, enterpriseGenCap: 30 });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.cap).toBe(30);
  });

  it("returns ISO reset_at at next UTC month start", () => {
    const r = canGenerate({
      tier: "free",
      generationsUsedThisMonth: 1,
      now: new Date("2026-04-18T12:00:00Z"),
    });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.resetAt).toBe("2026-05-01T00:00:00.000Z");
  });
});
