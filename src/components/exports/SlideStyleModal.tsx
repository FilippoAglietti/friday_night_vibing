"use client";

import { useState } from "react";
import { GraduationCap, MessagesSquare, Presentation, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SLIDE_STYLES, type SlideStyle } from "@/lib/exports/generateNotebookLMSlidesMarkdown";

interface SlideStyleModalProps {
  open: boolean;
  defaultStyle?: SlideStyle;
  onSelect: (style: SlideStyle) => void;
  onClose: () => void;
}

const ICONS: Record<SlideStyle, LucideIcon> = {
  academic: GraduationCap,
  conversational: MessagesSquare,
  executive: Presentation,
};

export default function SlideStyleModal({ open, defaultStyle, onSelect, onClose }: SlideStyleModalProps) {
  const [picked, setPicked] = useState<SlideStyle>(defaultStyle ?? "conversational");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Pick a presentation style</h2>
            <p className="mt-1 text-xs text-slate-400">
              Slides are generated for Marp / NotebookLM / Slidev. The style shapes tone, bullet density &amp; speaker-note guidance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2">
          {SLIDE_STYLES.map((s) => {
            const Icon = ICONS[s.id];
            const active = picked === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setPicked(s.id)}
                className={`w-full text-left flex items-start gap-3 rounded-lg border px-3 py-3 transition-colors ${
                  active
                    ? "border-violet-500/60 bg-violet-500/10"
                    : "border-white/10 bg-white/5 hover:border-violet-500/30 hover:bg-white/10"
                }`}
              >
                <div className={`shrink-0 mt-0.5 rounded-md p-1.5 ${active ? "bg-violet-500/20 text-violet-200" : "bg-white/5 text-slate-300"}`}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white">{s.label}</div>
                  <p className="mt-0.5 text-[11px] text-slate-400">{s.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelect(picked)}
            className="rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Download {picked} slides
          </button>
        </div>
      </div>
    </div>
  );
}
