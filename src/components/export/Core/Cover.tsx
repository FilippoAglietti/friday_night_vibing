import type { Curriculum } from "@/types/curriculum";
import type { BrandingTokens } from "@/lib/export/branding";

interface CoverProps {
  curriculum: Pick<Curriculum, "title" | "subtitle" | "modules"> & {
    totalHours?: number;
    totalLessons?: number;
  };
  branding: BrandingTokens;
  volume: number;
}

/**
 * Cover — first page of every export.
 *
 * Type-led design. No Syllabi branding. When `branding.displayName` is null
 * the byline is omitted entirely — cover shows course title and stats alone.
 *
 * Masterclass hero image / logo slots are honored in Phase 5 via the
 * `branding.heroUrl` and `branding.logoUrl` fields; in Phase 1 both are null.
 */
export function Cover({ curriculum, branding, volume }: CoverProps) {
  const totalHours = curriculum.totalHours ?? 0;
  const totalLessons =
    curriculum.totalLessons ??
    curriculum.modules.reduce((n, m) => n + (m.lessons?.length ?? 0), 0);

  return (
    <section className="cover page-break-after avoid-break"
             style={{
               width: "var(--content-width)",
               minHeight: "calc(var(--page-height) - (2 * var(--page-margin-outer)))",
               margin: "0 auto",
               display: "flex",
               flexDirection: "column",
               justifyContent: "space-between",
               paddingTop: "var(--sp-16)",
               paddingBottom: "var(--sp-12)",
             }}>
      {/* Hidden string-set anchors for @page running headers — spec §7: creator + title only */}
      {branding.displayName && (
        <span className="running-creator-name">{branding.displayName}</span>
      )}
      <span className="running-course-title">{curriculum.title}</span>

      <header>
        <div style={{
          fontSize: "var(--fs-micro)",
          letterSpacing: "0.2em",
          color: "var(--c-ink-muted)",
          textTransform: "uppercase",
        }}>
          Volume {String(volume).padStart(2, "0")}
        </div>
      </header>

      <div>
        <h1 style={{ fontSize: "var(--fs-display)", lineHeight: 1.02, letterSpacing: "-0.025em", marginBottom: "var(--sp-4)" }}>
          {curriculum.title}
        </h1>
        {curriculum.subtitle && (
          <p style={{ fontSize: "var(--fs-lg)", color: "var(--c-ink-sec)", maxWidth: "60ch", marginTop: 0 }}>
            {curriculum.subtitle}
          </p>
        )}
        {branding.displayName && (
          <p style={{ marginTop: "var(--sp-8)", fontSize: "var(--fs-body)", color: "var(--c-ink-sec)" }}>
            by {branding.displayName}
          </p>
        )}
      </div>

      <footer style={{ display: "flex", gap: "var(--sp-8)", fontSize: "var(--fs-micro)", color: "var(--c-ink-muted)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        <span>{totalLessons} lessons</span>
        <span>{totalHours}h</span>
      </footer>
    </section>
  );
}
