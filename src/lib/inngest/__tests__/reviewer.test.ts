import { describe, it, expect, afterEach, mock } from "bun:test";

// Mock observability so we don't need Supabase env vars at import time.
// recordEvent is never actually called when OPUS_REVIEWER_ENABLED is off,
// but the module-level import of metrics.ts would otherwise require
// SUPABASE_URL to be set in the test environment.
mock.module("@/lib/observability/metrics", () => ({
  recordEvent: async () => undefined,
}));

// Dynamic import AFTER mock is registered so the mock is in effect.
const { reviewSkeleton } = await import("@/lib/inngest/reviewer");

describe("reviewSkeleton", () => {
  const originalEnv = process.env.OPUS_REVIEWER_ENABLED;
  afterEach(() => {
    if (originalEnv === undefined) delete process.env.OPUS_REVIEWER_ENABLED;
    else process.env.OPUS_REVIEWER_ENABLED = originalEnv;
  });

  it("returns approved with empty feedback when flag is off", async () => {
    delete process.env.OPUS_REVIEWER_ENABLED;
    const result = await reviewSkeleton({ courseId: "test", skeleton: { modules: [] } });
    expect(result.verdict).toBe("approved");
    expect(result.feedback).toEqual([]);
  });

  it("returns approved when flag is explicitly 'false'", async () => {
    process.env.OPUS_REVIEWER_ENABLED = "false";
    const result = await reviewSkeleton({ courseId: "test", skeleton: { modules: [] } });
    expect(result.verdict).toBe("approved");
    expect(result.feedback).toEqual([]);
  });
});
