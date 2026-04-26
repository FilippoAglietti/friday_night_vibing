import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { PacingSchedule } from "../Core/PacingSchedule";
import type { Module, PacingSchedule as PacingScheduleType } from "@/types/curriculum";

const modules: Module[] = [
  {
    id: "mod-1",
    title: "Foundations",
    description: "",
    objectives: [],
    lessons: [],
    order: 0,
    durationMinutes: 60,
  },
  {
    id: "mod-2",
    title: "Practice",
    description: "",
    objectives: [],
    lessons: [],
    order: 1,
    durationMinutes: 90,
  },
];

const pacing: PacingScheduleType = {
  style: "self-paced",
  totalHours: 12,
  hoursPerWeek: 3,
  totalWeeks: 4,
  weeklyPlan: [
    { week: 1, label: "Get comfortable", moduleIds: ["mod-1"] },
    { week: 2, moduleIds: ["mod-2"] },
  ],
};

describe("<PacingSchedule />", () => {
  it("renders the four headline numbers", () => {
    const html = renderToString(<PacingSchedule pacing={pacing} modules={modules} />);
    expect(html).toContain("12h");
    expect(html).toContain("3h");
    expect(html).toContain("4");
    expect(html).toContain("self paced");
  });

  it("renders weekly-plan entries with labels when present", () => {
    const html = renderToString(<PacingSchedule pacing={pacing} modules={modules} />);
    expect(html).toContain("Week 1");
    expect(html).toContain("Get comfortable");
    expect(html).toContain("Week 2");
  });

  it("falls back to module titles when a week has no label", () => {
    const html = renderToString(<PacingSchedule pacing={pacing} modules={modules} />);
    expect(html).toContain("Practice");
  });

  it("renders without weekly plan", () => {
    const lite: PacingScheduleType = { ...pacing, weeklyPlan: undefined };
    const html = renderToString(<PacingSchedule pacing={lite} modules={modules} />);
    expect(html).toContain("12h");
    expect(html).not.toContain("Weekly plan");
  });
});
