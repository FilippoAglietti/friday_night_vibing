"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Shield, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { useState } from "react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onContinueAnonymous?: () => void;
}

type AuthMode = "signin" | "signup";

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabaseBrowser.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (signUpError) throw signUpError;
        setSuccess("Account created! You're now signed in.");
        setTimeout(() => { onClose(); window.location.reload(); }, 1200);
      } else {
        const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onClose();
        window.location.reload();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (msg.includes("Invalid login credentials")) {
        setError("Wrong email or password.");
      } else if (msg.includes("User already registered")) {
        setError("Account already exists. Sign in instead.");
        setMode("signin");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (err) {
      console.error("Google sign in error:", err);
      setLoading(false);
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
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="size-5" />
              </button>

              <div className="flex flex-col items-center px-8 pt-10 pb-8">
                {/* Icon */}
                <div className="flex items-center justify-center size-14 rounded-2xl bg-violet-500/10 mb-5">
                  <Shield className="size-7 text-violet-500" />
                </div>

                <h2 className="text-xl font-bold tracking-tight text-center">
                  {mode === "signup" ? "Create your account" : "Welcome back"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
                  {mode === "signup"
                    ? "Sign up free and generate your first course in seconds."
                    : "Sign in to access your courses and generations."}
                </p>

                {/* Mode toggle */}
                <div className="flex mt-5 w-full rounded-xl bg-muted/50 p-1 gap-1">
                  <button
                    onClick={() => switchMode("signup")}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      mode === "signup"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign up
                  </button>
                  <button
                    onClick={() => switchMode("signin")}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      mode === "signin"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign in
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full mt-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-email" className="text-xs font-medium text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-10 rounded-xl border-border/60 bg-muted/30 focus:border-violet-500 focus:ring-violet-500/20"
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="auth-password" className="text-xs font-medium text-muted-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 h-10 rounded-xl border-border/60 bg-muted/30 focus:border-violet-500 focus:ring-violet-500/20"
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error / Success */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5"
                      >
                        <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-400">{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-2.5"
                      >
                        <p className="text-xs text-green-400">{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100"
                  >
                    {loading ? (
                      <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : mode === "signup" ? (
                      "Create free account"
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>

                {/* Google */}
                <div className="flex items-center gap-3 w-full mt-4">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  variant="outline"
                  className="mt-3 w-full h-10 rounded-full border-border/60 bg-muted/20 hover:bg-muted/40 font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="size-4 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>

                <p className="mt-4 text-[10px] text-muted-foreground/60 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
