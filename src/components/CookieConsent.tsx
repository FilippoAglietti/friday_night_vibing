"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check if consent was already given
  useEffect(() => {
    setIsMounted(true);
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie_consent="));

    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (choice: "accepted" | "declined") => {
    // Set cookie with 365-day expiration
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);

    document.cookie = `cookie_consent=${choice}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
    setIsVisible(false);
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 to-purple-950/40 px-6 py-5 shadow-2xl backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-6">
            {/* Text content */}
            <div className="mb-4 flex-1 md:mb-0">
              <p className="text-sm md:text-base text-foreground/90">
                We use cookies to improve your experience. Read our{" "}
                <Link
                  href="/cookies"
                  className="font-medium text-violet-400 hover:text-violet-300 underline transition-colors"
                >
                  cookie policy
                </Link>
                {" "}to learn more.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => handleConsent("declined")}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-violet-400/30 text-violet-400 hover:bg-violet-500/10 transition-all duration-200 hover:border-violet-400/50"
              >
                Decline
              </button>
              <button
                onClick={() => handleConsent("accepted")}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-all duration-200 shadow-lg hover:shadow-violet-500/20"
              >
                Accept All
              </button>
              <button
                onClick={() => handleConsent("declined")}
                aria-label="Dismiss cookie consent banner"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
