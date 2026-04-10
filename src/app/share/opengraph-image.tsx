import { ImageResponse } from "next/og";
import { decodeSharePayload } from "@/lib/exports/generateShareUrl";

export const runtime = "edge";
export const alt = "Syllabi — AI-Generated Course";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage({ searchParams }: { searchParams: { data?: string } }) {
  const data = searchParams?.data;
  const payload = data ? decodeSharePayload(data) : null;
  const curriculum = payload?.curriculum;

  // Fallback to default OG if no valid curriculum data
  if (!curriculum) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #0a0a1a 0%, #0f0a2a 40%, #1a0a30 100%)",
            padding: "60px 80px",
            fontFamily: "Inter, system-ui, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0",
              display: "flex",
              backgroundImage:
                "radial-gradient(circle, rgba(139,92,246,0.08) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 800,
                color: "white",
              }}
            >
              S
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "white",
                display: "flex",
              }}
            >
              syllabi
              <span style={{ color: "#8b5cf6" }}>.online</span>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "48px",
              flex: "1",
            }}
          >
            <div
              style={{
                fontSize: "58px",
                fontWeight: 800,
                lineHeight: "1.1",
                display: "flex",
                flexDirection: "column",
                color: "white",
              }}
            >
              <span style={{ display: "flex" }}>AI-Generated Course</span>
              <span
                style={{
                  display: "flex",
                  background:
                    "linear-gradient(90deg, #8b5cf6, #6366f1, #06b6d4)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                View & Learn
              </span>
            </div>
            <p
              style={{
                fontSize: "22px",
                color: "rgba(255,255,255,0.55)",
                marginTop: "20px",
                lineHeight: "1.5",
                display: "flex",
              }}
            >
              Created with Syllabi — the #1 AI course generator.
            </p>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // Count totals
  const totalModules = curriculum.modules?.length ?? 0;
  const totalLessons = curriculum.modules?.reduce(
    (sum, m) => sum + (m.lessons?.length ?? 0),
    0
  ) ?? 0;
  const totalMinutes = curriculum.modules?.reduce(
    (sum, m) => sum + (m.durationMinutes ?? 0),
    0
  ) ?? 0;
  const totalHours = Math.round(totalMinutes / 60);

  const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
    beginner: { bg: "rgba(16,185,129,0.15)", text: "#34d399", border: "rgba(16,185,129,0.3)" },
    intermediate: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
    advanced: { bg: "rgba(244,63,94,0.15)", text: "#fb7185", border: "rgba(244,63,94,0.3)" },
  };

  const dc = difficultyColors[curriculum.difficulty] ?? difficultyColors.intermediate;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a1a 0%, #0f0a2a 40%, #1a0a30 100%)",
          padding: "50px 70px",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            backgroundImage:
              "radial-gradient(circle, rgba(139,92,246,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)",
            display: "flex",
          }}
        />

        {/* Bottom glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)",
            display: "flex",
          }}
        />

        {/* Header row: Logo + Difficulty badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 800,
                color: "white",
              }}
            >
              S
            </div>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "white",
                display: "flex",
              }}
            >
              syllabi
              <span style={{ color: "#8b5cf6" }}>.online</span>
            </span>
          </div>

          {/* Difficulty badge */}
          <div
            style={{
              display: "flex",
              padding: "6px 16px",
              borderRadius: "20px",
              background: dc.bg,
              border: `1px solid ${dc.border}`,
              color: dc.text,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {curriculum.difficulty}
          </div>
        </div>

        {/* Course title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "36px",
            flex: "1",
          }}
        >
          <div
            style={{
              fontSize: curriculum.title.length > 40 ? "42px" : "50px",
              fontWeight: 800,
              lineHeight: "1.15",
              display: "flex",
              color: "white",
              maxWidth: "900px",
            }}
          >
            {curriculum.title.length > 70
              ? curriculum.title.slice(0, 67) + "..."
              : curriculum.title}
          </div>

          {curriculum.subtitle && (
            <p
              style={{
                fontSize: "20px",
                color: "rgba(255,255,255,0.5)",
                marginTop: "14px",
                lineHeight: "1.4",
                maxWidth: "700px",
                display: "flex",
              }}
            >
              {curriculum.subtitle.length > 100
                ? curriculum.subtitle.slice(0, 97) + "..."
                : curriculum.subtitle}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { label: `${totalModules} Modules`, icon: "M" },
            { label: `${totalLessons} Lessons`, icon: "L" },
            { label: `${totalHours}h Total`, icon: "T" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "14px",
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  background: "rgba(139,92,246,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a78bfa",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {stat.icon}
              </div>
              <span
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "15px",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}

          {/* Module names preview */}
          {curriculum.modules?.slice(0, 3).map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "13px",
                  fontWeight: 500,
                  display: "flex",
                }}
              >
                {m.title.length > 25 ? m.title.slice(0, 22) + "..." : m.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
