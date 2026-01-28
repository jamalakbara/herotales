"use client";

import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-border/50 bg-white/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-8 h-8 rounded-lg gradient-periwinkle flex items-center justify-center group-hover:animate-bounce">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-foreground/80">
            HeroTales
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} HeroTales AI. Made with ❤️ for parents and
          kids.
        </p>
      </div>
    </footer>
  );
}
