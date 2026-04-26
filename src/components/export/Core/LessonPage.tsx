import type { Lesson } from "@/types/curriculum";
import { markdownToHtml } from "@/lib/export/markdown";

interface LessonPageProps {
  lesson: Lesson;
  moduleIndex: number;
  lessonIndex: number;
}

/**
 * LessonPage (Core) — page-per-lesson layout for print exports.
 *
 * lesson.content is rendered via the shared markdown→HTML helper, so
 * # headings, **bold**, *italic*, `inline code`, > blockquote, lists,
 * and links all render correctly in the PDF (Phase 2 fidelity fix,
 * 2026-04-26 audit).
 *
 * Coverage: title, format badge, duration, description lead, full
 * markdown body, key points sidebar, suggested resources footer.
 * Reachability-filtered resources mirror the online view's behavior
 * (status === "unreachable" entries are hidden).
 */
export function LessonPage({ lesson, moduleIndex, lessonIndex }: LessonPageProps) {
  const bodyHtml = markdownToHtml(lesson.content ?? "");

  const visibleResources = (lesson.suggestedResources ?? []).filter(
    (r) => r.status !== "unreachable",
  );

  return (
    <article className="lesson-page" style={{ paddingTop: "var(--sp-8)" }}>
      <header style={{ marginBottom: "var(--sp-6)" }}>
        <div
          style={{
            fontSize: "var(--fs-micro)",
            color: "var(--c-accent)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "var(--sp-2)",
            display: "flex",
            gap: "var(--sp-3)",
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <span>
            {`Lesson ${moduleIndex + 1}.${lessonIndex + 1} · ${lesson.durationMinutes} min`}
          </span>
        </div>
        <h3 style={{ fontSize: "var(--fs-h2)", marginTop: 0 }}>{lesson.title}</h3>
        {lesson.description && (
          <p
            style={{
              fontSize: "var(--fs-lg)",
              color: "var(--c-ink-sec)",
              maxWidth: "60ch",
              marginTop: "var(--sp-2)",
              fontStyle: "italic",
            }}
          >
            {lesson.description}
          </p>
        )}
      </header>

      <div className="page-grid-12">
        <div
          className="span-main lesson-body"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {lesson.keyPoints && lesson.keyPoints.length > 0 && (
          <aside
            className="span-side avoid-break"
            style={{
              background: "var(--c-paper-alt)",
              padding: "var(--sp-3) var(--sp-4)",
              borderRadius: "4px",
              fontSize: "var(--fs-sm)",
              alignSelf: "start",
            }}
          >
            <div
              style={{
                fontSize: "var(--fs-micro)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--c-ink-muted)",
                marginBottom: "var(--sp-2)",
              }}
            >
              Key points
            </div>
            <ul style={{ paddingLeft: "var(--sp-4)", margin: 0 }}>
              {lesson.keyPoints.map((k, i) => (
                <li key={i} style={{ padding: "2px 0" }}>
                  {k}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {visibleResources.length > 0 && (
        <section
          className="avoid-break"
          style={{
            marginTop: "var(--sp-8)",
            paddingTop: "var(--sp-4)",
            borderTop: "1px solid var(--c-rule)",
          }}
        >
          <div
            style={{
              fontSize: "var(--fs-micro)",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--c-ink-muted)",
              marginBottom: "var(--sp-3)",
            }}
          >
            Resources
          </div>
          <ul style={{ paddingLeft: "var(--sp-4)", margin: 0 }}>
            {visibleResources.map((r, i) => (
              <li key={i} style={{ padding: "2px 0", fontSize: "var(--fs-sm)" }}>
                <span style={{ fontWeight: 600 }}>{r.title}</span>
                {r.type && (
                  <span style={{ color: "var(--c-ink-muted)" }}> · {r.type}</span>
                )}
                {r.url && (
                  <span style={{ color: "var(--c-ink-muted)" }}> · {r.url}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
