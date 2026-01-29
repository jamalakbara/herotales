"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroOverlay() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Radial Gradient Glow for contrast without a visible box */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial from-black/20 to-transparent blur-3xl -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-medium tracking-wide mb-8 shadow-sm"
      >
        <Sparkles className="h-4 w-4 text-[#FFD1A9]" />
        AI-Powered Personalized Stories
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.1] mb-8 text-white drop-shadow-2xl tracking-tight"
      >
        Bedtime Stories Where{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD1A9] via-[#F98866] to-[#FFD1A9] bg-[length:200%_auto] animate-gradient">
          Your Child is the Hero
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto mb-10 drop-shadow-lg font-medium leading-relaxed"
      >
        Create magical, personalized stories that teach values like bravery,
        kindness, and honesty. Each story features your child as the main
        character.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row items-center justify-center gap-5 pointer-events-auto"
      >
        <Link href="/signup">
          <Button className="btn-magic h-16 px-10 text-lg rounded-full border border-white/20 backdrop-blur-sm hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(249,136,102,0.6)] bg-[#F98866] text-white">
            Start Creating Stories
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link href="#features">
          <Button
            variant="outline"
            className="h-16 px-10 text-lg rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md transition-all hover:scale-105"
          >
            Learn More
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
