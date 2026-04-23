import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { QuizBlock } from "../Core/QuizBlock";
import type { QuizQuestion } from "@/types/curriculum";

const mc: QuizQuestion = {
  id: "q1",
  type: "multiple-choice",
  question: "Which of these is a classification model?",
  options: ["Linear regression", "Logistic regression", "K-means"],
  correctAnswer: 1,
  explanation: "Logistic regression predicts discrete class labels.",
};

const tf: QuizQuestion = {
  id: "q2",
  type: "true-false",
  question: "Gradient descent always finds the global minimum.",
  options: ["True", "False"],
  correctAnswer: 1,
  explanation: "Only convex surfaces guarantee the global minimum.",
};

describe("<QuizBlock />", () => {
  it("renders the question text", () => {
    const html = renderToString(<QuizBlock question={mc} index={0} />);
    expect(html).toContain("classification model");
  });

  it("renders every option", () => {
    const html = renderToString(<QuizBlock question={mc} index={0} />);
    expect(html).toContain("Linear regression");
    expect(html).toContain("Logistic regression");
    expect(html).toContain("K-means");
  });

  it("marks the correct option with a visible indicator", () => {
    const html = renderToString(<QuizBlock question={mc} index={0} />);
    const logisticIdx = html.indexOf("Logistic regression");
    expect(logisticIdx).toBeGreaterThan(-1);
    expect(html).toMatch(/Answer/i);
  });

  it("renders the explanation when provided", () => {
    const html = renderToString(<QuizBlock question={mc} index={0} />);
    expect(html).toContain("discrete class labels");
  });

  it("handles true/false quizzes", () => {
    const html = renderToString(<QuizBlock question={tf} index={1} />);
    expect(html).toContain("Gradient descent");
    expect(html).toContain("True");
    expect(html).toContain("False");
  });
});
