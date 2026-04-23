import { describe, it, expect } from "vitest";
import { decideExportPath, estimatePageCount } from "../decideExportPath";
import type { Curriculum } from "@/types/curriculum";

function makeCurriculum(lessons: number, avgLessonMinutes = 6): Curriculum {
  const modules = [];
  let id = 0;
  for (let i = 0; i < lessons; i++) {
    modules.push({
      id: `m${i}`,
      title: `M${i}`,
      description: "",
      objectives: [],
      order: i,
      durationMinutes: avgLessonMinutes,
      lessons: [
        { id: `l${id++}`, title: `L${id}`, description: "", format: "reading" as const, durationMinutes: avgLessonMinutes, order: 0 },
      ],
    });
  }
  return {
    id: "c",
    title: "C",
    subtitle: "",
    description: "",
    targetAudience: "",
    difficulty: "beginner",
    objectives: [],
    modules,
    pacing: { style: "self-paced", totalHours: 1, hoursPerWeek: 1, totalWeeks: 1 },
    createdBy: "u",
    createdAt: "2026-04-23T00:00:00Z",
    updatedAt: "2026-04-23T00:00:00Z",
    version: "1",
  } as Curriculum;
}

describe("estimatePageCount", () => {
  it("returns ~2 + lesson count (cover + TOC + lessons)", () => {
    expect(estimatePageCount(makeCurriculum(1))).toBe(4);
    expect(estimatePageCount(makeCurriculum(10))).toBe(22);
  });
});

describe("decideExportPath", () => {
  it("returns 'sync' for short courses (≤ 30 estimated pages)", () => {
    expect(decideExportPath(makeCurriculum(5))).toBe("sync");
  });

  it("returns 'async' for masterclass-length courses (> 30 estimated pages)", () => {
    expect(decideExportPath(makeCurriculum(25))).toBe("async");
  });
});
