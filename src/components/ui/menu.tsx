"use client";

import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface MenuIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MenuIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const LINE_VARIANTS = {
  normal: { scaleX: 1, originX: "left" },
  animate: { scaleX: [1, 0.5, 1], originX: "left" },
};

const MenuIcon = forwardRef<MenuIconHandle, MenuIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave],
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.line
            animate={controls}
            variants={LINE_VARIANTS}
            transition={{ duration: 0.3, delay: 0 }}
            x1="4" x2="20" y1="6" y2="6"
          />
          <motion.line
            animate={controls}
            variants={LINE_VARIANTS}
            transition={{ duration: 0.3, delay: 0.06 }}
            x1="4" x2="20" y1="12" y2="12"
          />
          <motion.line
            animate={controls}
            variants={LINE_VARIANTS}
            transition={{ duration: 0.3, delay: 0.12 }}
            x1="4" x2="20" y1="18" y2="18"
          />
        </svg>
      </div>
    );
  },
);

MenuIcon.displayName = "MenuIcon";

export { MenuIcon };
