"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { magneticStrength, rippleVariants } from "@/lib/animation-variants";

interface MagneticContainerProps {
  children: React.ReactNode;
  strength?: keyof typeof magneticStrength;
  distance?: number;
  className?: string;
  disabled?: boolean;
}

export function MagneticContainer({
  children,
  strength = "medium",
  distance = 100,
  className = "",
  disabled = false,
}: MagneticContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Motion values for smooth magnetic effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Apply spring physics for smooth, natural movement
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceFromCenter = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );

    // Only apply magnetic effect within specified distance
    if (distanceFromCenter < distance) {
      const deltaX = (e.clientX - centerX) * magneticStrength[strength];
      const deltaY = (e.clientY - centerY) * magneticStrength[strength];

      x.set(deltaX);
      y.set(deltaY);
      setIsHovered(true);
    } else {
      x.set(0);
      y.set(0);
      setIsHovered(false);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x: rippleX, y: rippleY };
    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        x: springX,
        y: springY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full bg-periwinkle pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
          }}
          variants={rippleVariants}
          initial="start"
          animate="end"
        />
      ))}
    </motion.div>
  );
}
