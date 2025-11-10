"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Building2, TrendingUp } from "lucide-react";

export function LoadingSpinner({ size = "md", fullScreen = false }: { size?: "sm" | "md" | "lg", fullScreen?: boolean }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  if (size === "lg" || fullScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated icon */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary to-purple-400 rounded-full blur-2xl opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative w-24 h-24 bg-card border-2 border-primary/30 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Briefcase className="w-10 h-10 text-primary" />
              </motion.div>
            </div>
          </motion.div>

          {/* Floating icons */}
          <div className="relative w-64 h-32 mb-8">
            <motion.div
              className="absolute top-0 left-0 w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <GraduationCap className="w-6 h-6 text-primary" />
            </motion.div>

            <motion.div
              className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center"
              animate={{
                y: [0, -15, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            >
              <Building2 className="w-6 h-6 text-blue-400" />
            </motion.div>

            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center"
              animate={{
                y: [0, -12, 0],
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            >
              <TrendingUp className="w-6 h-6 text-green-400" />
            </motion.div>
          </div>

          {/* Loading text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Loading your dashboard...
            </h2>
            <p className="text-muted-foreground text-sm">
              Fetching placements, drives, and opportunities
            </p>
          </motion.div>

          {/* Animated dots */}
          <div className="flex gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <h3 className="text-lg font-semibold text-foreground tracking-wide">
              Campus<span className="text-primary">Connect</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Connecting Students & Opportunities
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} border-primary/30 border-t-primary rounded-full animate-spin`}
      />
    </div>
  );
}
