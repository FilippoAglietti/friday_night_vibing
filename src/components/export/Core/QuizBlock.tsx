import type { QuizQuestion } from "@/types/curriculum";

interface QuizBlockProps {
  question: QuizQuestion;
  index: number;
}

function correctOptionIndex(q: QuizQuestion): number | null {
  if (typeof q.correctAnswer === "number") return q.correctAnswer;
  if (!q.options) return null;
  const idx = q.options.findIndex((o) => o === q.correctAnswer);
  return idx >= 0 ? idx : null;
}

/**
 * QuizBlock — single question with options + revealed answer + explanation.
 *
 * Phase 1 always renders answers visible. Phase 2 adds an interactive web
 * variant that hides the answer by default; PDF always shows it (PDFs aren't
 * interactive).
 */
export function QuizBlock({ question, index }: QuizBlockProps) {
  const correctIdx = correctOptionIndex(question);

  return (
    <div className="quiz-block avoid-break" style={{
      background: "var(--c-paper-alt)",
      border: "1px solid var(--c-rule)",
      borderRadius: "6px",
      padding: "var(--sp-4)",
      margin: "var(--sp-6) 0",
    }}>
      <div style={{
        fontSize: "var(--fs-micro)",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--c-accent)",
        marginBottom: "var(--sp-2)",
      }}>
        Question {String(index + 1).padStart(2, "0")}
      </div>

      <p style={{ fontWeight: 600, margin: "0 0 var(--sp-3)", color: "var(--c-ink)" }}>
        {question.question}
      </p>

      {question.options && (
        <ol style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {question.options.map((opt, i) => {
            const correct = i === correctIdx;
            return (
              <li key={i} style={{
                padding: "var(--sp-2) var(--sp-3)",
                border: "1px solid var(--c-rule)",
                borderRadius: "4px",
                marginBottom: "var(--sp-2)",
                display: "flex",
                alignItems: "baseline",
                gap: "var(--sp-2)",
                background: correct ? "var(--c-accent-soft)" : "var(--c-paper)",
              }}>
                <span style={{
                  fontSize: "var(--fs-micro)",
                  fontWeight: 700,
                  color: "var(--c-ink-muted)",
                  minWidth: "1.5em",
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
                {correct && (
                  <span style={{ marginLeft: "auto", fontSize: "var(--fs-micro)", fontWeight: 700, color: "var(--c-accent)" }}>
                    ✓ Answer
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {question.explanation && (
        <div style={{ marginTop: "var(--sp-3)", fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)" }}>
          <strong style={{ color: "var(--c-ink)" }}>Why:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}
