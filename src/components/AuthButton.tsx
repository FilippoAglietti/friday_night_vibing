"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronDown, BookOpen } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error("Sign in error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabaseBrowser.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    window.location.href = "/";
  }, []);

  // Signed in state
  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 rounded-full px-2 py-1.5 h-auto"
          onClick={() => setMenuOpen(!menuOpen)}
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
          <ChevronDown className="size-3 text-muted-foreground" />
        </Button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl p-1 shadow-xl"
              >
                <div className="px-3 py-2.5 border-b border-border/30 mb-1">
                  <p className="text-xs font-medium truncate">{name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <a
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-foreground hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
                >
                  <BookOpen className="size-3.5" />
                  My Courses
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
      disabled={loading}
    >
      {loading ? (
        <div className="size-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
      ) : (
        <>
          <div className="flex items-center justify-center size-6 rounded-full bg-violet-500/15 text-violet-500">
            <User className="size-3.5" />
          </div>
          <span className="hidden sm:inline">Sign in</span>
        </>
      )}
    </Button>
  );
}
