"use client";

import { useState } from "react";
import { FileText, FileDown, Code2, FileCode, GraduationCap, Headphones, Presentation, Link2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tier } from "@/types/pricing";
import { ExportTile } from "./ExportTile";

export type ExportFormat =
  | "pdf"
  | "word"
  | "markdown"
  | "notion"
  | "scorm"
  | "nlmAudio"
  | "nlmSlides"
  | "share";

export interface ExportGridProps {
  tier: Tier;
  onExport: (format: ExportFormat) => void;
  onLockedClick: (format: ExportFormat) => void;
  onDeepLink?: () => void;
  compact?: boolean;
}

interface TileConfig {
  format: ExportFormat;
  Icon: LucideIcon;
  label: string;
  subtitle: string;
  colorClass: string;
  bgClass: string;
  minTier: "free" | "planner" | "masterclass";
  masterclassOnly?: boolean;
}

const TILES: TileConfig[] = [
  { format: "pdf",       Icon: FileText,       label: "PDF",        subtitle: "Printable",  colorClass: "text-violet-400",  bgClass: "bg-violet-500/6 border-violet-500/20",    minTier: "free" },
  { format: "word",      Icon: FileDown,       label: "Word",       subtitle: ".docx",      colorClass: "text-blue-400",    bgClass: "bg-blue-500/6 border-blue-500/20",        minTier: "planner" },
  { format: "markdown",  Icon: Code2,          label: "Markdown",   subtitle: "Plain text", colorClass: "text-slate-300",   bgClass: "bg-slate-500/6 border-slate-500/20",      minTier: "free" },
  { format: "notion",    Icon: FileCode,       label: "Notion",     subtitle: "Copy HTML",  colorClass: "text-purple-400",  bgClass: "bg-purple-500/6 border-purple-500/20",    minTier: "planner" },
  { format: "scorm",     Icon: GraduationCap,  label: "SCORM",      subtitle: "LMS-ready",  colorClass: "text-emerald-400", bgClass: "bg-emerald-500/6 border-emerald-500/20",  minTier: "masterclass" },
  { format: "nlmAudio",  Icon: Headphones,     label: "NLM Audio",  subtitle: "Podcast",    colorClass: "text-orange-400",  bgClass: "bg-orange-500/6 border-orange-500/20",    minTier: "masterclass", masterclassOnly: true },
  { format: "nlmSlides", Icon: Presentation,   label: "NLM Slides", subtitle: "Marp deck",  colorClass: "text-pink-400",    bgClass: "bg-pink-500/6 border-pink-500/20",        minTier: "masterclass", masterclassOnly: true },
  { format: "share",     Icon: Link2,          label: "Share",      subtitle: "Public URL", colorClass: "text-cyan-400",    bgClass: "bg-cyan-500/6 border-cyan-500/20",        minTier: "free" },
];

function isUnlocked(minTier: "free" | "planner" | "masterclass", tier: Tier): boolean {
  if (minTier === "free") return true;
  if (minTier === "planner") return tier === "planner" || tier === "masterclass" || tier === "enterprise";
  return tier === "masterclass" || tier === "enterprise";
}

export function ExportGrid({ tier, onExport, onLockedClick, onDeepLink }: ExportGridProps) {
  const [recentFormat, setRecentFormat] = useState<ExportFormat | null>(null);
  const isMasterclass = tier === "masterclass" || tier === "enterprise";
  const isPlanner = tier === "planner";

  let upgradeStrip: { text: string; cta: string; target: ExportFormat } | null = null;
  if (isPlanner) {
    upgradeStrip = { text: "Unlock NLM Audio, Slides & SCORM", cta: "Upgrade €10 →", target: "nlmAudio" };
  } else if (!isMasterclass) {
    upgradeStrip = { text: "Unlock all export formats · Word · Notion · SCORM · NLM Audio & Slides", cta: "See plans →", target: "nlmAudio" };
  }

  return (
    <div className="space-y-2.5">
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        {TILES.map((t) => {
          const unlocked = isUnlocked(t.minTier, tier);
          return (
            <ExportTile
              key={t.format}
              Icon={t.Icon}
              label={t.label}
              subtitle={t.subtitle}
              colorClass={t.colorClass}
              bgClass={t.bgClass}
              locked={!unlocked}
              masterclassOnly={t.masterclassOnly}
              justClicked={recentFormat === t.format}
              onClick={() => {
                if (unlocked) {
                  onExport(t.format);
                  setRecentFormat(t.format);
                  setTimeout(() => {
                    setRecentFormat((cur) => (cur === t.format ? null : cur));
                  }, 1500);
                } else {
                  onLockedClick(t.format);
                }
              }}
            />
          );
        })}
      </div>

      {upgradeStrip && (
        <button
          type="button"
          onClick={() => onLockedClick(upgradeStrip!.target)}
          className="flex w-full items-center justify-between gap-3 rounded-md border border-violet-500/20 bg-gradient-to-r from-violet-500/8 to-fuchsia-500/8 px-3 py-2 text-[11px] text-violet-200 hover:from-violet-500/12 hover:to-fuchsia-500/12 transition-colors"
        >
          <span className="text-left">{upgradeStrip.text}</span>
          <span className="shrink-0 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white">
            {upgradeStrip.cta}
          </span>
        </button>
      )}

      {onDeepLink && (
        <div className="text-right">
          <button
            type="button"
            onClick={onDeepLink}
            className="text-[10px] text-muted-foreground hover:text-violet-400 transition-colors"
          >
            Full toolbar with speaker notes &amp; metadata → Open course view
          </button>
        </div>
      )}
    </div>
  );
}
