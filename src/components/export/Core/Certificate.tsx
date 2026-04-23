interface CertificateProps {
  courseTitle: string;
  totalLessons: number;
  totalHours: number;
  completedAt: string; // ISO date
  issuer: string | null; // creator name, NEVER "Syllabi"
  learnerName?: string | null;
}

/**
 * Certificate — final page.
 *
 * Spec §7 hard constraint: issuer is the creator name, never "Syllabi".
 * When the creator has not set a display name, the entire issuer line is
 * omitted — the certificate carries course title + stats + date only.
 *
 * Learner name field is optional; in Phase 1 it is always unset (students
 * receiving a shared course have not entered their name). Phase 2+ may
 * add a render-time learner-name parameter when a student completes via /share.
 */
export function Certificate({
  courseTitle,
  totalLessons,
  totalHours,
  completedAt,
  issuer,
  learnerName,
}: CertificateProps) {
  return (
    <section className="certificate avoid-break" style={{
      minHeight: "calc(var(--page-height) - (2 * var(--page-margin-outer)))",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "var(--sp-16) var(--sp-8)",
      border: "2px solid var(--c-ink)",
      position: "relative",
    }}>
      <div style={{
        fontSize: "var(--fs-micro)",
        letterSpacing: "0.3em",
        color: "var(--c-ink-muted)",
        textTransform: "uppercase",
        marginBottom: "var(--sp-8)",
      }}>
        Certificate of Completion
      </div>

      {learnerName && (
        <>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)" }}>Awarded to</div>
          <h2 style={{ fontSize: "var(--fs-h1)", margin: "var(--sp-3) 0 var(--sp-8)" }}>
            {learnerName}
          </h2>
        </>
      )}

      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)" }}>For completing</div>
      <h1 style={{ fontSize: "var(--fs-display)", lineHeight: 1, margin: "var(--sp-3) 0 var(--sp-8)", maxWidth: "80%" }}>
        {courseTitle}
      </h1>

      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)", marginBottom: "var(--sp-16)" }}>
        {totalLessons} lessons · {totalHours} hours · {completedAt}
      </div>

      {issuer && (
        <div style={{ borderTop: "1px solid var(--c-ink)", paddingTop: "var(--sp-3)", fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)", minWidth: "30%" }}>
          Issued by {issuer}
        </div>
      )}
    </section>
  );
}
