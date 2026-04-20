"use client";

import { Crown, Sparkles } from "lucide-react";
import type { Tier } from "@/types/pricing";

interface PlanBadgeProps {
  tier: Tier;
  label: string;
}

export function PlanBadge({ tier, label }: PlanBadgeProps) {
  const isMasterclass = tier === "masterclass" || tier === "enterprise";
  const isPlanner = tier === "planner";

  const classes = isMasterclass
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : isPlanner
    ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
    : "bg-muted/40 text-muted-foreground border-border/40";

  const Icon = isMasterclass ? Crown : isPlanner ? Sparkles : null;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase ${classes}`}
    >
      {Icon && <Icon className="size-3" />}
      <span>{label}</span>
    </div>
  );
}
