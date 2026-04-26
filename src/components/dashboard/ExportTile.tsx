"use client";

import { Check, Loader2, Lock, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ExportTileProps {
  Icon: LucideIcon;
  label: string;
  subtitle: string;
  colorClass: string;
  bgClass: string;
  locked?: boolean;
  masterclassOnly?: boolean;
  justClicked?: boolean;
  loading?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ExportTile({
  Icon,
  label,
  subtitle,
  colorClass,
  bgClass,
  locked = false,
  masterclassOnly = false,
  justClicked = false,
  loading = false,
  onClick,
  disabled = false,
}: ExportTileProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`relative flex flex-col items-center justify-center gap-0.5 rounded-md border p-2.5 text-center transition-all ${bgClass} ${locked ? "opacity-55" : "hover:brightness-125"} ${isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
      title={locked ? `${label} — upgrade to unlock` : loading ? `${label} — generating...` : label}
    >
      {justClicked && !loading && (
        <Check className="absolute top-1 left-1 size-3 text-emerald-400" />
      )}
      {masterclassOnly && !locked && (
        <Star className="absolute top-1 right-1 size-2.5 fill-amber-400 text-amber-400" />
      )}
      {locked && (
        <Lock className="absolute top-1 right-1 size-2.5 text-muted-foreground" />
      )}
      {loading ? (
        <Loader2 className={`size-4 animate-spin ${colorClass}`} />
      ) : (
        <Icon className={`size-4 ${locked ? "opacity-40" : ""} ${colorClass}`} />
      )}
      <span className="text-[10px] font-medium text-foreground">{label}</span>
      <span className="text-[8px] text-muted-foreground">
        {loading ? "generating…" : subtitle}
      </span>
    </button>
  );
}
