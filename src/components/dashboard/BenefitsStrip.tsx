"use client";

import { Zap, FileText, FileDown, Link2, Headphones, Presentation, GraduationCap, Code2 } from "lucide-react";
import type { Tier } from "@/types/pricing";

interface BenefitsStripProps {
  tier: Tier;
  creditsUsed: number;
  creditsLimit: number;
  onUpgrade?: () => void;
}

export function BenefitsStrip({ tier, creditsUsed, creditsLimit, onUpgrade }: BenefitsStripProps) {
  const creditsLabel =
    creditsLimit < 0
      ? "unlimited"
      : `${Math.max(0, creditsLimit - creditsUsed)} of ${creditsLimit}`;

  if (tier === "masterclass" || tier === "enterprise") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-amber-500/15 bg-amber-500/5 px-4 py-2.5 text-[11px] text-amber-200/90">
        <span className="inline-flex items-center gap-1.5"><Zap className="size-3.5 text-amber-400" />{creditsLabel} credits</span>
        <span className="inline-flex items-center gap-1.5"><Headphones className="size-3.5 text-orange-400" />NLM podcasts</span>
        <span className="inline-flex items-center gap-1.5"><Presentation className="size-3.5 text-pink-400" />NLM slide decks</span>
        <span className="inline-flex items-center gap-1.5"><GraduationCap className="size-3.5 text-emerald-400" />SCORM unlocked</span>
      </div>
    );
  }

  if (tier === "planner") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-violet-500/15 bg-violet-500/5 px-4 py-2.5 text-[11px] text-violet-200/90">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5"><Zap className="size-3.5 text-violet-400" />{creditsLabel} skeletons</span>
          <span className="inline-flex items-center gap-1.5"><FileText className="size-3.5 text-violet-400" />PDF</span>
          <span className="inline-flex items-center gap-1.5"><FileDown className="size-3.5 text-blue-400" />Word</span>
          <span className="inline-flex items-center gap-1.5"><Link2 className="size-3.5 text-cyan-400" />Share</span>
        </div>
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-1 text-[10px] font-medium text-white hover:opacity-90 transition-opacity"
        >
          Upgrade → NLM €10
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-border/40 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1.5"><Zap className="size-3.5" />{creditsLabel} skeleton</span>
        <span className="inline-flex items-center gap-1.5"><FileText className="size-3.5" />PDF</span>
        <span className="inline-flex items-center gap-1.5"><Code2 className="size-3.5" />Markdown</span>
        <span className="inline-flex items-center gap-1.5"><Link2 className="size-3.5" />Share</span>
      </div>
      <button
        type="button"
        onClick={onUpgrade}
        className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-1 text-[10px] font-medium text-white hover:opacity-90 transition-opacity"
      >
        See plans →
      </button>
    </div>
  );
}
