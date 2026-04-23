import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { LessonPage } from "../Core/LessonPage";
import type { Lesson } from "@/types/curriculum";

const lesson: Lesson = {
  id: "l1",
  title: "What is a Model?",
  description: "",
  format: "reading",
  durationMinutes: 6,
  objectives: ["Understand the abstraction"],
  keyPoints: ["A model approximates a function", "Training finds the approximation"],
  content: "A model is a mathematical object that maps inputs to outputs.\n\nWe train it on examples.",
  order: 0,
};

describe("<LessonPage />", () => {
  it("renders the lesson title", () => {
    const html = renderToString(<LessonPage lesson={lesson} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("What is a Model?");
  });

  it("renders lesson number as module.lesson (e.g. 1.1)", () => {
    const html = renderToString(<LessonPage lesson={lesson} moduleIndex={2} lessonIndex={4} />);
    expect(html).toContain("3.5");
  });

  it("renders content paragraphs", () => {
    const html = renderToString(<LessonPage lesson={lesson} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("mathematical object");
    expect(html).toContain("train it on examples");
  });

  it("renders key points in a side panel when present", () => {
    const html = renderToString(<LessonPage lesson={lesson} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("A model approximates");
  });

  it("handles null content without throwing", () => {
    const bare = { ...lesson, content: undefined };
    expect(() =>
      renderToString(<LessonPage lesson={bare} moduleIndex={0} lessonIndex={0} />)
    ).not.toThrow();
  });
});
