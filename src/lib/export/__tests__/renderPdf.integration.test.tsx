import { describe, it, expect } from "vitest";
import { renderPdf } from "../renderPdf";
import { renderHtml } from "../renderHtml";
import { CourseDocument } from "@/components/export";
import type { Curriculum } from "@/types/curriculum";

const fixture = {
  id: "fx1",
  title: "Fixture Course",
  subtitle: "For tests",
  description: "",
  targetAudience: "all",
  difficulty: "beginner",
  objectives: [],
  modules: [
    {
      id: "m1",
      title: "M1",
      description: "",
      objectives: [],
      order: 0,
      durationMinutes: 5,
      lessons: [
        { id: "l1", title: "L1", description: "", format: "reading", durationMinutes: 5, order: 0, content: "Body." },
      ],
    },
  ],
  pacing: { style: "self-paced", totalHours: 1, hoursPerWeek: 1, totalWeeks: 1 },
  createdBy: "u1",
  createdAt: "2026-04-23T00:00:00Z",
  updatedAt: "2026-04-23T00:00:00Z",
  version: "1",
} as unknown as Curriculum;

describe("renderPdf", () => {
  const hasChromium = Boolean(
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
      process.env.CI ||
      process.env.INTEGRATION_TESTS === "true",
  );

  it.runIf(hasChromium)("produces a non-empty PDF starting with %PDF-", async () => {
    const html = await renderHtml(
      <CourseDocument
        curriculum={fixture}
        branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }}
      />,
    );

    const pdf = await renderPdf(html);

    const magic = pdf.slice(0, 5).toString();
    expect(magic).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(1_000);
  }, 30_000);
});
