import { describe, it, expect } from "vitest";
import { resolvePriceId } from "../resolvePriceId";

const ENV = {
  NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID: "price_planner_m",
  NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID: "price_planner_y",
  NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID: "price_mc_m",
  NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID: "price_mc_y",
  NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID: "price_5pack",
  NEXT_PUBLIC_STRIPE_PLANNER_BODY_UNLOCK_PRICE_ID: "price_body",
} as unknown as NodeJS.ProcessEnv;

describe("resolvePriceId", () => {
  it("resolves new planner monthly", () => {
    expect(resolvePriceId("price_planner_m", ENV)).toEqual({ plan: "planner", interval: "month" });
  });
  it("resolves new planner annual", () => {
    expect(resolvePriceId("price_planner_y", ENV)).toEqual({ plan: "planner", interval: "year" });
  });
  it("resolves new masterclass monthly", () => {
    expect(resolvePriceId("price_mc_m", ENV)).toEqual({ plan: "masterclass", interval: "month" });
  });
  it("resolves new masterclass annual", () => {
    expect(resolvePriceId("price_mc_y", ENV)).toEqual({ plan: "masterclass", interval: "year" });
  });
  it("resolves 5-pack one-time", () => {
    expect(resolvePriceId("price_5pack", ENV)).toEqual({ plan: "masterclass_5pack", interval: "one_time" });
  });
  it("resolves body unlock", () => {
    expect(resolvePriceId("price_body", ENV)).toEqual({ plan: "planner_body_unlock", interval: "one_time" });
  });
  it("legacy pro → planner", () => {
    expect(resolvePriceId("price_1TKBpS3kBvceiBKLANxOEgzs", ENV)).toEqual({ plan: "planner", interval: "month" });
  });
  it("legacy pro_max → masterclass", () => {
    expect(resolvePriceId("price_1TKBpU3kBvceiBKLmKdWHeub", ENV)).toEqual({ plan: "masterclass", interval: "month" });
  });
  it("legacy fivePack → masterclass_5pack", () => {
    expect(resolvePriceId("price_1TKBpT3kBvceiBKLgw6NIFap", ENV)).toEqual({ plan: "masterclass_5pack", interval: "one_time" });
  });
  it("unknown price → unknown", () => {
    expect(resolvePriceId("price_xxx", ENV)).toEqual({ plan: "unknown", interval: "month" });
  });
});
