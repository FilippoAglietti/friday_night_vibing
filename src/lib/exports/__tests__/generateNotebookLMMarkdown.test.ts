import { describe, it, expect } from "vitest";
import { generateNotebookLMMarkdown } from "../generateNotebookLMMarkdown";
import type { Curriculum } from "@/types/curriculum";

function lesson(overrides: Partial<Curriculum["modules"][number]["lessons"][number]> = {}) {
  return {
    id: overrides.id ?? "l1",
    title: overrides.title ?? "Intro to closures",
    description: overrides.description ?? "Why closures matter.",
    format: overrides.format ?? "reading",
    durationMinutes: overrides.durationMinutes ?? 10,
    objectives: overrides.objectives ?? ["explain what a closure is"],
    keyPoints: overrides.keyPoints ?? ["a closure captures its environment"],
    content: overrides.content,
    order: overrides.order ?? 0,
  };
}

function curriculum(overrides: Partial<Curriculum> = {}): Curriculum {
  return {
    title: overrides.title ?? "JS fundamentals",
    subtitle: overrides.subtitle ?? "From scratch",
    description: overrides.description ?? "A walk through JavaScript.",
    targetAudience: overrides.targetAudience ?? "Junior engineers",
    difficulty: overrides.difficulty ?? "beginner",
    objectives: overrides.objectives ?? ["write idiomatic JS"],
    prerequisites: overrides.prerequisites ?? [],
    tags: overrides.tags ?? [],
    modules: overrides.modules ?? [
      {
        id: "m1",
        title: "Module 1: Functions",
        description: "Functions are first-class. Closures matter.",
        order: 0,
        objectives: ["use closures", "compose functions"],
        lessons: [lesson()],
      },
    ],
    pacing: overrides.pacing ?? {
      totalHours: 8,
      hoursPerWeek: 2,
      totalWeeks: 4,
      style: "self-paced",
      weeklyPlan: [],
    },
    bonusResources: overrides.bonusResources ?? [],
  } as Curriculum;
}

describe("generateNotebookLMMarkdown", () => {
  it("renders the briefing skeleton", () => {
    const out = generateNotebookLMMarkdown(curriculum());
    expect(out).toContain("# JS fundamentals — Podcast Briefing");
    expect(out).toContain("## Briefing for the hosts");
    expect(out).toContain("## Episode 1: Functions");
  });

  it("flattens lesson.content markdown to prose (no raw # or *)", () => {
    const c = curriculum({
      modules: [
        {
          id: "m1",
          title: "Module 1: Closures",
          description: "Why closures.",
          order: 0,
          objectives: ["x"],
          lessons: [
            lesson({
              content: "## Goals\n\n* Understand **closures**\n* Use `setTimeout`",
            }),
          ],
        },
      ],
    });
    const out = generateNotebookLMMarkdown(c);
    // The "## Goals" inside lesson.content must NOT survive as a heading in
    // the briefing, otherwise hosts read it as a structural cue. We check
    // the section AFTER the briefing's own ## headers (Episode + Briefing).
    const briefingTail = out.split("**Core ideas to unpack, in order.**")[1] ?? "";
    expect(briefingTail).not.toMatch(/^##\s/m);
    expect(briefingTail).not.toContain("**closures**");
    expect(briefingTail).not.toContain("`setTimeout`");
    expect(briefingTail).toContain("Understand closures");
  });

  it("drops the 'By the end of this lesson...' boilerplate", () => {
    const out = generateNotebookLMMarkdown(curriculum());
    expect(out).not.toContain("By the end of this lesson a learner should be able to");
  });

  it("cycles host prompts by module index instead of repeating", () => {
    const c = curriculum({
      modules: [
        { id: "m1", title: "M1", description: "d", order: 0, objectives: [], lessons: [lesson({ id: "a" })] },
        { id: "m2", title: "M2", description: "d", order: 1, objectives: [], lessons: [lesson({ id: "b" })] },
        { id: "m3", title: "M3", description: "d", order: 2, objectives: [], lessons: [lesson({ id: "c" })] },
        { id: "m4", title: "M4", description: "d", order: 3, objectives: [], lessons: [lesson({ id: "d" })] },
      ],
    });
    const out = generateNotebookLMMarkdown(c);
    const promptLines = out.match(/\*\*Prompts for the hosts\.\*\*[^\n]+/g) ?? [];
    expect(promptLines).toHaveLength(4);
    // 4 distinct cycle archetypes — the wording must differ across modules.
    const unique = new Set(promptLines);
    expect(unique.size).toBe(4);
  });

  it("each key point ends in sentence punctuation (no run-on)", () => {
    const c = curriculum({
      modules: [
        {
          id: "m1",
          title: "M1",
          description: "d",
          order: 0,
          objectives: [],
          lessons: [
            lesson({
              keyPoints: ["closures capture variables", "they outlive their scope"],
            }),
          ],
        },
      ],
    });
    const out = generateNotebookLMMarkdown(c);
    // Both key points should appear as fully terminated sentences.
    expect(out).toContain("closures capture variables.");
    expect(out).toContain("they outlive their scope.");
  });
});
