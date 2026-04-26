import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { CourseIntroduction } from "../Core/CourseIntroduction";

const base = {
  description: "A short intro to neural networks for product engineers.",
  targetAudience: "Senior engineers without an ML background.",
  objectives: ["Understand backprop", "Train a small classifier"],
  prerequisites: ["Comfortable with Python"],
  difficulty: "intermediate" as const,
  tags: ["ml", "python"],
};

describe("<CourseIntroduction />", () => {
  it("renders all six fields when populated", () => {
    const html = renderToString(<CourseIntroduction curriculum={base} />);
    expect(html).toContain("neural networks");
    expect(html).toContain("Senior engineers");
    expect(html).toContain("Understand backprop");
    expect(html).toContain("Comfortable with Python");
    expect(html).toContain("intermediate");
    expect(html).toContain("ml");
    expect(html).toContain("python");
  });

  it("returns null when nothing is populated", () => {
    const html = renderToString(
      <CourseIntroduction
        curriculum={{
          description: "",
          targetAudience: "",
          objectives: [],
          prerequisites: [],
          difficulty: "" as never,
          tags: [],
        }}
      />,
    );
    expect(html).toBe("");
  });

  it("omits the prerequisites section when empty but renders the rest", () => {
    const html = renderToString(
      <CourseIntroduction
        curriculum={{ ...base, prerequisites: [] }}
      />,
    );
    expect(html).toContain("neural networks");
    expect(html).not.toContain("Prerequisites");
  });
});
