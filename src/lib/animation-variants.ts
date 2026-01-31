/**
 * Centralized animation configurations for premium UI interactions
 */

import { Variants, Transition } from "framer-motion";

// Spring configurations for different interaction types
export const springConfigs = {
  gentle: {
    type: "spring" as const,
    stiffness: 100,
    damping: 15,
    mass: 0.8,
  },
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.5,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    mass: 1,
  },
  smooth: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
    mass: 0.6,
  },
};

// Entrance/exit variants for controls
export const floatingControlVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: (custom?: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springConfigs.gentle,
      delay: custom || 0,
    },
  }),
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
};

// Button interaction variants
export const buttonVariants: Variants = {
  idle: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.05,
    y: -2,
    transition: springConfigs.snappy,
  },
  tap: {
    scale: 0.95,
    y: 0,
    transition: springConfigs.bouncy,
  },
};

// Magnetic effect variants (to be composed with useMotionValue)
export const magneticStrength = {
  subtle: 0.15,
  medium: 0.3,
  strong: 0.5,
};

// Glow pulse animation for active states
export const glowPulseVariants: Variants = {
  idle: {
    boxShadow: "0 0 0 0 rgba(147, 112, 219, 0)",
  },
  active: {
    boxShadow: [
      "0 0 0 0 rgba(147, 112, 219, 0.4)",
      "0 0 0 8px rgba(147, 112, 219, 0)",
      "0 0 0 0 rgba(147, 112, 219, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeOut",
    },
  },
};

// Floating animation for idle states
export const floatingVariants: Variants = {
  float: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Staggered children animation
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Ripple effect animation
export const rippleVariants: Variants = {
  start: {
    opacity: 0.6,
    scale: 0,
  },
  end: {
    opacity: 0,
    scale: 2,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Progress dot variants
export const progressDotVariants: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: "rgba(212, 212, 212, 1)",
  },
  completed: {
    scale: 1,
    backgroundColor: "rgba(147, 112, 219, 0.4)",
  },
  active: {
    scale: 1.2,
    backgroundColor: "rgba(147, 112, 219, 1)",
    transition: springConfigs.bouncy,
  },
  hover: {
    scale: 1.3,
    transition: springConfigs.snappy,
  },
};

// Breathing animation for audio player
export const breathingVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 0.8,
  },
  breathing: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
