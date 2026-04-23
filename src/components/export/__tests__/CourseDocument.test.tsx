import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { CourseDocument } from "../CourseDocument";
import type { Curriculum } from "@/types/curriculum";

const curriculum = {
  id: "c1",
  title: "Intro to Machine Learning",
  subtitle: "From scratch",
  description: "",
  targetAudience: "beginners",
  difficulty: "beginner" as const,
  objectives: [],
  modules: [
    {
      id: "m1",
      title: "Foundations",
      description: "",
      objectives: [],
      order: 0,
      durationMinutes: 5,
      lessons: [
        {
          id: "l1",
          title: "What is a Model?",
          description: "",
          format: "reading" as const,
          durationMinutes: 5,
          order: 0,
          content: "A model is a function.",
          quiz: [{
            id: "q1",
            type: "multiple-choice" as const,
            question: "What is a model?",
            options: ["A fn", "A shape"],
            correctAnswer: 0,
          }],
        },
      ],
    },
  ],
  pacing: { style: "self-paced" as const, totalHours: 5, hoursPerWeek: 5, totalWeeks: 1 },
  createdBy: "u1",
  createdAt: "2026-04-23T00:00:00Z",
  updatedAt: "2026-04-23T00:00:00Z",
  version: "1",
} as Curriculum;

describe("<CourseDocument />", () => {
  it("renders cover, TOC, module opener, lesson, and certificate in order", () => {
    const html = renderToString(
      <CourseDocument curriculum={curriculum} branding={{ displayName: "Maria", logoUrl: null, accent: null, heroUrl: null, footer: null }} />
    );

    const coverIdx = html.indexOf("Intro to Machine Learning");
    const tocIdx = html.indexOf("Contents");
    const modIdx = html.indexOf("Foundations");
    const lessonIdx = html.indexOf("What is a Model?");
    const certIdx = html.indexOf("Certificate of Completion");

    expect(coverIdx).toBeGreaterThan(-1);
    expect(tocIdx).toBeGreaterThan(coverIdx);
    expect(modIdx).toBeGreaterThan(tocIdx);
    expect(lessonIdx).toBeGreaterThan(modIdx);
    expect(certIdx).toBeGreaterThan(lessonIdx);
  });

  it("renders quiz blocks inside their parent lesson", () => {
    const html = renderToString(
      <CourseDocument curriculum={curriculum} branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }} />
    );
    expect(html).toContain("What is a model?");
  });

  it("never includes the string 'Syllabi' regardless of branding", () => {
    for (const name of ["Maria", null, ""]) {
      const html = renderToString(
        <CourseDocument
          curriculum={curriculum}
          branding={{ displayName: name, logoUrl: null, accent: null, heroUrl: null, footer: null }}
        />
      );
      expect(html.toLowerCase()).not.toContain("syllabi");
    }
  });
});
