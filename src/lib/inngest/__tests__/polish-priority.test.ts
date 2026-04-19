import { describe, it, expect, mock } from "bun:test";

// Mock observability so we don't need Supabase env vars at import time.
mock.module("@/lib/observability/metrics", () => ({
  recordEvent: async () => undefined,
}));

// Dynamic import AFTER mock is registered so the mock is in effect.
const { selectLessonsToPolish } = await import("@/lib/inngest/polish");

interface TestLesson {
  id: string;
  is_worked_example?: boolean;
  is_key_concept?: boolean;
  bodyLength?: number;
  reviewerFlag?: boolean;
  isRecap?: boolean;
  isTransition?: boolean;
  isQuizHeavy?: boolean;
}

function mod(id: string, lessons: TestLesson[]) {
  return { id, lessons };
}

describe("selectLessonsToPolish", () => {
  it("respects 15-lesson cap regardless of total count", () => {
    const modules = Array.from({ length: 6 }, (_, mi) =>
      mod(
        `m${mi}`,
        Array.from({ length: 8 }, (_, li) => ({ id: `m${mi}l${li}`, bodyLength: 1000 + li })),
      ),
    );
    const picked = selectLessonsToPolish(modules);
    expect(picked.length).toBe(15);
  });

  it("always includes priority 1 (first/last per module + worked/key)", () => {
    const modules = [
      mod("m0", [
        { id: "l0", bodyLength: 1 },
        { id: "l1", is_worked_example: true, bodyLength: 1 },
        { id: "l2", isRecap: true, bodyLength: 1 },
        { id: "l3", bodyLength: 1 },
      ]),
    ];
    const picked = selectLessonsToPolish(modules);
    expect(picked.map((l) => l.id)).toContain("l0");
    expect(picked.map((l) => l.id)).toContain("l1");
    expect(picked.map((l) => l.id)).toContain("l3");
  });

  it("skips priority 3 (recap / transition / quiz-heavy) when P1+P2 fill budget", () => {
    const modules = [
      mod(
        "m0",
        Array.from({ length: 20 }, (_, i) => ({ id: `l${i}`, bodyLength: 100 + i })),
      ),
    ];
    modules[0].lessons[10].isRecap = true;
    const picked = selectLessonsToPolish(modules);
    const ids = picked.map((l) => l.id);
    const recapRank = ids.indexOf("l10");
    expect(recapRank === -1 || recapRank >= 10).toBe(true);
  });

  it("empty input returns empty", () => {
    expect(selectLessonsToPolish([])).toEqual([]);
  });
});
