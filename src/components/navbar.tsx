"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Simple logic: Hide if scrolling DOWN and not at the very top
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    if (latest > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      initial="visible"
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className={`
        pointer-events-auto
        flex items-center justify-between
        py-2 pl-4 pr-2.5
        rounded-full
        transition-all duration-300 ease-out
        ${scrolled
          ? "bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(106,137,204,0.15)]"
          : "bg-white/50 backdrop-blur-md border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
        }
        w-full max-w-2xl
      `}>
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group mr-8">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-periwinkle to-periwinkle-light flex items-center justify-center transform transition-transform group-hover:rotate-12 group-hover:scale-105 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-slate-800 group-hover:text-primary transition-colors">
            HeroTales
          </span>
        </Link>

        {/* Desktop Links - Hidden on very small screens if needed, but fits in pill */}
        <nav className="hidden md:flex items-center gap-6 mr-6">
          <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
            How it works
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-block">
            <Button variant="ghost" className="rounded-full h-10 px-4 text-sm font-medium hover:bg-white/50 text-slate-700">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full h-10 px-5 bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transition-all text-sm font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
