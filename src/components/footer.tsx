"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Linkedin, Heart } from "lucide-react";

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const yStars = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const yHillsBack = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const yHillsFront = useTransform(scrollYProgress, [0, 1], [150, 0]);

  return (
    <footer
      ref={containerRef}
      className="relative pt-64 pb-12 overflow-hidden bg-[#0F172A] text-slate-200 -mt-24 rounded-t-[4rem] md:rounded-t-[100%] shadow-[0_-20px_60px_rgba(15,23,42,0.5)] z-20"
    >
      {/* 1. Starry Sky Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep sky gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]"></div>

        <div className="absolute top-20 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>

        {/* Stars */}
        <motion.div style={{ y: yStars }} className="absolute inset-0 opacity-80">
          {/* Generating static stars for performance */}
          {[...Array(30)].map((_, i) => {
            // Robust deterministic random values based on index
            // Using a simple Linear Congruential Generator (LCG) concept for stability across environments
            // Math.sin can vary between Node and Browser versions.
            const random = (seed: number) => {
              // Mix the seed and index
              let t = (seed * 15485863) ^ (i * 2038074743);
              // Basic integer hashing tweaks
              t = t ^ (t >>> 13);
              t = Math.imul(t, 0x5bd1e995);
              t = t ^ (t >>> 15);
              // Normalize to 0-1
              return ((t >>> 0) % 1000) / 1000;
            };

            return (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  top: `${(random(1) * 60).toFixed(3)}%`,
                  left: `${(random(2) * 95 + 2.5).toFixed(3)}%`,
                  width: (random(3) * 2 + 1).toFixed(2) + "px",
                  height: (random(4) * 2 + 1).toFixed(2) + "px",
                  animationDuration: `${(random(5) * 3 + 2).toFixed(2)}s`,
                  opacity: (random(6) * 0.7 + 0.3).toFixed(2)
                }}
              />
            );
          })}
        </motion.div>
      </div>

      {/* 2. The Moon */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-20, 20]) }}
        className="absolute top-32 right-[10%] md:right-[15%] w-24 h-24 sm:w-32 sm:h-32 rounded-full z-10"
      >
        {/* Glow */}
        <div className="absolute inset-0 bg-[#F4F4F0] rounded-full blur-[40px] opacity-40"></div>
        {/* Moon Body */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#FFFBF5] to-[#E2E2E2] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1)] overflow-hidden">
          {/* Craters */}
          <div className="absolute top-[20%] right-[30%] w-[15%] h-[15%] rounded-full bg-[#000000] opacity-5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]"></div>
          <div className="absolute bottom-[30%] left-[25%] w-[25%] h-[25%] rounded-full bg-[#000000] opacity-5 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4)]"></div>
          <div className="absolute top-[50%] right-[15%] w-[10%] h-[10%] rounded-full bg-[#000000] opacity-5 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)]"></div>
        </div>
      </motion.div>

      {/* 3. Hills (Textured & Layered) */}

      {/* Back Hill */}
      <motion.div
        style={{ y: yHillsBack }}
        className="absolute bottom-20 left-0 w-[140%] h-[400px] bg-[#1E293B] rounded-t-[100%] -translate-x-[20%] z-10"
      >
        {/* <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div> */}
      </motion.div>

      {/* Front Hill */}
      <motion.div
        style={{ y: yHillsFront }}
        className="absolute -bottom-10 right-0 w-[140%] h-[250px] bg-[#334155] rounded-t-[100%] translate-x-[10%] z-10 shadow-[-10px_-10px_40px_rgba(0,0,0,0.3)]"
      >
        {/* <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div> */}
      </motion.div>


      {/* --- CONTENT LAYER --- */}
      <div className="relative z-30 max-w-6xl mx-auto px-6 flex flex-col items-center mt-12">

        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-24 text-center md:text-left">

          {/* Brand */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative flex items-center justify-center">
                <Image
                  src="/herotales-logo.png"
                  alt="HeroTales Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-bold text-3xl text-white tracking-wide">
                HeroTales
              </span>
            </div>
            <p className="max-w-sm text-slate-400 font-medium leading-relaxed text-lg">
              Where every day ends with a new adventure. <br />
              <span className="text-indigo-300">Sleep tight, dream big.</span>
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-start-8 md:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2 opacity-50">Storytime</h4>
            {['Library', 'Create Story', 'Characters', 'Pricing'].map(item => (
              <Link key={item} href="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 w-fit mx-auto md:mx-0">
                {item}
              </Link>
            ))}
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2 md:col-start-11 flex flex-col gap-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2 opacity-50">Company</h4>
            {['About Us', 'Safety', 'Blog', 'Contact'].map(item => (
              <Link key={item} href="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 w-fit mx-auto md:mx-0">
                {item}
              </Link>
            ))}
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-8"></div>

        {/* Bottom Bar */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium text-slate-500 uppercase tracking-widest">

          <p>© {new Date().getFullYear()} HeroTales Inc.</p>

          <div className="flex gap-6">
            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="hover:text-white transition-colors hover:scale-110 duration-200">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1 hidden md:flex">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400 animate-pulse" /> in Bandung, Indonesia
          </div>
        </div>

      </div>
    </footer>
  );
}
