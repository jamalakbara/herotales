"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BookSpreadProps {
  leftPage: ReactNode;
  rightPage: ReactNode;
  isFlipping?: boolean;
  flipDirection?: "forward" | "backward";
  showRibbon?: boolean;
  ribbonProgress?: number; // 0-100
}

export function BookSpread({
  leftPage,
  rightPage,
  isFlipping = false,
  flipDirection = "forward",
  showRibbon = true,
  ribbonProgress = 0,
}: BookSpreadProps) {
  // Calculate ribbon height based on progress
  const ribbonHeight = 60 + (ribbonProgress / 100) * 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 5 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="book-container relative"
    >
      {/* Book shadow beneath */}
      <div className="book-shadow" />

      {/* The open book spread */}
      <div className="book-spread relative bg-transparent rounded-lg overflow-visible">
        {/* Left page (illustration) */}
        <motion.div
          className={`book-page book-page-left paper-grain relative min-h-[500px] md:min-h-[600px] ${isFlipping && flipDirection === "backward" ? "page-flipping-backward" : ""
            }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="left-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 h-full"
            >
              {leftPage}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Center spine shadow */}
        <div className="book-spine-center hidden md:block" />

        {/* Right page (text content) */}
        <motion.div
          className={`book-page book-page-right paper-grain page-curl relative min-h-[500px] md:min-h-[600px] ${isFlipping && flipDirection === "forward" ? "page-flipping-forward" : ""
            }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Reading progress ribbon */}
          {showRibbon && (
            <motion.div
              initial={{ height: 60, opacity: 0 }}
              animate={{ height: ribbonHeight, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="book-ribbon"
              style={{ height: ribbonHeight }}
            />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key="right-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 h-full"
            >
              {rightPage}
            </motion.div>
          </AnimatePresence>

          {/* Page stack effect on right side */}
          <div className="page-stack hidden md:block" />
        </motion.div>
      </div>
    </motion.div>
  );
}
