"use client";

import { motion } from "framer-motion";
import { Sparkles, Palette, BookOpen, Wand2 } from "lucide-react";
import { ThemeType } from "@/types/database";

interface StoryLoadingProps {
  childName: string;
  theme: ThemeType;
}

const loadingSteps = [
  { icon: Wand2, label: "Crafting your magical story...", duration: 20 },
  { icon: Palette, label: "Painting beautiful illustrations...", duration: 60 },
  { icon: BookOpen, label: "Binding the pages together...", duration: 10 },
  { icon: Sparkles, label: "Adding the finishing sparkles...", duration: 10 },
];

export function StoryLoading({ childName, theme }: StoryLoadingProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Animated Book */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              rotateY: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            <div className="w-32 h-40 rounded-2xl gradient-periwinkle shadow-2xl flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <Sparkles className="h-12 w-12 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Floating sparkles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-coral"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, (i - 2) * 30],
                y: [0, -50 - i * 10],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{
                left: "50%",
                top: "50%",
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-2"
        >
          Creating a {theme} story for {childName}!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8"
        >
          This usually takes 2-3 minutes. The magic is worth the wait! ✨
        </motion.p>

        {/* Progress Steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.2 }}
              className="flex items-center gap-3 text-left"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
              >
                <step.icon className="h-5 w-5 text-primary" />
              </motion.div>
              <span className="text-sm font-medium">{step.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Animated message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          🎨 Each illustration is uniquely generated with AI
        </motion.p>
      </motion.div>
    </div>
  );
}
