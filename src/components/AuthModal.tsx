"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Shield, BookOpen, FileText, Clock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { useState } from "react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "signin" | "signup";

const BENEFITS = [
  { icon: BookOpen, text: "Save & revisit your courses" },
  { icon: FileText, text: "Export to PDF, Markdown & Notion" },
  { icon: Clock, text: "Track your generation history" },
];

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  // ── Email / Password ──────────────────────────────────────
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabaseBrowser.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
          },
        });

        if (signUpError) throw signUpError;

        // Supabase returns a fake user with empty identities when the email
        // already exists and email confirmation is enabled. Detect this and
        // show a helpful message instead of the misleading "check your inbox".
        const identities = data?.user?.identities;
        if (identities && identities.length === 0) {
          setError("An account with this email already exists. Try signing in instead.");
          setMode("signin");
          return;
        }

        // If Supabase returned a session directly, the user is confirmed
        // (e.g. email confirmation is disabled in project settings).
        if (data?.session) {
          onClose();
          window.location.href = "/profile?welcome=true&onboarding=true";
          return;
        }

        setSuccess(
          "Account created! Check your inbox and click the confirmation link to activate it."
        );
      } else {
        const { error: signInError } =
          await supabaseBrowser.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (signInError) throw signInError;

        onClose();
        window.location.href = "/profile?welcome=true";
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Try again.";

      if (msg.includes("Invalid login credentials")) {
        setError("Wrong email or password.");
      } else if (msg.includes("User already registered")) {
        setError("Account already exists. Sign in instead.");
        switchMode("signin");
      } else if (msg.includes("Email not confirmed")) {
        setError("Please confirm your email before signing in. Check your inbox (and spam folder).");
      } else if (msg.includes("Password should be")) {
        setError("Password must be at least 6 characters.");
      } else if (msg.includes("Email rate limit exceeded") || msg.includes("rate limit")) {
        setError("Too many attempts. Please wait a minute and try again.");
      } else if (msg.includes("Signups not allowed") || msg.includes("signups not allowed")) {
        setError("Sign-ups are temporarily disabled. Please try again later or use Google sign-in.");
      } else if (msg.includes("Unable to validate email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ──────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        },
      });
      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("provider is not enabled") || msg.includes("Unsupported provider")) {
        setError("Google sign-in is not available yet. Please use email & password.");
      } else {
        setError("Google sign-in failed. Please try email & password instead.");
      }
      setGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          >
            <div className="relative w-[92%] sm:w-full max-w-sm rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Close sign-in modal"
              >
                <X className="size-5" />
              </button>

              <div className="flex flex-col items-center px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
                {/* Icon */}
                <div className="flex items-center justify-center size-14 rounded-2xl bg-violet-500/10 mb-4">
                  <Shield className="size-7 text-violet-500" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold tracking-tight text-center">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground text-center max-w-xs">
                  {mode === "signin"
                    ? "Sign in to access your courses and history."
                    : "Free account · No credit card required."}
                </p>

                {/* Benefits (signup only) */}
                {mode === "signup" && (
                  <div className="w-full mt-4 space-y-2">
                    {BENEFITS.map(({ icon: Icon, text }, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground"
                      >
                        <Icon className="size-4 text-violet-500 shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="mt-5 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 text-center">
                    {success}
                  </div>
                )}

                {/* Email/Password Form */}
                {!success && (
                  <form onSubmit={handleEmailAuth} className="w-full mt-5 space-y-3">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full h-10 rounded-xl border border-border/60 bg-muted/40 px-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                    />

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        minLength={6}
                        className="w-full h-10 rounded-xl border border-border/60 bg-muted/40 px-4 pr-10 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 text-center">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : mode === "signup" ? (
                        "Create account"
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                )}

                {/* Divider */}
                {!success && (
                  <div className="flex items-center gap-3 w-full my-4">
                    <div className="h-px flex-1 bg-border/40" />
                    <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">or</span>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                )}

                {/* Google */}
                {!success && (
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    variant="outline"
                    className="w-full h-10 rounded-full border-border/60 bg-white/5 hover:bg-white/10 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {googleLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="size-4 mr-2" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                )}

                {/* Toggle mode */}
                {!success && (
                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    {mode === "signin" ? (
                      <>
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("signup")}
                          className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                        >
                          Sign up free
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("signin")}
                          className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                )}

                <p className="mt-3 text-[10px] text-muted-foreground/50 text-center">
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
