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

  it("renders markdown bold as <strong>", () => {
    const md: Lesson = { ...lesson, content: "This is **important** stuff." };
    const html = renderToString(<LessonPage lesson={md} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("<strong>important</strong>");
  });

  it("renders markdown headings as <h2>", () => {
    const md: Lesson = { ...lesson, content: "## Section title\n\nbody" };
    const html = renderToString(<LessonPage lesson={md} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("<h2>Section title</h2>");
  });

  it("renders the lesson description when present", () => {
    const withDesc: Lesson = { ...lesson, description: "A short lead paragraph" };
    const html = renderToString(<LessonPage lesson={withDesc} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("A short lead paragraph");
  });

  it("renders the lesson format badge", () => {
    const html = renderToString(<LessonPage lesson={lesson} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("reading");
  });

  it("renders suggestedResources and skips unreachable ones", () => {
    const withResources: Lesson = {
      ...lesson,
      suggestedResources: [
        { title: "MDN docs", url: "https://mdn.com", type: "article" },
        { title: "Dead link", url: "https://gone.com", type: "article", status: "unreachable" },
      ],
    };
    const html = renderToString(<LessonPage lesson={withResources} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("MDN docs");
    expect(html).not.toContain("Dead link");
  });
});
