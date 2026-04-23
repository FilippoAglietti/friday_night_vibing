# Visual Regression Suite — Export v2

## What this is

Pixel-diff regression test for the `/api/export/pdf` pipeline. Renders each fixture through the full
CourseDocument → renderHtml → Playwright screenshot chain, then compares every page to a committed
PNG baseline.

## Running

```bash
# Check current output against committed baselines
INTEGRATION_TESTS=true pnpm vitest run tests/visual/regression.test.ts

# Regenerate all baselines (review before committing)
UPDATE_BASELINES=true pnpm vitest run tests/visual/regression.test.ts
```

Both modes require Chromium (Playwright) to be installed locally.

## Fixtures

The full suite is 12 fixtures: crash / short / full / masterclass × academic / handson / storytelling / conversational.
Phase 1 ships with two seed fixtures (`crash-academic.json`, `full-handson.json`) to smoke-test the harness.

To add the missing 10:
1. Generate a realistic course via the app's generator, or hand-write a minimal curriculum.
2. Save the raw curriculum JSON as `tests/visual/fixtures/<length>-<style>.json`.
3. Run with `UPDATE_BASELINES=true` to generate baseline PNGs.
4. **Manually inspect every baseline** for: no overlapping text, clean page breaks (no mid-sentence
   splits or orphaned single-word lines at the top of a page), page numbers on every page except
   the cover, TOC matches module list, no "Syllabi" text anywhere.
5. Only commit PNG baselines once they all look right.

## Phase 3 regeneration

Dialects are Phase 3 work. When they ship, every fixture's baseline PNG will change — plan to regenerate
all baselines in the same PR that introduces dialect CSS.
