"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";

interface WelcomeAnimationProps {
  userName: string;
  onComplete: () => void;
  show: boolean;
}

export default function WelcomeAnimation({
  userName,
  onComplete,
  show,
}: WelcomeAnimationProps) {
  // Extract display name from email or use full name
  const displayName = userName.includes("@")
    ? userName.split("@")[0]
    : userName.split(" ")[0];

  // Auto-complete animation after ~2.5s
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  // Stagger container for sequential animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.4 },
    },
  };

  // Individual animation variants
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const slideUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const textRevealVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Dark overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-gradient-to-br from-black/80 via-violet-950/40 to-black/80 backdrop-blur-md"
          />

          {/* Main content container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[105] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center justify-center gap-4 text-center"
            >
              {/* Logo: Sparkles icon with glow */}
              <motion.div
                variants={logoVariants}
                className="relative"
              >
                {/* Outer glow/halo effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0"
                  animate={{
                    opacity: [0.4, 0.2, 0.4],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    filter: "blur(20px)",
                    width: "120px",
                    height: "120px",
                    left: "-30px",
                    top: "-30px",
                  }}
                />

                {/* Sparkles icon */}
                <div className="relative z-10">
                  <Sparkles
                    className="w-16 h-16 text-white drop-shadow-lg"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Subtle particle effects around logo */}
                <motion.div
                  className="absolute w-1 h-1 bg-violet-300 rounded-full opacity-70"
                  style={{ top: "-30px", left: "30px" }}
                  animate={{
                    opacity: [0.7, 0, 0.7],
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <motion.div
                  className="absolute w-1 h-1 bg-indigo-300 rounded-full opacity-70"
                  style={{ bottom: "-20px", right: "20px" }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    y: [0, 20, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                  }}
                />
                <motion.div
                  className="absolute w-0.5 h-0.5 bg-purple-300 rounded-full opacity-60"
                  style={{ top: "20px", left: "-40px" }}
                  animate={{
                    opacity: [0.6, 0, 0.6],
                    x: [-20, 0, -20],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                  }}
                />
              </motion.div>

              {/* Welcome text */}
              <motion.div
                variants={slideUpVariants}
                className="mt-4"
              >
                <p className="text-white/90 text-sm font-medium tracking-wide">
                  Welcome back,
                </p>
              </motion.div>

              {/* Username with reveal effect */}
              <motion.div
                variants={textRevealVariants}
                className="relative"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  {displayName}
                </h1>
                {/* Subtle underline animation */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  style={{ originX: 0.5 }}
                />
              </motion.div>

              {/* Tagline */}
              <motion.p
                variants={fadeInVariants}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-white/70 text-sm font-light mt-6 tracking-wide"
              >
                Let&apos;s build something great.
              </motion.p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
