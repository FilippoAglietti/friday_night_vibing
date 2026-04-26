"use client";

/**
 * components/profile/BrandingSection.tsx
 * ─────────────────────────────────────────────────────────────
 * Settings card on /profile?tab=settings — lets the creator set the
 * brand display name + logo that appear on every generated course.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload, Trash2, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface BrandingSectionProps {
  initialDisplayName: string | null;
  initialLogoUrl: string | null;
  /** Account's full_name — shown as fallback hint when display name is blank. */
  fallbackName: string | null;
}

const MAX_NAME_LEN = 80;
const MAX_BYTES = 2 * 1024 * 1024;

export default function BrandingSection({
  initialDisplayName,
  initialLogoUrl,
  fallbackName,
}: BrandingSectionProps) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [savedDisplayName, setSavedDisplayName] = useState(initialDisplayName ?? "");
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(initialDisplayName ?? "");
    setSavedDisplayName(initialDisplayName ?? "");
  }, [initialDisplayName]);

  useEffect(() => {
    setLogoUrl(initialLogoUrl);
  }, [initialLogoUrl]);

  const dirty = displayName.trim() !== savedDisplayName.trim();

  async function saveName() {
    if (!dirty || savingName) return;
    if (displayName.length > MAX_NAME_LEN) {
      toast(`Name must be ${MAX_NAME_LEN} characters or fewer.`, "error");
      return;
    }
    setSavingName(true);
    try {
      const value = displayName.trim().length === 0 ? null : displayName.trim();
      const res = await fetch("/api/profile/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branding_display_name: value }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        toast(body?.error ?? "Couldn't save name.", "error");
        return;
      }
      const body = (await res.json()) as { branding_display_name: string | null };
      setSavedDisplayName(body.branding_display_name ?? "");
      setDisplayName(body.branding_display_name ?? "");
      toast("Display name saved", "success");
    } catch {
      toast("Couldn't save name.", "error");
    } finally {
      setSavingName(false);
    }
  }

  async function handleFileChosen(file: File) {
    if (file.size > MAX_BYTES) {
      toast("File too large. Max 2 MB.", "error");
      return;
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast("Use a PNG or JPG.", "error");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("logo", file);
      const res = await fetch("/api/profile/logo", { method: "POST", body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        toast(body?.error ?? "Upload failed.", "error");
        return;
      }
      const body = (await res.json()) as { branding_logo_url: string };
      setLogoUrl(body.branding_logo_url);
      toast("Logo uploaded", "success");
    } catch {
      toast("Upload failed.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeLogo() {
    if (removing) return;
    setRemoving(true);
    try {
      const res = await fetch("/api/profile/logo", { method: "DELETE" });
      if (!res.ok) {
        toast("Couldn't remove logo.", "error");
        return;
      }
      setLogoUrl(null);
      toast("Logo removed", "success");
    } catch {
      toast("Couldn't remove logo.", "error");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8">
      <header className="mb-6">
        <h3 className="text-lg font-semibold text-white">Branding</h3>
        <p className="text-sm text-slate-400 mt-1">
          Appears on the cover of every course you generate.
        </p>
      </header>

      <div className="space-y-6">
        {/* Display name */}
        <div>
          <label
            htmlFor="branding-display-name"
            className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider"
          >
            Display name
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="branding-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={fallbackName ?? "Your brand name"}
              maxLength={MAX_NAME_LEN}
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 text-sm"
            />
            <button
              type="button"
              onClick={saveName}
              disabled={!dirty || savingName}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-200 text-sm font-medium hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {savingName ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {fallbackName
              ? `Falls back to "${fallbackName}" if blank.`
              : "Falls back to your account name if blank."}
          </p>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
            Logo
          </label>
          <div className="flex items-start gap-4">
            <div className="size-20 sm:size-24 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Brand logo"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <ImageIcon className="size-8 text-slate-600" />
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFileChosen(f);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {logoUrl ? "Replace logo" : "Upload logo"}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={removeLogo}
                  disabled={removing}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-rose-300 hover:bg-rose-500/10 text-sm font-medium disabled:opacity-40 transition-colors w-full sm:w-auto"
                >
                  {removing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Remove
                </button>
              )}
              <p className="text-xs text-slate-500">
                PNG or JPG · 2 MB max · 512×512 recommended
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
