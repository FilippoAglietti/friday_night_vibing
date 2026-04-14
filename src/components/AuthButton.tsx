"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, LogOut, ChevronDown } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Dispatch a custom event that page.tsx listens to and opens AuthModal
  const handleSignIn = useCallback(() => {
    window.dispatchEvent(new CustomEvent("syllabi:open-auth"));
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabaseBrowser.auth.signOut();
    setMenuOpen(false);
    window.location.href = "/";
  }, []);

  // Signed in state — clicking the name/avatar goes straight to the dashboard.
  // A small chevron opens a minimal overflow menu for Sign out.
  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

    return (
      <div ref={menuRef} className="relative flex items-center">
        <Link
          href="/profile"
          prefetch
          className="flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 hover:bg-violet-500/10 transition-colors"
          aria-label="Open dashboard"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="size-7 rounded-full ring-2 ring-violet-500/30"
            />
          ) : (
            <div className="flex items-center justify-center size-7 rounded-full bg-violet-500/20 text-violet-500 ring-2 ring-violet-500/30">
              <User className="size-3.5" />
            </div>
          )}
          <span className="text-xs font-medium hidden sm:inline max-w-[100px] truncate">
            {name}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="ml-0.5 flex items-center justify-center size-7 rounded-full text-muted-foreground hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
        >
          <ChevronDown className={`size-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/20 py-1.5 z-50"
          >
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  // Signed out state — User icon instead of Google logo
  return (
    <Button
      id="auth-sign-in"
      variant="ghost"
      size="sm"
      className="rounded-full text-xs font-medium gap-1.5 hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
      onClick={handleSignIn}
    >
      <>
        <div className="flex items-center justify-center size-6 rounded-full bg-violet-500/15 text-violet-500">
          <User className="size-3.5" />
        </div>
        <span className="hidden sm:inline">Sign in</span>
      </>
    </Button>
  );
}
