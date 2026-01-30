"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useStoryGeneration } from "@/hooks/use-story-generation";
import { Button } from "@/components/ui/button";

const statusMessages: Record<string, { icon: React.ReactNode; text: string; color: string }> = {
  pending: {
    icon: <Loader2 className="h-6 w-6 animate-spin" />,
    text: "Preparing your magical adventure...",
    color: "text-slate-600",
  },
  generating_text: {
    icon: <Sparkles className="h-6 w-6 animate-pulse" />,
    text: "Crafting your personalized story...",
    color: "text-periwinkle",
  },
  generating_images: {
    icon: <ImageIcon className="h-6 w-6 animate-pulse" />,
    text: "Painting magical illustrations...",
    color: "text-coral",
  },
  saving: {
    icon: <BookOpen className="h-6 w-6 animate-pulse" />,
    text: "Saving to your library...",
    color: "text-sage-dark",
  },
  completed: {
    icon: <Check className="h-6 w-6" />,
    text: "Story complete! Redirecting...",
    color: "text-emerald-600",
  },
  failed: {
    icon: <AlertCircle className="h-6 w-6" />,
    text: "Oops! Something went wrong.",
    color: "text-red-600",
  },
};

export default function GeneratingStoryPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  const { status, progress, error, title, isComplete } = useStoryGeneration(storyId);

  // Auto-redirect when complete
  useEffect(() => {
    if (status === "completed") {
      // Small delay so user sees the success animation
      const timeout = setTimeout(() => {
        router.push(`/reader/${storyId}`);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [status, storyId, router]);

  const handleRetry = async () => {
    router.push("/dashboard/stories/new");
  };

  const currentStatus = statusMessages[status] || statusMessages.pending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[50%] bg-periwinkle/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[30%] right-[-15%] w-[40%] h-[40%] bg-coral/15 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />
      <div className="absolute bottom-[-5%] left-[30%] w-[35%] h-[35%] bg-sage/10 rounded-full blur-[90px] -z-10 animate-pulse delay-300" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-12 max-w-2xl w-full text-center space-y-8"
      >
        {/* Status Icon */}
        <motion.div
          key={status}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`h-20 w-20 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center mx-auto ${currentStatus.color}`}
        >
          {currentStatus.icon}
        </motion.div>

        {/* Title */}
        {title && title !== "Generating..." && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {title}
            </h1>
          </motion.div>
        )}

        {/* Status Message */}
        <motion.p
          key={currentStatus.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-lg font-medium ${currentStatus.color}`}
        >
          {currentStatus.text}
        </motion.p>

        {/* Progress Bar */}
        {!isComplete && (
          <div className="space-y-3">
            <div className="h-3 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-periwinkle via-coral to-sage-dark bg-[length:200%_auto] animate-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {/* Error State */}
        {status === "failed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                {error || "An unexpected error occurred during generation."}
              </p>
            </div>
            <Button onClick={handleRetry} className="btn-magic">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Progress Steps */}
        {!isComplete && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            {["pending", "generating_text", "generating_images", "saving"].map((step, index) => {
              const isCurrentOrPast =
                ["pending", "generating_text", "generating_images", "saving"].indexOf(status) >= index;
              return (
                <div
                  key={step}
                  className={`h-2 w-2 rounded-full transition-all ${isCurrentOrPast ? "bg-periwinkle scale-125" : "bg-slate-300"
                    }`}
                />
              );
            })}
          </motion.div>
        )}

        {/* Info */}
        {!isComplete && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground pt-4 border-t border-white/30"
          >
            ✨ Feel free to refresh this page - your story will continue generating in the background!
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
