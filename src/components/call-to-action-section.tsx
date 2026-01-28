"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { useRef, MouseEvent, useState, useEffect } from "react";

export default function CallToActionSection() {
  return (
    <section className="pt-32 pb-64 px-4 relative overflow-hidden min-h-[70vh] flex items-center justify-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFBF5] to-white -z-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-periwinkle/20 via-transparent to-transparent -z-10 blur-3xl opacity-60"></div>

      {/* Floating Particles */}
      <ParticleField />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-sm mb-8">
            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span className="text-sm font-semibold tracking-wide uppercase text-slate-600">Start Your Adventure</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight font-heading text-slate-900 drop-shadow-sm leading-tight">
            Ready to Create <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-periwinkle via-indigo-500 to-coral animate-gradient-x">
              Pure Magic?
            </span>
          </h2>

          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-body leading-relaxed">
            Join thousands of parents who are making bedtime the most anticipated part of the day.
          </p>

          <div className="flex flex-col items-center justify-center">
            <MagneticButton>
              <Link href="/signup">
                <Button className="h-20 px-12 text-2xl rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all hover:shadow-[0_20px_50px_rgba(106,137,204,0.4)] border-2 border-white/10 group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    Get Started Free
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                </Button>
              </Link>
            </MagneticButton>

            <p className="mt-6 text-sm text-slate-500 font-medium">
              No credit card required · Free forever plan available
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.3); // Magnetic pull strength
    y.set(middleY * 0.3);
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
      style={{ x: mouseX, y: mouseY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

function ParticleField() {
  // Generate random particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-gradient-to-tr from-periwinkle to-coral rounded-full opacity-30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
