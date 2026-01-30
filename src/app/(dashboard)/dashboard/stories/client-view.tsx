"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, BookOpen, Sparkles, ChevronRight, Library, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/tilt-card";
import { THEME_ICONS, ThemeType } from "@/types/database";

interface StoriesClientViewProps {
  stories: any[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
    },
  },
};

const getThemeEmoji = (theme: string) => {
  const themeMap: Record<string, string> = {
    adventure: "🗺️",
    fantasy: "🦄",
    "sci-fi": "🚀",
    mystery: "🔍",
    friendship: "💖",
    nature: "🌿",
    space: "🌌",
    ocean: "🌊",
    dinosaur: "🦕",
    superhero: "🦸",
  };
  return themeMap[theme.toLowerCase()] || "✨";
};

const getThemeGradient = (theme: string) => {
  const gradients: Record<string, string> = {
    adventure: "from-amber-500/10 to-orange-500/5",
    fantasy: "from-purple-500/10 to-pink-500/5",
    "sci-fi": "from-blue-500/10 to-cyan-500/5",
    mystery: "from-slate-500/10 to-indigo-500/5",
    friendship: "from-rose-500/10 to-pink-500/5",
    nature: "from-emerald-500/10 to-green-500/5",
    space: "from-indigo-500/10 to-purple-500/5",
    ocean: "from-cyan-500/10 to-blue-500/5",
    dinosaur: "from-lime-500/10 to-emerald-500/5",
    superhero: "from-red-500/10 to-yellow-500/5",
  };
  return gradients[theme.toLowerCase()] || "from-periwinkle/10 to-sage/5";
};

export default function StoriesClientView({ stories }: StoriesClientViewProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 relative min-h-[70vh]"
    >
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-periwinkle/15 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-coral/10 rounded-full blur-[100px] -z-10 animate-pulse delay-700 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-sage/10 rounded-full blur-[90px] -z-10 animate-pulse delay-300 pointer-events-none" />

      {/* Header Section */}
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/40 backdrop-blur-xl text-sm font-medium text-muted-foreground mb-5 shadow-sm"
          >
            <Library className="h-4 w-4 text-sage" />
            <span>Your Story Collection</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
            Story{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-periwinkle via-coral to-periwinkle bg-[length:200%_auto] animate-gradient">
              Library
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-lg">
            All the magical adventures you&apos;ve created. Each story is a unique journey with your child as the hero.
          </p>
        </div>

        <Link href="/dashboard/stories/new">
          <Button className="btn-magic h-16 pl-8 pr-20 text-lg rounded-2xl relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2">
              Create Magic <Wand2 className="h-5 w-5" />
            </span>
            <span className="absolute right-0 top-0 h-full w-14 bg-white/20 -skew-x-12 translate-x-16 group-hover:translate-x-0 transition-transform duration-500 ease-out flex items-center justify-center">
              <ChevronRight className="h-6 w-6" />
            </span>
          </Button>
        </Link>
      </motion.div>

      {/* Stories Grid */}
      {stories && stories.length > 0 ? (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div variants={item} key={story.id}>
              <TiltCard className="h-full" rotationFactor={10}>
                <Link href={`/reader/${story.id}`} className="block h-full">
                  <div className="glass-card h-full p-0 border-white/50 bg-gradient-to-b from-white/70 to-white/30 hover:border-periwinkle/40 transition-all duration-300 group relative overflow-hidden">
                    {/* Theme Header */}
                    <div
                      className={`h-28 bg-gradient-to-br ${getThemeGradient(story.theme)} relative`}
                    >
                      {/* Theme Badge */}
                      <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground border border-white/30 flex items-center gap-1.5">
                        <span>{THEME_ICONS[story.theme as ThemeType]}</span>
                        <span className="capitalize">{story.theme}</span>
                      </div>

                      {/* Floating Emoji */}
                      <div className="absolute bottom-[-16px] left-6 text-5xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-lg">
                        {getThemeEmoji(story.theme)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pt-10 px-6 pb-6">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight flex items-start gap-2">
                        {story.title || "Untitled Story"}
                        <Sparkles className="h-4 w-4 text-coral opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                      </h3>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-periwinkle/20 flex items-center justify-center text-sm font-bold text-periwinkle">
                          {story.children?.nickname?.charAt(0)?.toUpperCase() || "H"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            For {story.children?.nickname || "Your Hero"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(story.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-r from-periwinkle/20 to-coral/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}

          {/* Add New Story Card */}
          <motion.div variants={item}>
            <TiltCard className="h-full" rotationFactor={8}>
              <Link href="/dashboard/stories/new" className="block h-full">
                <div className="h-full min-h-[280px] border-3 border-dashed border-muted-foreground/20 rounded-[2rem] hover:border-periwinkle/40 hover:bg-periwinkle/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 group cursor-pointer bg-white/20 backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                    <Plus className="h-8 w-8 text-muted-foreground group-hover:text-periwinkle transition-colors" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground group-hover:text-periwinkle transition-colors">
                    Create New Story
                  </p>
                </div>
              </Link>
            </TiltCard>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div variants={item} className="flex justify-center py-16">
          <TiltCard>
            <div className="glass-card max-w-lg border-0 text-center py-16 px-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-periwinkle/5 to-coral/5 -z-10" />

              <div className="h-24 w-24 bg-white/60 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <BookOpen className="h-12 w-12 text-periwinkle" />
                </motion.div>
              </div>

              <h3 className="text-2xl font-bold mb-3">No stories yet</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Create your first magical adventure! Each story is uniquely
                generated with your child as the hero.
              </p>

              <Link href="/dashboard/stories/new">
                <Button className="btn-magic h-12 px-8 text-base">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Story
                </Button>
              </Link>
            </div>
          </TiltCard>
        </motion.div>
      )}
    </motion.div>
  );
}
