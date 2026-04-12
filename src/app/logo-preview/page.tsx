"use client";

import { useState } from "react";

/* ── Logo Concepts ─────────────────────────────────────── */

/** Concept A: "The Stack" — Three layered pages with depth */
function LogoStack({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#stackGrad)" />
      {/* Bottom page */}
      <rect x="100" y="160" width="280" height="240" rx="16" fill="white" opacity="0.3" transform="rotate(-6, 240, 280)" />
      {/* Middle page */}
      <rect x="110" y="140" width="280" height="240" rx="16" fill="white" opacity="0.55" transform="rotate(-2, 250, 260)" />
      {/* Top page */}
      <rect x="120" y="120" width="280" height="240" rx="16" fill="white" opacity="0.95" transform="rotate(2, 260, 240)" />
      {/* Lines on top page */}
      <g transform="rotate(2, 260, 240)">
        <rect x="155" y="168" width="160" height="8" rx="4" fill="#7C3AED" opacity="0.6" />
        <rect x="155" y="196" width="210" height="6" rx="3" fill="#7C3AED" opacity="0.2" />
        <rect x="155" y="216" width="190" height="6" rx="3" fill="#7C3AED" opacity="0.2" />
        <rect x="155" y="236" width="200" height="6" rx="3" fill="#7C3AED" opacity="0.2" />
        <rect x="155" y="272" width="140" height="8" rx="4" fill="#7C3AED" opacity="0.45" />
        <rect x="155" y="300" width="180" height="6" rx="3" fill="#7C3AED" opacity="0.2" />
        <rect x="155" y="320" width="160" height="6" rx="3" fill="#7C3AED" opacity="0.2" />
      </g>
      {/* Spark */}
      <circle cx="380" cy="140" r="20" fill="#FCD34D" opacity="0.9" />
      <circle cx="380" cy="140" r="32" fill="#FCD34D" opacity="0.2" />
    </svg>
  );
}

/** Concept B: "The Prism S" — Geometric S made of two interlocking shapes */
function LogoPrismS({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#prismGrad)" />
      {/* Upper curve of S — flows right */}
      <path
        d="M160,160 C160,120 200,100 256,100 C340,100 370,140 370,180 C370,220 330,250 256,256"
        fill="none" stroke="white" strokeWidth="48" strokeLinecap="round" opacity="0.95"
      />
      {/* Lower curve of S — flows left */}
      <path
        d="M256,256 C180,262 142,292 142,332 C142,372 172,412 256,412 C312,412 352,392 352,352"
        fill="none" stroke="white" strokeWidth="48" strokeLinecap="round" opacity="0.95"
      />
      {/* Spark at top */}
      <circle cx="370" cy="108" r="16" fill="#FCD34D" opacity="0.9" />
    </svg>
  );
}

/** Concept C: "Module Grid" — Grid of rounded squares, one glowing */
function LogoModuleGrid({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#gridGrad)" />
      {/* 3x3 grid of rounded squares */}
      {[0, 1, 2].map(row =>
        [0, 1, 2].map(col => {
          const x = 100 + col * 115;
          const y = 100 + row * 115;
          const isActive = row === 0 && col === 0;
          const isSecondary = (row === 0 && col === 1) || (row === 1 && col === 0);
          return (
            <rect
              key={`${row}-${col}`}
              x={x} y={y}
              width="90" height="90"
              rx="18"
              fill="white"
              opacity={isActive ? 0.95 : isSecondary ? 0.5 : 0.2}
            />
          );
        })
      )}
      {/* Spark on active cell */}
      <circle cx="145" cy="145" r="12" fill="#FCD34D" opacity="0.9" />
    </svg>
  );
}

/** Concept D: "Open Book" — Minimal open book with glow */
function LogoOpenBook({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#bookGrad)" />
      {/* Left page */}
      <path
        d="M256,160 L256,380 C220,360 160,350 100,360 L100,180 C160,165 220,170 256,160Z"
        fill="white" opacity="0.9"
      />
      {/* Right page */}
      <path
        d="M256,160 L256,380 C292,360 352,350 412,360 L412,180 C352,165 292,170 256,160Z"
        fill="white" opacity="0.7"
      />
      {/* Text lines on left page */}
      <line x1="130" y1="210" x2="230" y2="205" stroke="#7C3AED" strokeWidth="6" opacity="0.3" strokeLinecap="round" />
      <line x1="130" y1="235" x2="240" y2="230" stroke="#7C3AED" strokeWidth="5" opacity="0.2" strokeLinecap="round" />
      <line x1="130" y1="258" x2="235" y2="253" stroke="#7C3AED" strokeWidth="5" opacity="0.2" strokeLinecap="round" />
      <line x1="130" y1="281" x2="220" y2="276" stroke="#7C3AED" strokeWidth="5" opacity="0.2" strokeLinecap="round" />
      {/* Spark above */}
      <g transform="translate(256, 120)">
        <path d="M0,-28 L6,-6 L28,0 L6,6 L0,28 L-6,6 L-28,0 L-6,-6 Z" fill="#FCD34D" opacity="0.9" />
      </g>
    </svg>
  );
}

/** Concept E: "Layers" — Horizontal stacked layers with depth */
function LogoLayers({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="layersGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#layersGrad)" />
      {/* Layer 1 (bottom) */}
      <path d="M256,340 L100,260 L256,180 L412,260 Z" fill="white" opacity="0.25" />
      {/* Layer 2 (middle) */}
      <path d="M256,290 L100,210 L256,130 L412,210 Z" fill="white" opacity="0.55" />
      {/* Layer 3 (top) */}
      <path d="M256,240 L100,160 L256,80 L412,160 Z" fill="white" opacity="0.95" />
      {/* Vertical connector */}
      <line x1="256" y1="160" x2="256" y2="340" stroke="white" strokeWidth="4" opacity="0.3" />
      {/* Spark */}
      <circle cx="380" cy="110" r="18" fill="#FCD34D" opacity="0.85" />
      <circle cx="380" cy="110" r="28" fill="#FCD34D" opacity="0.15" />
    </svg>
  );
}

/** Concept F: "Folded Page" — Single page with corner fold and content */
function LogoFoldedPage({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="foldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#foldGrad)" />
      {/* Page body */}
      <path
        d="M120,80 L340,80 L400,140 L400,432 L120,432 Z"
        fill="white" opacity="0.95"
      />
      {/* Fold triangle */}
      <path
        d="M340,80 L400,140 L340,140 Z"
        fill="white" opacity="0.6"
      />
      {/* Content lines */}
      <rect x="160" y="170" width="180" height="10" rx="5" fill="#7C3AED" opacity="0.5" />
      <rect x="160" y="205" width="200" height="7" rx="3.5" fill="#7C3AED" opacity="0.15" />
      <rect x="160" y="228" width="180" height="7" rx="3.5" fill="#7C3AED" opacity="0.15" />
      <rect x="160" y="251" width="190" height="7" rx="3.5" fill="#7C3AED" opacity="0.15" />
      {/* Section 2 */}
      <rect x="160" y="295" width="150" height="10" rx="5" fill="#7C3AED" opacity="0.4" />
      <rect x="160" y="330" width="200" height="7" rx="3.5" fill="#7C3AED" opacity="0.15" />
      <rect x="160" y="353" width="170" height="7" rx="3.5" fill="#7C3AED" opacity="0.15" />
      <rect x="160" y="376" width="185" height="7" rx="3.5" fill="#7C3AED" opacity="0.15" />
      {/* Spark */}
      <circle cx="395" cy="88" r="22" fill="#FCD34D" opacity="0.85" />
      <circle cx="395" cy="88" r="36" fill="#FCD34D" opacity="0.15" />
    </svg>
  );
}

/* ── Preview Page ─────────────────────────────────────── */

const logos = [
  { id: "stack", name: "The Stack", desc: "Layered pages — structure and depth", Component: LogoStack },
  { id: "prism-s", name: "The S", desc: "Geometric S — bold and memorable", Component: LogoPrismS },
  { id: "grid", name: "Module Grid", desc: "3x3 grid — modular learning", Component: LogoModuleGrid },
  { id: "book", name: "Open Book", desc: "Classic book with AI spark", Component: LogoOpenBook },
  { id: "layers", name: "Layers", desc: "Stacked layers — structured knowledge", Component: LogoLayers },
  { id: "folded", name: "Folded Page", desc: "Single page — clean, editorial", Component: LogoFoldedPage },
];

export default function LogoPreview() {
  const [selected, setSelected] = useState("stack");
  const activeLogo = logos.find(l => l.id === selected)!;

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Logo Concepts</h1>
        <p className="text-sm text-zinc-400 mb-8">Click to select. Preview shows favicon, nav bar, and social sizes.</p>

        {/* ── Grid of concepts ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {logos.map(({ id, name, desc, Component }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`rounded-xl p-4 text-center transition-all hover:scale-[1.03] active:scale-[0.97] ${
                selected === id
                  ? "bg-violet-600 ring-2 ring-violet-400"
                  : "bg-zinc-900 ring-1 ring-zinc-800 hover:ring-zinc-700"
              }`}
            >
              <div className="flex justify-center mb-3">
                <Component size={56} />
              </div>
              <div className="text-xs font-semibold">{name}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        {/* ── Preview Contexts ── */}
        <div className="space-y-8">

          {/* Size scale */}
          <div className="rounded-xl bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Size Scale</h2>
            <div className="flex items-end gap-6">
              {[16, 24, 32, 48, 64, 96, 128].map(s => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <activeLogo.Component size={s} />
                  <span className="text-[10px] text-zinc-500">{s}px</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nav bar preview (dark) */}
          <div className="rounded-xl bg-zinc-900 p-1">
            <div className="rounded-lg bg-[#0F0F11] border border-zinc-800 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <activeLogo.Component size={28} />
                <span className="font-bold text-[15px] tracking-tight">
                  syllabi<span className="text-violet-400">.online</span>
                </span>
              </div>
              <div className="flex items-center gap-5 text-xs text-zinc-400">
                <span>How it works</span>
                <span>Pricing</span>
                <span>Tutorial</span>
                <button className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white">
                  Get Started Free
                </button>
              </div>
            </div>
          </div>

          {/* Nav bar preview (light) */}
          <div className="rounded-xl bg-zinc-900 p-1">
            <div className="rounded-lg bg-white border border-zinc-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <activeLogo.Component size={28} />
                <span className="font-bold text-[15px] tracking-tight text-zinc-900">
                  syllabi<span className="text-violet-600">.online</span>
                </span>
              </div>
              <div className="flex items-center gap-5 text-xs text-zinc-500">
                <span>How it works</span>
                <span>Pricing</span>
                <span>Tutorial</span>
                <button className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white">
                  Get Started Free
                </button>
              </div>
            </div>
          </div>

          {/* Social profile preview */}
          <div className="rounded-xl bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Social Profile</h2>
            <div className="flex items-start gap-8">
              {/* Twitter-style card */}
              <div className="bg-black rounded-xl p-4 w-72 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-full overflow-hidden">
                    <activeLogo.Component size={48} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Syllabi</div>
                    <div className="text-xs text-zinc-500">@syllabi_ai</div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-300 leading-relaxed">
                  AI course generator — create full courses with audio, quizzes, and export in 60 seconds.
                </p>
              </div>

              {/* App icon grid */}
              <div>
                <div className="text-xs text-zinc-500 mb-3">App Icon (rounded)</div>
                <div className="flex gap-4">
                  <div className="rounded-[22%] overflow-hidden shadow-lg">
                    <activeLogo.Component size={80} />
                  </div>
                  <div className="rounded-[22%] overflow-hidden shadow-lg">
                    <activeLogo.Component size={60} />
                  </div>
                  <div className="rounded-[22%] overflow-hidden shadow-lg">
                    <activeLogo.Component size={40} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Favicon in browser tab mockup */}
          <div className="rounded-xl bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Browser Tab</h2>
            <div className="bg-zinc-800 rounded-t-lg inline-flex items-center gap-2 px-3 py-2 pr-8 border-b border-zinc-700">
              <activeLogo.Component size={16} />
              <span className="text-xs text-zinc-300">Syllabi — AI Course Generator</span>
              <span className="text-zinc-600 text-xs ml-2">×</span>
            </div>
          </div>

          {/* On OG image preview */}
          <div className="rounded-xl bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">OG Image / Social Card</h2>
            <div
              className="rounded-xl overflow-hidden w-full max-w-lg"
              style={{
                background: "linear-gradient(135deg, #1E1B4B, #312E81, #4C1D95)",
                aspectRatio: "1200/630",
              }}
            >
              <div className="h-full flex flex-col items-center justify-center px-8 text-center">
                <activeLogo.Component size={64} />
                <h3 className="mt-4 text-xl font-extrabold text-white">Machine Learning Fundamentals</h3>
                <p className="mt-1 text-xs text-violet-200/70">8 modules &middot; 42 lessons &middot; Intermediate</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <activeLogo.Component size={14} />
                  <span className="text-[10px] font-semibold text-violet-200/50">syllabi.online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-8">
          Local preview only. Tell me which one you like and I&apos;ll integrate it across the site.
        </p>
      </div>
    </div>
  );
}
