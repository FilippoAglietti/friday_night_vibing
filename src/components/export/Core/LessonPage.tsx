import type { Lesson } from "@/types/curriculum";

interface LessonPageProps {
  lesson: Lesson;
  moduleIndex: number;
  lessonIndex: number;
}

/**
 * LessonPage (Core) — no dialect features.
 *
 * Markdown body is split on double-newline to paragraphs. Phase 3 swaps this
 * for DialectMarkdown which parses blockquote conventions (> 💡, > ❓, etc.)
 * into dialect-specific callouts. For now, plain paragraphs are enough to
 * validate page flow, typography, and page breaks.
 */
export function LessonPage({ lesson, moduleIndex, lessonIndex }: LessonPageProps) {
  const paragraphs = (lesson.content ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="lesson-page" style={{ paddingTop: "var(--sp-8)" }}>
      <header style={{ marginBottom: "var(--sp-6)" }}>
        <div style={{
          fontSize: "var(--fs-micro)",
          color: "var(--c-accent)",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "var(--sp-2)",
        }}>
          {`Lesson ${moduleIndex + 1}.${lessonIndex + 1} · ${lesson.durationMinutes} min`}
        </div>
        <h3 style={{ fontSize: "var(--fs-h2)", marginTop: 0 }}>{lesson.title}</h3>
      </header>

      <div className="page-grid-12">
        <div className="span-main">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {lesson.keyPoints && lesson.keyPoints.length > 0 && (
          <aside className="span-side avoid-break" style={{
            background: "var(--c-paper-alt)",
            padding: "var(--sp-3) var(--sp-4)",
            borderRadius: "4px",
            fontSize: "var(--fs-sm)",
            alignSelf: "start",
          }}>
            <div style={{
              fontSize: "var(--fs-micro)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--c-ink-muted)",
              marginBottom: "var(--sp-2)",
            }}>
              Key points
            </div>
            <ul style={{ paddingLeft: "var(--sp-4)", margin: 0 }}>
              {lesson.keyPoints.map((k, i) => (
                <li key={i} style={{ padding: "2px 0" }}>{k}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
