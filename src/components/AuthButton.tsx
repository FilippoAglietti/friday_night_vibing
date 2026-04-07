"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

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

  // Dispatch a custom event that page.tsx listens to and opens AuthModal
  const handleSignIn = useCallback(() => {
    window.dispatchEvent(new CustomEvent("syllabi:open-auth"));
  }, []);

  // Signed in state — clicking avatar goes straight to dashboard
  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

    return (
      <a
        href="/profile"
        className="flex items-center gap-2 rounded-full px-2 py-1.5 h-auto hover:bg-violet-500/10 transition-colors"
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
      </a>
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
