"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThemeType, THEME_ICONS } from "@/types/database";

interface BookCoverProps {
  title: string;
  childName: string;
  theme: ThemeType;
  imageUrl?: string | null;
}

// Theme-based cover gradients
const THEME_GRADIENTS: Record<ThemeType, string> = {
  bravery: "from-[#F98866] via-[#E67A5B] to-[#C9604A]",
  honesty: "from-[#6A89CC] via-[#5A79BC] to-[#4A69AC]",
  patience: "from-[#A1BE95] via-[#8BAF7E] to-[#759F68]",
  kindness: "from-[#E8A87C] via-[#D8986C] to-[#C8885C]",
  persistence: "from-[#7B8CDE] via-[#6B7CCE] to-[#5B6CBE]",
};

export function BookCover({ title, childName, theme, imageUrl }: BookCoverProps) {
  const gradient = THEME_GRADIENTS[theme];
  const themeIcon = THEME_ICONS[theme];

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -15 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="book-container"
    >
      {/* Book shadow */}
      <div className="book-shadow" />

      {/* Single cover page (full width) */}
      <motion.div
        whileHover={{ rotateY: 5, scale: 1.02 }}
        transition={{ duration: 0.4 }}
        className={`book-cover relative bg-gradient-to-br ${gradient} min-h-[500px] md:min-h-[600px] w-full max-w-2xl mx-auto`}
      >
        {/* Ornamental border */}
        <div className="cover-border" />

        {/* Cover content */}
        <div className="relative h-full flex flex-col items-center justify-center p-8 md:p-12 z-10">
          {/* Theme icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-5xl mb-6 opacity-90"
          >
            {themeIcon}
          </motion.div>

          {/* Cover illustration */}
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl mb-8"
            >
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="font-heading text-2xl md:text-4xl font-bold text-white text-center leading-tight max-w-lg mb-4 drop-shadow-lg"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-white/80 text-lg mb-2"
          >
            A story about {theme}
          </motion.p>

          {/* Child name */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-white text-xl font-medium flex items-center gap-2"
          >
            Starring: <span className="font-bold">{childName}</span> ⭐
          </motion.p>

          {/* Tap to begin prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ delay: 1, duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <p className="text-white/70 text-sm flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Tap to begin the adventure
              <Sparkles className="h-4 w-4" />
            </p>
          </motion.div>
        </div>

        {/* Decorative sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/40 text-xs"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
            }}
            style={{
              left: `${15 + i * 14}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
          >
            ✦
          </motion.div>
        ))}

        {/* Spine effect on left side */}
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}
