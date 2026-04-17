"use client";

import {
  FileText,
  Mic,
  Mail,
  Folder,
  Layers,
  Camera,
  Archive,
  TrendingDown,
} from "lucide-react";

/* ─── Pain 1: Sea of identical generic courses ──────────── */

function Pain1Sameness() {
  return (
    <div className="w-full h-[150px] md:h-[170px] flex items-center justify-center px-2">
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-[220px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-rose-500/20 bg-card/40 backdrop-blur-sm p-1.5"
          >
            <div className="flex items-center gap-1 mb-1">
              <div className="size-1.5 rounded-full bg-foreground/25" />
              <div className="h-0.5 w-6 rounded-full bg-foreground/20" />
            </div>
            <div className="space-y-0.5">
              <div className="h-0.5 w-full rounded-full bg-foreground/15" />
              <div className="h-0.5 w-3/4 rounded-full bg-foreground/15" />
              <div className="h-0.5 w-2/3 rounded-full bg-foreground/15" />
            </div>
            <div className="mt-1 text-[7px] uppercase tracking-wider text-muted-foreground/50 truncate">
              Untitled
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pain 2: Flatlined completion chart ─────────────────── */

function Pain2DropOff() {
  return (
    <div className="w-full h-[150px] md:h-[170px] flex flex-col items-center justify-center gap-2 px-4">
      <div className="w-full max-w-[220px] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Completion
        </span>
        <span className="text-sm font-bold text-rose-400 tabular-nums flex items-center gap-1">
          <TrendingDown className="size-3.5" />
          12%
        </span>
      </div>
      <svg viewBox="0 0 220 70" className="w-full max-w-[220px] h-[70px]" aria-hidden>
        <defs>
          <linearGradient id="painDropFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(244 63 94 / 0.28)" />
            <stop offset="100%" stopColor="rgb(244 63 94 / 0)" />
          </linearGradient>
        </defs>
        <line x1="0" y1="65" x2="220" y2="65" stroke="rgb(244 63 94 / 0.2)" strokeWidth="0.5" />
        <path
          d="M 4,6 L 32,9 L 62,20 L 92,40 L 122,54 L 152,60 L 182,63 L 216,65 L 216,70 L 4,70 Z"
          fill="url(#painDropFill)"
        />
        <path
          d="M 4,6 L 32,9 L 62,20 L 92,40 L 122,54 L 152,60 L 182,63 L 216,65"
          stroke="rgb(244 63 94)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4" cy="6" r="2" fill="rgb(244 63 94)" />
        <circle cx="216" cy="65" r="2.5" fill="rgb(244 63 94)" />
      </svg>
      <div className="w-full max-w-[220px] flex justify-between text-[8px] uppercase tracking-wider text-muted-foreground/60">
        <span>Lesson 1</span>
        <span>Lesson 8</span>
      </div>
    </div>
  );
}

/* ─── Pain 3: Tool sprawl ────────────────────────────────── */

const SCATTERED_TOOLS = [
  { Icon: FileText, label: "Outline.gdoc", x: -64, y: -36, rot: -7 },
  { Icon: Layers, label: "Deck.pptx", x: 50, y: -34, rot: 5 },
  { Icon: Mail, label: "Welcome.eml", x: -78, y: 4, rot: -3 },
  { Icon: Folder, label: "/Drive", x: 70, y: 10, rot: 4 },
  { Icon: Mic, label: "Audio.mp3", x: -48, y: 36, rot: 6 },
  { Icon: Camera, label: "Hero.png", x: 56, y: 38, rot: -8 },
  { Icon: Archive, label: "Bundle.zip", x: -4, y: -2, rot: -2 },
] as const;

function Pain3ToolSprawl() {
  return (
    <div className="w-full h-[150px] md:h-[170px] flex items-center justify-center relative">
      {SCATTERED_TOOLS.map(({ Icon, label, x, y, rot }, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute top-1/2 left-1/2 flex items-center gap-1 px-1.5 py-1 rounded-md border border-rose-500/25 bg-card/75 backdrop-blur-sm shadow-sm"
          style={{
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rot}deg)`,
            zIndex: i === SCATTERED_TOOLS.length - 1 ? 10 : i,
          }}
        >
          <Icon className="size-2.5 text-rose-400/80 shrink-0" />
          <span className="text-[8px] font-medium text-foreground/70 whitespace-nowrap">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Public component ─────────────────────────────────── */

export default function PainPointAnimation({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) return <Pain1Sameness />;
  if (step === 2) return <Pain2DropOff />;
  return <Pain3ToolSprawl />;
}
