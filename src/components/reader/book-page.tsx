"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface BookPageProps {
  type: "illustration" | "text";
  imageUrl?: string | null;
  chapterNumber?: number;
  chapterTitle?: string;
  content?: string | null;
  moral?: string;
  showDropCap?: boolean;
}

export function BookPage({
  type,
  imageUrl,
  chapterNumber,
  chapterTitle,
  content,
  moral,
  showDropCap = true,
}: BookPageProps) {
  // Illustration Page (Left side)
  if (type === "illustration") {
    return (
      <div className="h-full flex items-center justify-center p-4 md:p-8">
        {imageUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src={imageUrl}
              alt={chapterTitle || "Story illustration"}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {/* Subtle vignette on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-periwinkle-light/20 to-sage-light/20 rounded-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl opacity-40"
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  }

  // Text Page (Right side)
  return (
    <div className="h-full p-6 md:p-10 flex flex-col">
      {/* Chapter Header */}
      {chapterNumber !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-sm font-medium text-periwinkle tracking-wide uppercase mb-2">
            Chapter {chapterNumber}
          </p>
          {chapterTitle && (
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground leading-tight">
              {chapterTitle}
            </h2>
          )}
        </motion.div>
      )}

      {/* Story Text with Drop Cap */}
      <div className="flex-1 overflow-y-auto pr-2">
        {content?.split("\n\n").map((paragraph, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
            className={`text-base md:text-lg leading-relaxed text-foreground/90 mb-4 font-body ${idx === 0 && showDropCap ? "drop-cap" : ""
              }`}
          >
            {paragraph}
          </motion.p>
        ))}

        {/* Moral Section */}
        {moral && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 p-5 rounded-xl bg-gradient-to-br from-sage/15 to-sage/5 border border-sage/20"
          >
            <p className="text-sm font-medium text-sage-dark mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              The Lesson
            </p>
            <p className="text-lg font-medium text-foreground italic leading-relaxed">
              &ldquo;{moral}&rdquo;
            </p>
          </motion.div>
        )}
      </div>

      {/* Decorative corner flourish */}
      <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="currentColor">
          <path d="M60 60C40 60 20 40 0 0C20 10 40 30 60 60Z" />
        </svg>
      </div>
    </div>
  );
}
