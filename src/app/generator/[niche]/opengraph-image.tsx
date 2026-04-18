import { ImageResponse } from "next/og";
import { getNicheBySlug } from "@/data/niches";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ niche: string }>;
}) {
  const { niche: slug } = await params;
  const niche = getNicheBySlug(slug);

  const headline = niche?.headline ?? "AI Course Generator";
  const tagline = niche?.tagline ?? "Create full courses in seconds.";
  const emoji = niche?.emoji ?? "🎓";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0a1a 0%, #0f0a2a 40%, #1a0a30 100%)",
          padding: "60px 80px",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern */}
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

        {/* Glow top-right */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)",
            display: "flex",
          }}
        />

        {/* Glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo row */}
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

        {/* Niche emoji + headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "40px",
            flex: "1",
          }}
        >
          <span style={{ fontSize: "64px", display: "flex" }}>{emoji}</span>
          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              lineHeight: "1.15",
              display: "flex",
              flexDirection: "column",
              marginTop: "16px",
            }}
          >
            <span
              style={{
                display: "flex",
                background:
                  "linear-gradient(90deg, #ffffff, #e0e0ff)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {headline}
            </span>
          </div>

          <p
            style={{
              fontSize: "22px",
              color: "rgba(255,255,255,0.55)",
              marginTop: "16px",
              lineHeight: "1.5",
              maxWidth: "700px",
              display: "flex",
            }}
          >
            {tagline}
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            "AI-Powered",
            "NotebookLM Export",
            "PDF & Notion Export",
            "Quizzes",
            "Free to Start",
          ].map((f) => (
            <div
              key={f}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "rgba(255,255,255,0.8)",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
