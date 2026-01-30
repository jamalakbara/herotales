"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookContainer } from "@/components/reader/book-container";
import { BookSpread } from "@/components/reader/book-spread";
import { BookPage } from "@/components/reader/book-page";
import { BookCover } from "@/components/reader/book-cover";
import { CompletionCelebration } from "@/components/reader/completion-celebration";
import { AudioPlayer } from "@/components/reader/audio-player";
import { StoryContent, ThemeType } from "@/types/database";

interface StoryReaderProps {
  storyId: string;
  title: string;
  childName: string;
  content: StoryContent;
  images: Map<number, string>;
  theme: ThemeType;
}

export function StoryReader({
  storyId,
  title,
  childName,
  content,
  images,
  theme,
}: StoryReaderProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0); // 0 = Cover, 1+ = Chapters
  const [showCelebration, setShowCelebration] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"forward" | "backward">("forward");

  const totalPages = content?.chapters?.length || 0;
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  const handleNext = useCallback(() => {
    if (isFlipping) return;

    if (currentPage < totalPages) {
      setFlipDirection("forward");
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsFlipping(false);
      }, 300);
    } else {
      setShowCelebration(true);
    }
  }, [currentPage, totalPages, isFlipping]);

  const handlePrev = useCallback(() => {
    if (isFlipping) return;

    if (currentPage > 0) {
      setFlipDirection("backward");
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsFlipping(false);
      }, 300);
    }
  }, [currentPage, isFlipping]);

  const handleClose = () => {
    router.push("/dashboard/stories");
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  if (showCelebration) {
    return (
      <CompletionCelebration
        childName={childName}
        theme={theme}
        moral={content.moral}
        onClose={handleClose}
      />
    );
  }

  const isCover = currentPage === 0;
  const currentChapter = !isCover && content.chapters ? content.chapters[currentPage - 1] : null;
  const currentImage = images.get(currentPage) ?? null;
  const coverImage = images.get(0) ?? null;

  return (
    <BookContainer theme={theme}>
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full flex justify-between items-center mb-6 px-2"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground hover:bg-white/50 rounded-full gap-2 backdrop-blur-sm bg-white/30"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>

        <motion.div
          key={currentPage}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-sm font-medium text-muted-foreground bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 shadow-sm"
        >
          {isCover ? (
            <span className="flex items-center gap-2">
              ✨ Cover
            </span>
          ) : (
            <span>
              Page <span className="font-bold text-periwinkle">{currentPage}</span> of {totalPages}
            </span>
          )}
        </motion.div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground hover:bg-white/50 rounded-full backdrop-blur-sm bg-white/30"
        >
          <X className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Main Book Content */}
      <AnimatePresence mode="wait">
        {isCover ? (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            onClick={handleNext}
            className="cursor-pointer"
          >
            <BookCover
              title={title}
              childName={childName}
              theme={theme}
              imageUrl={coverImage}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`spread-${currentPage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BookSpread
              isFlipping={isFlipping}
              flipDirection={flipDirection}
              showRibbon={true}
              ribbonProgress={progress}
              leftPage={
                <BookPage
                  type="illustration"
                  imageUrl={currentImage}
                  chapterTitle={currentChapter?.title}
                />
              }
              rightPage={
                <BookPage
                  type="text"
                  chapterNumber={currentPage}
                  chapterTitle={currentChapter?.title}
                  content={currentChapter?.content}
                  moral={currentPage === totalPages ? content.moral : undefined}
                  showDropCap={true}
                />
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-6 left-0 right-0 px-4 z-20 flex justify-center pointer-events-none"
      >
        <div className="w-full max-w-6xl flex items-end justify-between pointer-events-none">
          {/* Audio Player (Left side) */}
          <div className="pointer-events-auto">
            <AudioPlayer
              storyId={storyId}
              chapterIndex={currentPage}
              isVisible={!isCover}
            />
          </div>

          {/* Navigation Buttons (Center) */}
          <div className="pointer-events-auto flex items-center gap-3 bg-white/80 backdrop-blur-lg p-2 rounded-full shadow-xl border border-white/50 absolute left-1/2 -translate-x-1/2">
            {/* Previous Button */}
            <Button
              onClick={handlePrev}
              disabled={currentPage === 0 || isFlipping}
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full hover:bg-cream-dark disabled:opacity-30 transition-all duration-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2">
              {Array.from({ length: totalPages + 1 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentPage
                      ? "bg-periwinkle w-6"
                      : i < currentPage
                        ? "bg-periwinkle/40"
                        : "bg-neutral-300"
                    }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNext}
              disabled={isFlipping}
              className="h-12 w-12 rounded-full btn-magic shadow-lg overflow-hidden relative group"
              size="icon"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {currentPage === totalPages ? (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-xl relative z-10"
                >
                  🏆
                </motion.span>
              ) : (
                <ChevronRight className="h-6 w-6 relative z-10" />
              )}
            </Button>
          </div>

          {/* Right Spacer */}
          <div className="w-[200px] hidden sm:block" />
        </div>
      </motion.div>

      {/* Keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 hidden lg:block"
      >
        Use ← → arrow keys to navigate
      </motion.div>
    </BookContainer>
  );
}
