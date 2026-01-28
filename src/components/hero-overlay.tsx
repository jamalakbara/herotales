"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroOverlay() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium mb-6"
      >
        <Sparkles className="h-4 w-4" />
        AI-Powered Personalized Stories
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 text-white drop-shadow-lg"
      >
        Bedtime Stories Where{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
          Your Child is the Hero
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md"
      >
        Create magical, personalized stories that teach values like bravery,
        kindness, and honesty. Each story features your child as the main
        character.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
      >
        <Link href="/signup">
          <Button className="btn-magic h-14 px-8 text-lg rounded-2xl border-2 border-white/20 backdrop-blur-sm hover:scale-105 transition-transform bg-primary text-white">
            Start Creating Stories
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link href="#features">
          <Button
            variant="outline"
            className="h-14 px-8 text-lg rounded-2xl bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md"
          >
            Learn More
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
