"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
          <div className="w-9 h-9 relative flex items-center justify-center transform transition-transform group-hover:rotate-12 group-hover:scale-105">
            <Image
              src="/herotales-logo.png"
              alt="HeroTales Logo"
              width={36}
              height={36}
              className="object-contain"
            />
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
          <Link href="#safety" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
            Safety
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
