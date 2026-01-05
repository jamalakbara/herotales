"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, BookOpen } from "lucide-react";
import { ThemeType, THEME_ICONS } from "@/types/database";

interface StoryPageProps {
  pageNumber: number;
  title: string;
  content: string | null;
  imageUrl: string | null;
  childName: string;
  theme: ThemeType;
  isCover: boolean;
  moral?: string;
}

export function StoryPage({
  pageNumber,
  title,
  content,
  imageUrl,
  childName,
  theme,
  isCover,
  moral,
}: StoryPageProps) {
  // Cover Page
  if (isCover) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl page-shadow overflow-hidden"
      >
        {/* Cover Image Area */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-periwinkle-light via-cream to-sage-light">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BookOpen className="h-24 w-24 text-white/80" />
              </motion.div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Title on Cover */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-lg opacity-90 mb-2">
                A story about {theme} {THEME_ICONS[theme]}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                {title}
              </h1>
              <p className="mt-4 text-lg opacity-90">
                Starring: <span className="font-semibold">{childName}</span> ⭐
              </p>
            </motion.div>
          </div>
        </div>

        {/* Tap to begin */}
        <div className="p-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted-foreground flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Tap Next to begin the adventure
            <Sparkles className="h-4 w-4" />
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // Chapter Pages
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-2xl page-shadow overflow-hidden"
    >
      {/* Chapter Image */}
      {imageUrl && (
        <div className="relative aspect-video">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}

      {/* Chapter Content */}
      <div className="p-6 sm:p-8">
        {/* Chapter Header */}
        <div className="mb-4">
          <p className="text-sm text-periwinkle font-medium mb-1">
            Chapter {pageNumber}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {title}
          </h2>
        </div>

        {/* Story Text */}
        <div className="prose prose-lg max-w-none">
          {content?.split("\n\n").map((paragraph, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-foreground leading-relaxed text-lg"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        {/* Moral (on last chapter) */}
        {moral && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-sage/20 to-sage/10 border border-sage/30"
          >
            <p className="text-sm font-medium text-sage-dark mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              The Lesson
            </p>
            <p className="text-lg font-medium text-foreground italic">
              &ldquo;{moral}&rdquo;
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
