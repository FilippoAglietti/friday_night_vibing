"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Headphones,
  X,
  Minimize2,
  Maximize2,
  ListMusic,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string; // e.g. "Module 1 · Lesson 3"
  duration?: number; // seconds
  url?: string; // audio file URL — null means not yet generated
}

interface AudioPlayerProps {
  tracks: AudioTrack[];
  courseTitle: string;
  /** When true, show as a mini floating bar */
  mini?: boolean;
  onClose?: () => void;
}

/* ─── Helpers ────────────────────────────────────────────── */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ─── Component ──────────────────────────────────────────── */

export default function AudioPlayer({
  tracks,
  courseTitle,
  mini = false,
  onClose,
}: AudioPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [expanded, setExpanded] = useState(!mini);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = tracks[currentIndex];
  const hasAudio = !!current?.url;

  /* ── Audio element handlers ───────────────────────────── */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current?.url) return;

    audio.src = current.url;
    if (isPlaying) audio.play().catch(() => {});

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoadedMeta = () => setDuration(audio.duration);
    const onEnded = () => {
      if (currentIndex < tracks.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, current?.url]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, hasAudio]);

  const seek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !hasAudio) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pct * audio.duration;
    },
    [hasAudio],
  );

  const skipPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const skipNext = () => setCurrentIndex((i) => Math.min(tracks.length - 1, i + 1));

  /* ── Mini player (floating bar) ───────────────────────── */

  if (mini && !expanded) {
    return (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-background/90 px-4 py-3 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">
          {/* Play button */}
          <button
            onClick={togglePlay}
            disabled={!hasAudio}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
          </button>

          {/* Track info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{current?.title || "No track"}</p>
            <p className="truncate text-xs text-muted-foreground">{current?.subtitle}</p>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:block w-24">
            <div className="h-1 rounded-full bg-muted cursor-pointer" onClick={seek}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Expand / Close */}
          <button onClick={() => setExpanded(true)} className="text-muted-foreground hover:text-foreground">
            <Maximize2 className="size-4" />
          </button>
          {onClose && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>
        {hasAudio && <audio ref={audioRef} muted={muted} preload="metadata" />}
      </motion.div>
    );
  }

  /* ── Full player ──────────────────────────────────────── */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.04] via-background to-background backdrop-blur-sm"
    >
      {hasAudio && <audio ref={audioRef} muted={muted} preload="metadata" />}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <Headphones className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">Audio Course</p>
              <p className="text-sm font-medium text-muted-foreground">{courseTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {mini && (
              <button onClick={() => setExpanded(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <Minimize2 className="size-4" />
              </button>
            )}
            <button onClick={() => setShowPlaylist(!showPlaylist)} className={`rounded-lg p-1.5 transition-colors ${showPlaylist ? "text-violet-400 bg-violet-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <ListMusic className="size-4" />
            </button>
            {onClose && (
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Now Playing */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground mb-1">{current?.subtitle || `Track ${currentIndex + 1} of ${tracks.length}`}</p>
          <h3 className="text-lg font-semibold">{current?.title || "Untitled"}</h3>
          {!hasAudio && (
            <p className="mt-2 text-xs text-amber-400/80">
              Audio generation in progress — check back soon
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div
            className="h-1.5 rounded-full bg-muted cursor-pointer group"
            onClick={seek}
          >
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || current?.duration || 0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setMuted(!muted)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>

          <button
            onClick={skipPrev}
            disabled={currentIndex === 0}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <SkipBack className="size-5" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!hasAudio}
            className="flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/25 transition-all hover:scale-105 hover:shadow-violet-500/40 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ml-0.5" />}
          </button>

          <button
            onClick={skipNext}
            disabled={currentIndex === tracks.length - 1}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <SkipForward className="size-5" />
          </button>

          <div className="w-4" /> {/* spacer to balance mute button */}
        </div>
      </div>

      {/* Playlist drawer */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40"
          >
            <div className="max-h-64 overflow-y-auto p-3">
              {tracks.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setCurrentIndex(i);
                    if (t.url) setIsPlaying(true);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    i === currentIndex
                      ? "bg-violet-500/10 text-violet-400"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-muted/60">
                    {i === currentIndex && isPlaying ? (
                      <span className="flex gap-0.5">
                        <span className="inline-block w-0.5 h-2.5 bg-violet-400 rounded-full animate-pulse" />
                        <span className="inline-block w-0.5 h-3.5 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                        <span className="inline-block w-0.5 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                      </span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${i === currentIndex ? "font-semibold" : "font-medium"}`}>
                      {t.title}
                    </p>
                    {t.subtitle && (
                      <p className="truncate text-xs text-muted-foreground">{t.subtitle}</p>
                    )}
                  </div>
                  {t.duration && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatTime(t.duration)}
                    </span>
                  )}
                  {!t.url && (
                    <span className="text-[10px] text-amber-400/70">pending</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
