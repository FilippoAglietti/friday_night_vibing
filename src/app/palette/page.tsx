"use client";

import { notFound } from "next/navigation";
import { useState } from "react";

/* ── Palette Definitions ─────────────────────────────────── */

const palettes = {
  current: {
    name: "Current (AI Purple)",
    description: "Your existing violet/indigo palette",
    bg: "#0F0F11",
    sectionBgs: ["#0F0F11", "#0F0F11", "#0F0F11", "#0F0F11"],
    card: "rgba(24,24,27,0.5)",
    cardBorder: "rgba(63,63,70,0.4)",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    primary: "#8B5CF6",
    primaryHover: "#7C3AED",
    gradientFrom: "#7C3AED",
    gradientTo: "#4F46E5",
    accentSoft: "rgba(139,92,246,0.1)",
    accentBorder: "rgba(139,92,246,0.3)",
    badge: { bg: "rgba(139,92,246,0.1)", text: "#A78BFA", border: "rgba(139,92,246,0.3)" },
    glow: "rgba(139,92,246,0.15)",
    mode: "dark" as const,
  },
  pastelCoral: {
    name: "Soft Pastel + Coral",
    description: "Warm pastels with coral as the bold primary",
    bg: "#FEFCF9",
    sectionBgs: ["#FEFCF9", "#F5F3FF", "#F0FDFA", "#FFF7ED"],
    card: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.06)",
    text: "#1C1917",
    textMuted: "#78716C",
    primary: "#E11D48",
    primaryHover: "#BE123C",
    gradientFrom: "#E11D48",
    gradientTo: "#F43F5E",
    accentSoft: "rgba(225,29,72,0.06)",
    accentBorder: "rgba(225,29,72,0.15)",
    badge: { bg: "rgba(225,29,72,0.06)", text: "#E11D48", border: "rgba(225,29,72,0.15)" },
    glow: "none",
    mode: "light" as const,
  },
  pastelIndigo: {
    name: "Soft Pastel + Deep Indigo",
    description: "Warm pastels with deep indigo as the bold primary",
    bg: "#FEFCF9",
    sectionBgs: ["#FEFCF9", "#FFF1F2", "#F0FDFA", "#EEF2FF"],
    card: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.06)",
    text: "#1C1917",
    textMuted: "#78716C",
    primary: "#4338CA",
    primaryHover: "#3730A3",
    gradientFrom: "#4338CA",
    gradientTo: "#6366F1",
    accentSoft: "rgba(67,56,202,0.06)",
    accentBorder: "rgba(67,56,202,0.15)",
    badge: { bg: "rgba(67,56,202,0.06)", text: "#4338CA", border: "rgba(67,56,202,0.15)" },
    glow: "none",
    mode: "light" as const,
  },
  pastelTeal: {
    name: "Soft Pastel + Teal",
    description: "Warm pastels with teal as the bold primary",
    bg: "#FEFCF9",
    sectionBgs: ["#FEFCF9", "#F5F3FF", "#FFF7ED", "#F0FDFA"],
    card: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.06)",
    text: "#1C1917",
    textMuted: "#78716C",
    primary: "#0D9488",
    primaryHover: "#0F766E",
    gradientFrom: "#0F766E",
    gradientTo: "#14B8A6",
    accentSoft: "rgba(13,148,136,0.06)",
    accentBorder: "rgba(13,148,136,0.15)",
    badge: { bg: "rgba(13,148,136,0.06)", text: "#0D9488", border: "rgba(13,148,136,0.15)" },
    glow: "none",
    mode: "light" as const,
  },
  pastelBlack: {
    name: "Soft Pastel + Black",
    description: "Warm pastels with pure black buttons, coral accents",
    bg: "#FEFCF9",
    sectionBgs: ["#FEFCF9", "#F5F3FF", "#FFF7ED", "#F0FDFA"],
    card: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.06)",
    text: "#1C1917",
    textMuted: "#78716C",
    primary: "#171717",
    primaryHover: "#262626",
    gradientFrom: "#171717",
    gradientTo: "#171717",
    accentSoft: "rgba(225,29,72,0.06)",
    accentBorder: "rgba(225,29,72,0.15)",
    badge: { bg: "rgba(225,29,72,0.06)", text: "#E11D48", border: "rgba(225,29,72,0.15)" },
    glow: "none",
    mode: "light" as const,
  },
};

type PaletteKey = keyof typeof palettes;

/* ── Mock UI Components ─────────────────────────────────── */

function PalettePreview({ id, p, active, onClick }: {
  id: PaletteKey;
  p: typeof palettes[PaletteKey];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? p.primary : p.mode === "dark" ? "#27272A" : "#F4F4F5",
        color: active ? "#FFF" : p.text,
        border: active ? "2px solid transparent" : `2px solid ${p.cardBorder}`,
      }}
      className="rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="text-sm font-semibold">{p.name}</div>
      <div className="text-xs mt-0.5" style={{ opacity: active ? 0.8 : 0.6 }}>{p.description}</div>
      <div className="flex gap-1.5 mt-2">
        <div className="size-4 rounded-full" style={{ background: p.bg, border: `1px solid ${p.cardBorder}` }} />
        <div className="size-4 rounded-full" style={{ background: p.primary }} />
        <div className="size-4 rounded-full" style={{ background: p.gradientTo }} />
        <div className="size-4 rounded-full" style={{ background: p.sectionBgs[1] , border: `1px solid ${p.cardBorder}` }} />
        <div className="size-4 rounded-full" style={{ background: p.sectionBgs[2] , border: `1px solid ${p.cardBorder}` }} />
        <div className="size-4 rounded-full" style={{ background: p.sectionBgs[3] , border: `1px solid ${p.cardBorder}` }} />
      </div>
    </button>
  );
}

function FullPreview({ p }: { p: typeof palettes[PaletteKey] }) {
  return (
    <div
      style={{ background: p.bg, color: p.text }}
      className="rounded-2xl overflow-hidden border transition-all"
      key={p.name}
    >
      {/* ── Nav ── */}
      <div
        style={{
          background: p.mode === "dark" ? "rgba(15,15,17,0.6)" : "rgba(254,252,249,0.8)",
          borderBottom: `1px solid ${p.cardBorder}`,
          backdropFilter: "blur(12px)",
        }}
        className="px-6 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={p.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          <span className="font-bold text-[15px]">
            syllabi<span style={{ color: p.primary }}>.online</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: p.textMuted }}>How it works</span>
          <span className="text-xs" style={{ color: p.textMuted }}>Pricing</span>
          <button
            style={{
              background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`,
              color: "#FFF",
            }}
            className="rounded-full px-4 py-1.5 text-xs font-semibold"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <div style={{ background: p.sectionBgs[0] }} className="px-6 py-16 text-center relative overflow-hidden">
        {/* Glow (only for dark/current) */}
        {p.glow !== "none" && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: p.glow }}
          />
        )}
        <div className="relative z-10">
          <span
            style={{
              background: p.badge.bg,
              color: p.badge.text,
              border: `1px solid ${p.badge.border}`,
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium mb-5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            Now with AI audio narration
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1]">
            Create full courses
            <br />
            <span className="text-[0.6em] font-semibold tracking-wide" style={{ color: p.textMuted }}>
              that sound as good as they look
            </span>
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              in 60 seconds
            </span>
          </h1>

          <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: p.textMuted }}>
            AI generates modules, lessons, quizzes, and audio narration.
            Export to PDF, Notion, or share with a link.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              style={{
                background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`,
                color: "#FFF",
              }}
              className="rounded-full px-6 py-2.5 text-sm font-semibold shadow-lg transition-all hover:scale-[1.02]"
            >
              Generate your first course &rarr;
            </button>
            <button
              style={{
                border: `1px solid ${p.cardBorder}`,
                color: p.text,
                background: "transparent",
              }}
              className="rounded-full px-6 py-2.5 text-sm font-medium"
            >
              See examples
            </button>
          </div>
          <p className="mt-3 text-[11px]" style={{ color: p.textMuted }}>
            No credit card required &middot; 3 free courses
          </p>
        </div>
      </div>

      {/* ── Problem / Solution Cards ── */}
      <div style={{ background: p.sectionBgs[1] }} className="px-6 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-center mb-1.5" style={{ color: p.primary }}>
          Sound familiar?
        </p>
        <h2 className="text-xl font-bold text-center mb-8">Course creation shouldn&apos;t be this hard</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", title: "Looks like everyone else's", desc: "Stunning design and real audio narration that feels professional." },
            { icon: "M12 2a10 10 0 1 0 10 10H12V2z", title: "Nobody finishes courses", desc: "Audio lessons and pacing schedules keep learners engaged." },
            { icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", title: "10-tool nightmare", desc: "One click: complete course, shareable link, all exports." },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: p.card,
                border: `1px solid ${p.cardBorder}`,
              }}
              className="rounded-xl p-4 text-center transition-all hover:shadow-md"
            >
              <div
                className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl"
                style={{ background: p.accentSoft }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={p.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
              </div>
              <h3 className="text-xs font-semibold mb-1">{item.title}</h3>
              <p className="text-[10px] leading-relaxed" style={{ color: p.textMuted }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it Works ── */}
      <div style={{ background: p.sectionBgs[2] }} className="px-6 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-center mb-1.5" style={{ color: p.primary }}>
          Three steps
        </p>
        <h2 className="text-xl font-bold text-center mb-8">How it works</h2>
        <div className="flex items-start gap-4">
          {[
            { num: "01", label: "Describe what you teach", sub: "Enter topic, pick style & depth" },
            { num: "02", label: "AI builds your course", sub: "Modules, quizzes, audio in seconds" },
            { num: "03", label: "Share, teach, or sell", sub: "Link, PDF, Notion — your way" },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`,
                  color: "#FFF",
                }}
              >
                {s.num}
              </div>
              <h3 className="text-xs font-semibold">{s.label}</h3>
              <p className="text-[10px] mt-1" style={{ color: p.textMuted }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing Cards ── */}
      <div style={{ background: p.sectionBgs[3] }} className="px-6 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-center mb-1.5" style={{ color: p.primary }}>
          Simple pricing
        </p>
        <h2 className="text-xl font-bold text-center mb-8">Choose your plan</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "Free", price: "€0", features: ["3 mini-courses", "PDF export", "Shareable links"], highlighted: false },
            { name: "Planner", price: "€29/mo", features: ["15 skeletons/mo", "All export formats", "Priority AI"], highlighted: true },
            { name: "Masterclass", price: "€99/mo", features: ["20 full courses", "Audio narration", "White-label"], highlighted: false },
          ].map((plan, i) => (
            <div
              key={i}
              style={{
                background: plan.highlighted
                  ? `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`
                  : p.card,
                border: plan.highlighted ? "none" : `1px solid ${p.cardBorder}`,
                color: plan.highlighted ? "#FFF" : p.text,
              }}
              className="rounded-xl p-4 transition-all hover:shadow-md"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ opacity: plan.highlighted ? 0.85 : 0.5 }}>
                {plan.name}
              </div>
              <div className="text-2xl font-extrabold mt-1">{plan.price}</div>
              <div className="mt-3 space-y-1.5">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-[10px]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
              </div>
              <button
                className="mt-4 w-full rounded-lg py-1.5 text-[11px] font-semibold transition-all"
                style={{
                  background: plan.highlighted ? "rgba(255,255,255,0.2)" : p.accentSoft,
                  color: plan.highlighted ? "#FFF" : p.primary,
                  border: plan.highlighted ? "1px solid rgba(255,255,255,0.3)" : `1px solid ${p.accentBorder}`,
                }}
              >
                {plan.highlighted ? "Start Planner" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonial ── */}
      <div style={{ background: p.sectionBgs[0] }} className="px-6 py-10">
        <div
          style={{ background: p.card, border: `1px solid ${p.cardBorder}` }}
          className="rounded-xl p-5 max-w-md mx-auto"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}
            >
              SC
            </div>
            <div>
              <div className="text-xs font-semibold">Sarah Chen</div>
              <div className="text-[10px]" style={{ color: p.textMuted }}>Leadership Coach</div>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: p.textMuted }}>
            &ldquo;I hit publish on my first audio course 20 minutes after signing up.
            My students keep telling me it feels like a real product, not an AI thing.&rdquo;
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          background: p.mode === "dark" ? "#09090B" : "#F9FAFB",
          borderTop: `1px solid ${p.cardBorder}`,
        }}
        className="px-6 py-4 flex items-center justify-between"
      >
        <span className="text-[10px]" style={{ color: p.textMuted }}>&copy; 2025 Syllabi. All rights reserved.</span>
        <div className="flex gap-3">
          <span className="text-[10px]" style={{ color: p.textMuted }}>Privacy</span>
          <span className="text-[10px]" style={{ color: p.textMuted }}>Terms</span>
          <span className="text-[10px]" style={{ color: p.textMuted }}>Contact</span>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function PalettePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const [active, setActive] = useState<PaletteKey>("pastelCoral");

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Palette Preview</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Click a palette to see it applied to the full page mockup below.
            This page is local-only — it won&apos;t be deployed.
          </p>
        </div>

        {/* ── Palette Selector ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {(Object.entries(palettes) as [PaletteKey, typeof palettes[PaletteKey]][]).map(([key, p]) => (
            <PalettePreview
              key={key}
              id={key}
              p={p}
              active={active === key}
              onClick={() => setActive(key)}
            />
          ))}
        </div>

        {/* ── Full Preview ── */}
        <FullPreview p={palettes[active]} />

        <p className="text-center text-xs text-zinc-500 mt-6">
          This is a miniaturized preview. Actual implementation will use your existing components with updated CSS variables.
        </p>
      </div>
    </div>
  );
}
