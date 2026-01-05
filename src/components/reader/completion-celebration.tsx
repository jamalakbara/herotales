"use client";

import { motion } from "framer-motion";
import { Sparkles, Star, Heart, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeType, THEME_ICONS } from "@/types/database";

interface CompletionCelebrationProps {
  childName: string;
  theme: ThemeType;
  moral: string;
  onClose: () => void;
}

const themeMessages: Record<ThemeType, string> = {
  bravery: "showed amazing courage!",
  honesty: "was truthful and brave!",
  patience: "learned the power of waiting!",
  kindness: "spread love and kindness!",
  persistence: "never gave up!",
};

export function CompletionCelebration({
  childName,
  theme,
  moral,
  onClose,
}: CompletionCelebrationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-periwinkle via-sage to-coral flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden"
      >
        {/* Background sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              {["✨", "⭐", "🌟", "💫"][i % 4]}
            </motion.div>
          ))}
        </div>

        {/* Trophy */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 mb-6 shadow-lg"
        >
          <Trophy className="h-12 w-12 text-white" />
        </motion.div>

        {/* Congratulations */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold mb-2 text-gradient">
            Amazing Job!
          </h1>
          <p className="text-xl text-foreground mb-4">
            {childName} {themeMessages[theme]} {THEME_ICONS[theme]}
          </p>
        </motion.div>

        {/* Moral Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-cream rounded-2xl p-6 mb-6"
        >
          <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Today&apos;s Lesson
          </p>
          <p className="text-lg font-medium text-foreground italic">
            &ldquo;{moral}&rdquo;
          </p>
        </motion.div>

        {/* Stars */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="flex justify-center gap-2 mb-6"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
            </motion.div>
          ))}
        </motion.div>

        {/* Done Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Button onClick={onClose} className="w-full h-14 rounded-2xl btn-magic text-lg">
            <Heart className="h-5 w-5 mr-2 fill-white" />
            Back to Stories
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
