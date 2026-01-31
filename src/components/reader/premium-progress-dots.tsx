"use client";

import { motion } from "framer-motion";
import { progressDotVariants, glowPulseVariants } from "@/lib/animation-variants";

interface PremiumProgressDotsProps {
  total: number;
  current: number;
  onDotClick?: (index: number) => void;
  className?: string;
}

export function PremiumProgressDots({
  total,
  current,
  onDotClick,
  className = "",
}: PremiumProgressDotsProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        const isCompleted = index < current;
        const state = isActive ? "active" : isCompleted ? "completed" : "inactive";

        return (
          <motion.button
            key={index}
            className={`relative flex items-center justify-center focus:outline-none group ${onDotClick ? "cursor-pointer" : "cursor-default"
              }`}
            onClick={() => onDotClick?.(index)}
            whileHover={onDotClick ? "hover" : undefined}
            aria-label={`Page ${index + 1} of ${total}`}
          >
            {/* Glow effect for active dot */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full"
                variants={glowPulseVariants}
                initial="idle"
                animate="active"
              />
            )}

            {/* The dot itself */}
            <motion.div
              className="w-2 h-2 rounded-full relative z-10"
              variants={progressDotVariants}
              initial={state}
              animate={state}
            />

            {/* Checkmark for completed dots */}
            {isCompleted && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-[8px] text-white z-20"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              >
                ✓
              </motion.div>
            )}

            {/* Expanding ring for active dot */}
            {isActive && (
              <motion.div
                className="absolute inset-0 border-2 border-periwinkle rounded-full"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
