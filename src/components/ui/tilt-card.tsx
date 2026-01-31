"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  rotationFactor?: number;
}

export const TiltCard = ({ children, className = "", rotationFactor = 15 }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * rotationFactor;
    const mouseY = (e.clientY - rect.top) * rotationFactor;

    const rX = (mouseY / height - rotationFactor / 2) * -1;
    const rY = mouseX / width - rotationFactor / 2;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className={`relative transition-all duration-200 ease-out ${className}`}
    >
      {children}
    </motion.div>
  );
};
