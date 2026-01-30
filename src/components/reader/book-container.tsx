"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ThemeType } from "@/types/database";

interface BookContainerProps {
  children: ReactNode;
  theme?: ThemeType;
}

// Theme-based ambient colors
const THEME_AMBIENT: Record<ThemeType, { primary: string; secondary: string }> = {
  bravery: { primary: "rgba(249, 136, 102, 0.12)", secondary: "rgba(106, 137, 204, 0.08)" },
  honesty: { primary: "rgba(106, 137, 204, 0.12)", secondary: "rgba(161, 190, 149, 0.08)" },
  patience: { primary: "rgba(161, 190, 149, 0.12)", secondary: "rgba(106, 137, 204, 0.08)" },
  kindness: { primary: "rgba(249, 136, 102, 0.1)", secondary: "rgba(161, 190, 149, 0.1)" },
  persistence: { primary: "rgba(106, 137, 204, 0.15)", secondary: "rgba(249, 136, 102, 0.08)" },
};

export function BookContainer({ children, theme = "bravery" }: BookContainerProps) {
  const ambient = THEME_AMBIENT[theme];

  return (
    <div className="book-ambient book-vignette min-h-screen flex flex-col items-center justify-center py-8 px-4 bg-[#FFFBF5]">
      {/* Dynamic ambient glow based on theme */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% -10%, ${ambient.primary} 0%, transparent 60%),
            radial-gradient(ellipse 80% 50% at 80% 90%, ${ambient.secondary} 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 10% 80%, ${ambient.primary} 0%, transparent 40%)
          `,
        }}
      />

      {/* Floating bokeh lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            initial={{ opacity: 0.2 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              x: [0, 20, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              delay: i * 0.8,
            }}
            style={{
              width: 100 + i * 40,
              height: 100 + i * 40,
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
              background: `radial-gradient(circle, ${i % 2 === 0 ? ambient.primary : ambient.secondary} 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />
        ))}
      </div>

      {/* 3D Perspective wrapper */}
      <div className="book-perspective relative z-10 w-full max-w-6xl">
        {children}
      </div>

      {/* Paper grain texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-[2] opacity-30 bg-noise" />
    </div>
  );
}
