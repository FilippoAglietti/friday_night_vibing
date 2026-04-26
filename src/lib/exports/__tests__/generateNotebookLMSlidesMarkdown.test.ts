import { describe, it, expect } from "vitest";
import { generateNotebookLMSlidesMarkdown } from "../generateNotebookLMSlidesMarkdown";
import type { Curriculum } from "@/types/curriculum";

function lesson(overrides: Partial<Curriculum["modules"][number]["lessons"][number]> = {}) {
  return {
    id: overrides.id ?? "l1",
    title: overrides.title ?? "Closures",
    description: overrides.description ?? "What is a closure.",
    format: overrides.format ?? "reading",
    durationMinutes: overrides.durationMinutes ?? 10,
    objectives: overrides.objectives ?? [],
    keyPoints: overrides.keyPoints,
    content: overrides.content,
    order: overrides.order ?? 0,
  };
}

function curriculum(overrides: Partial<Curriculum> = {}): Curriculum {
  return {
    title: overrides.title ?? "JS",
    subtitle: overrides.subtitle,
    description: overrides.description ?? "A walk through JS.",
    targetAudience: overrides.targetAudience ?? "Engineers",
    difficulty: overrides.difficulty ?? "beginner",
    objectives: overrides.objectives ?? ["write idiomatic JS"],
    prerequisites: overrides.prerequisites ?? [],
    tags: overrides.tags ?? [],
    modules: overrides.modules ?? [
      {
        id: "m1",
        title: "Functions",
        description: "Functions module.",
        order: 0,
        objectives: ["use closures"],
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

describe("generateNotebookLMSlidesMarkdown", () => {
  it("tightens bullets longer than ~80 chars with an ellipsis", () => {
    const longKeyPoint =
      "this is an extremely verbose key point with many words that absolutely will not fit on one slide line";
    const out = generateNotebookLMSlidesMarkdown(
      curriculum({
        modules: [
          {
            id: "m1",
            title: "M1",
            description: "d",
            order: 0,
            objectives: [],
            lessons: [lesson({ keyPoints: [longKeyPoint] })],
          },
        ],
      }),
    );
    // Extract any line starting with "- " and confirm none exceed ~85 chars
    const bulletLines = (out.match(/^- .+$/gm) ?? []).filter((l) => !l.startsWith("- _"));
    expect(bulletLines.length).toBeGreaterThan(0);
    bulletLines.forEach((line) => {
      expect(line.length).toBeLessThanOrEqual(85);
    });
  });

  it("falls back to lesson.content extraction when keyPoints is empty", () => {
    const out = generateNotebookLMSlidesMarkdown(
      curriculum({
        modules: [
          {
            id: "m1",
            title: "M1",
            description: "d",
            order: 0,
            objectives: [],
            lessons: [
              lesson({
                keyPoints: [],
                content:
                  "## When closures are useful\n\nClosures let functions remember state. This is the core idea.\n\n## Common pitfalls\n\nWatch for accidental sharing.",
              }),
            ],
          },
        ],
      }),
    );
    // Should pull the H2s as bullets
    expect(out).toContain("- When closures are useful");
    expect(out).toContain("- Common pitfalls");
  });

  it("surfaces blockquotes from lesson.content as a 'Quote to land' speaker note", () => {
    const out = generateNotebookLMSlidesMarkdown(
      curriculum({
        modules: [
          {
            id: "m1",
            title: "M1",
            description: "d",
            order: 0,
            objectives: [],
            lessons: [
              lesson({
                content: "Lead paragraph.\n\n> Closures remember their environment.",
              }),
            ],
          },
        ],
      }),
    );
    expect(out).toContain('Quote to land: "Closures remember their environment."');
  });

  it("uses lead paragraphs of content for speaker notes (not full body truncated)", () => {
    // Use an unmistakable token that wouldn't slip through bullet extraction
    // either: only first 2 paragraphs may appear ANYWHERE in the slide.
    const tailToken = "ZZZUNIQUEHIDDENTAILTOKENZZZ";
    const middle = Array.from({ length: 30 }, (_, i) => `Filler paragraph ${i + 1}.`).join("\n\n");
    const out = generateNotebookLMSlidesMarkdown(
      curriculum({
        modules: [
          {
            id: "m1",
            title: "M1",
            description: "d",
            order: 0,
            objectives: [],
            lessons: [
              lesson({
                content: `Lead paragraph that introduces the lesson cleanly.\n\nSecond paragraph follows immediately.\n\n${middle}\n\nThis last paragraph contains the ${tailToken} marker and should never appear anywhere in the slide deck output for this lesson.`,
              }),
            ],
          },
        ],
      }),
    );
    expect(out).toContain("Lead paragraph that introduces");
    expect(out).toContain("Second paragraph follows immediately");
    expect(out).not.toContain(tailToken);
  });

  it("emits a parseable Marp frontmatter and one slide per lesson", () => {
    const out = generateNotebookLMSlidesMarkdown(
      curriculum({
        modules: [
          {
            id: "m1",
            title: "M1",
            description: "d",
            order: 0,
            objectives: [],
            lessons: [lesson({ id: "a" }), lesson({ id: "b", title: "Hoisting" })],
          },
        ],
      }),
    );
    expect(out.startsWith("---\nmarp: true")).toBe(true);
    // Cover + objectives + module intro + 2 lessons + closing = 5 separators
    const slideCount = out.split("\n\n---\n\n").length;
    expect(slideCount).toBeGreaterThanOrEqual(5);
  });
});
