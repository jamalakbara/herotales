"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springConfigs } from "@/lib/animation-variants";

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export function AudioVisualizer({
  isPlaying,
  barCount = 5,
  className = "",
}: AudioVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(
    Array(barCount).fill(20)
  );

  useEffect(() => {
    if (!isPlaying) {
      // Return to idle state when not playing
      setHeights(Array(barCount).fill(20));
      return;
    }

    // Animate bars when playing
    const interval = setInterval(() => {
      setHeights(
        Array(barCount)
          .fill(0)
          .map(() => Math.random() * 80 + 20)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, barCount]);

  return (
    <div className={`flex items-center gap-1 h-6 ${className}`}>
      {heights.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 bg-gradient-to-t from-periwinkle to-coral rounded-full"
          animate={{
            height: `${height}%`,
            opacity: isPlaying ? 1 : 0.3,
          }}
          transition={{
            ...springConfigs.smooth,
            delay: index * 0.05,
          }}
        />
      ))}
    </div>
  );
}
