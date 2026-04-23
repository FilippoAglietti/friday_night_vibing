import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { renderFixtureToPngs, diffPng, loadBaseline, saveBaseline } from "./regression-harness";

const FIXTURES_DIR = path.join(process.cwd(), "tests/visual/fixtures");
const UPDATE = process.env.UPDATE_BASELINES === "true";
const RUN_INTEGRATION = Boolean(
  process.env.INTEGRATION_TESTS === "true" || UPDATE,
);

const fixtureNames = fs.existsSync(FIXTURES_DIR)
  ? fs.readdirSync(FIXTURES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  : [];

describe.runIf(RUN_INTEGRATION)("visual regression — export v2 fixtures × all pages", () => {
  if (fixtureNames.length === 0) {
    it("no fixtures to run", () => {
      expect(true).toBe(true);
    });
    return;
  }

  for (const name of fixtureNames) {
    it(`${name}: every page matches baseline within 0.5%`, async () => {
      const pages = await renderFixtureToPngs(name);
      for (let i = 0; i < pages.length; i++) {
        if (UPDATE) {
          saveBaseline(name, i, pages[i]);
          continue;
        }
        const baseline = loadBaseline(name, i);
        const { diffRatio } = diffPng(baseline, pages[i]);
        expect(diffRatio, `page ${i} of ${name}`).toBeLessThan(0.005);
      }
    }, 60_000);
  }
});
