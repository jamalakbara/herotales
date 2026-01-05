"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Home, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { StoryPage } from "./story-page";
import { ParentalGate } from "./parental-gate";
import { CompletionCelebration } from "./completion-celebration";
import { AudioPlayer } from "./audio-player";
import type { StoryContent, ThemeType } from "@/types/database";

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
  const [currentPage, setCurrentPage] = useState(0); // 0 = cover, 1-5 = chapters
  const [showGate, setShowGate] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const totalPages = content.chapters.length + 1; // Cover + 5 chapters

  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ["#6A89CC", "#A1BE95", "#F98866", "#FFF2D7"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ["#6A89CC", "#A1BE95", "#F98866", "#FFF2D7"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
    } else if (currentPage === totalPages - 1) {
      // Story complete!
      setShowCompletion(true);
      triggerConfetti();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  };

  const handleExitRequest = () => {
    setShowGate(true);
  };

  const handleGateSuccess = () => {
    setShowGate(false);
    router.push("/dashboard");
  };

  const handleGateCancel = () => {
    setShowGate(false);
  };

  const handleCompletionClose = () => {
    setShowCompletion(false);
    router.push("/dashboard");
  };

  // Page variants for flip animation
  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      rotateY: direction > 0 ? -15 : 15,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      rotateY: direction > 0 ? 15 : -15,
    }),
  };

  return (
    <>
      {/* Main Reader */}
      <div className="fixed inset-0 paper-bg flex flex-col">
        {/* Minimal Header - Fades on scroll */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitRequest}
            className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-md"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Page indicator */}
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${i === currentPage ? "w-6 bg-primary" : "bg-primary/30"}
                `}
              />
            ))}
          </div>

          {/* Read to Me Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
            className={`rounded-full backdrop-blur-sm shadow-md transition-colors ${showAudioPlayer
              ? "bg-periwinkle text-white hover:bg-periwinkle/90"
              : "bg-white/80 hover:bg-white"
              }`}
            title="Read to Me"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Content Area - Scrollable */}
        <div className={`flex-1 overflow-y-auto p-4 pt-20 ${showAudioPlayer ? "pb-48" : "pb-24"}`}>
          <div className="min-h-full flex items-start justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  rotateY: { duration: 0.4 },
                }}
                className="w-full max-w-2xl"
              >
                <StoryPage
                  pageNumber={currentPage}
                  title={currentPage === 0 ? title : content.chapters[currentPage - 1]?.title}
                  content={
                    currentPage === 0 ? null : content.chapters[currentPage - 1]?.content
                  }
                  imageUrl={images.get(currentPage) || null}
                  childName={childName}
                  theme={theme}
                  isCover={currentPage === 0}
                  moral={
                    currentPage === totalPages - 1 ? content.moral : undefined
                  }
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Audio Player - shown when enabled */}
        {showAudioPlayer && currentPage > 0 && (
          <div className="absolute bottom-24 left-4 right-4 z-10 max-w-2xl mx-auto">
            <AudioPlayer
              storyId={storyId}
              chapterIndex={currentPage - 1}
              isVisible={showAudioPlayer}
            />
          </div>
        )}

        {/* Navigation Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="touch-target rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            size="lg"
            onClick={goToNextPage}
            className="touch-target rounded-full btn-magic px-8 shadow-lg"
          >
            {currentPage === totalPages - 1 ? (
              <>
                Finish! 🎉
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
      {/* Parental Gate Modal */}
      {showGate && (
        <ParentalGate onSuccess={handleGateSuccess} onCancel={handleGateCancel} />
      )}

      {/* Completion Celebration */}
      {showCompletion && (
        <CompletionCelebration
          childName={childName}
          theme={theme}
          moral={content.moral}
          onClose={handleCompletionClose}
        />
      )}
    </>
  );
}
