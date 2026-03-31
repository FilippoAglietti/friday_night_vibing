"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Shield, BookOpen, FileText, Clock } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { useState } from "react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
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
      setLoading(false);
    }
  };

  const benefits = [
    { icon: BookOpen, text: "Save & revisit your courses" },
    { icon: FileText, text: "Export to PDF, Markdown & Notion" },
    { icon: Clock, text: "Track your generation history" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="size-5" />
              </button>

              <div className="flex flex-col items-center px-8 pt-10 pb-8">
                <div className="flex items-center justify-center size-14 rounded-2xl bg-violet-500/10 mb-5">
                  <Shield className="size-7 text-violet-500" />
                </div>

                <h2 className="text-xl font-bold tracking-tight text-center">
                  Sign in to generate
                </h2>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
                  Create a free account to start generating courses. Your work is saved automatically.
                </p>

                {/* Benefits */}
                <div className="w-full mt-5 space-y-2.5">
                  {benefits.map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Icon className="size-4 text-violet-500 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Google sign-in button */}
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="mt-6 w-full h-11 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-semibold border border-gray-200 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="size-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="size-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                <p className="mt-5 text-[10px] text-muted-foreground/60 text-center">
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
