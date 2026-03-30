import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Syllabi.ai — AI Course Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #6D28D9 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 700,
              color: "white",
            }}
          >
            S
          </div>
          <span style={{ fontSize: "36px", fontWeight: 700, color: "white" }}>
            Syllabi.ai
          </span>
        </div>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            margin: "0 0 16px 0",
          }}
        >
          Turn Any Topic Into a
          <br />
          Complete Course
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
            margin: 0,
          }}
        >
          Modules, lessons, quizzes & pacing schedules — generated in seconds
        </p>
      </div>
    ),
    { ...size }
  );
}
