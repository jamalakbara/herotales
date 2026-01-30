"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Wand2,
  BookOpen,
  Users,
  ChevronRight,
  Star,
  Check,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeType, THEME_LABELS, THEME_ICONS } from "@/types/database";

interface Child {
  id: string;
  nickname: string;
  gender: "boy" | "girl";
  age_group: number;
  character_description: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

const themeColors: Record<ThemeType, { bg: string; border: string; text: string; glow: string }> = {
  bravery: { bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-600", glow: "shadow-amber-500/20" },
  honesty: { bg: "bg-blue-500/10", border: "border-blue-500/40", text: "text-blue-600", glow: "shadow-blue-500/20" },
  patience: { bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-600", glow: "shadow-emerald-500/20" },
  kindness: { bg: "bg-pink-500/10", border: "border-pink-500/40", text: "text-pink-600", glow: "shadow-pink-500/20" },
  persistence: { bg: "bg-purple-500/10", border: "border-purple-500/40", text: "text-purple-600", glow: "shadow-purple-500/20" },
};

export default function NewStoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType | null>(null);
  const [generationStep, setGenerationStep] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchChildren() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      setChildren(data || []);
      setIsLoadingChildren(false);

      // Auto-select if only one child
      if (data && data.length === 1) {
        setSelectedChild(data[0].id);
      }
    }
    fetchChildren();
  }, [supabase, router]);

  const handleGenerate = async () => {
    if (!selectedChild || !selectedTheme) {
      toast.error("Please select a hero and a theme");
      return;
    }

    setIsLoading(true);
    setGenerationStep("Starting generation...");

    try {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChild,
          theme: selectedTheme,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "LIMIT_EXCEEDED") {
          toast.error("Monthly story limit reached. Upgrade to Pro for unlimited stories!");
        } else {
          toast.error(data.error || "Failed to generate story");
        }
        return;
      }

      // Redirect to progress page instead of waiting
      toast.success("Story generation started! ✨");
      router.push(`/dashboard/stories/generating/${data.storyId}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setGenerationStep("");
    }
  };

  const selectedChildData = children.find((c) => c.id === selectedChild);
  const canGenerate = selectedChild && selectedTheme && !isLoading;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative min-h-[80vh] flex flex-col justify-center max-w-4xl mx-auto py-8"
    >
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[50%] bg-periwinkle/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[30%] right-[-15%] w-[40%] h-[40%] bg-coral/15 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />
      <div className="absolute bottom-[-5%] left-[30%] w-[35%] h-[35%] bg-sage/10 rounded-full blur-[90px] -z-10 animate-pulse delay-300" />

      {/* Back Link */}
      <motion.div variants={item}>
        <Link
          href="/dashboard/stories"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-all group"
        >
          <span className="h-8 w-8 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium">Back to library</span>
        </Link>
      </motion.div>

      {/* Header Section */}
      <motion.div variants={item} className="mb-10">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/40 backdrop-blur-xl text-sm font-medium text-muted-foreground mb-5 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-periwinkle opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-periwinkle"></span>
          </span>
          <span>Story Creation Studio</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
          Craft a <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-periwinkle via-coral to-periwinkle bg-[length:200%_auto] animate-gradient">
            Magical Tale
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg">
          Select your hero and choose a value to teach. Our AI will weave a unique bedtime story just for them.
        </p>
      </motion.div>

      {/* Step 1: Select Hero */}
      <motion.div variants={item} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-8 w-8 rounded-xl bg-periwinkle/20 flex items-center justify-center text-periwinkle font-bold text-sm">1</span>
          <h2 className="text-xl font-bold">Choose Your Hero</h2>
        </div>

        {isLoadingChildren ? (
          <div className="glass-card p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : children.length === 0 ? (
          <div className="glass-card p-8 text-center border-dashed border-2">
            <div className="h-16 w-16 rounded-full bg-periwinkle/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-periwinkle" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No heroes yet!</h3>
            <p className="text-muted-foreground mb-4">Add a child profile first to create personalized stories.</p>
            <Link href="/dashboard/children/new">
              <Button className="btn-magic">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Hero
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <motion.button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${selectedChild === child.id
                  ? "border-periwinkle bg-periwinkle/10 shadow-lg shadow-periwinkle/10"
                  : "border-white/50 bg-white/40 hover:border-periwinkle/30 hover:bg-white/60"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl ${selectedChild === child.id ? "bg-periwinkle/20" : "bg-slate-100"
                    }`}>
                    {child.gender === "girl" ? "👧" : "👦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{child.nickname}</h3>
                    <p className="text-sm text-muted-foreground">{child.age_group} years old</p>
                  </div>
                  {selectedChild === child.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-6 w-6 rounded-full bg-periwinkle flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Step 2: Select Theme */}
      <motion.div variants={item} className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-8 w-8 rounded-xl bg-coral/20 flex items-center justify-center text-coral font-bold text-sm">2</span>
          <h2 className="text-xl font-bold">Pick a Value to Teach</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(THEME_LABELS) as ThemeType[]).map((theme) => {
            const colors = themeColors[theme];
            const isSelected = selectedTheme === theme;
            return (
              <motion.button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left group overflow-hidden ${isSelected
                  ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow}`
                  : "border-white/50 bg-white/40 hover:border-white/70 hover:bg-white/60"
                  }`}
              >
                {/* Background glow on hover */}
                <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-50 transition-opacity -z-10`} />

                <div className="flex items-start gap-4">
                  <span className="text-3xl transform group-hover:scale-110 transition-transform">
                    {THEME_ICONS[theme]}
                  </span>
                  <div className="flex-1">
                    <h3 className={`font-bold capitalize ${isSelected ? colors.text : ""}`}>
                      {theme}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {THEME_LABELS[theme].split(" - ")[1]}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`h-6 w-6 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center`}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Preview & Generate */}
      <motion.div variants={item}>
        <AnimatePresence mode="wait">
          {selectedChild && selectedTheme && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 mb-6 border-periwinkle/20 bg-gradient-to-r from-periwinkle/5 to-coral/5"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/60 flex items-center justify-center text-2xl">
                  {selectedChildData?.gender === "girl" ? "👧" : "👦"}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Creating a story for</p>
                  <p className="font-bold text-lg">
                    {selectedChildData?.nickname} • Learning {THEME_ICONS[selectedTheme]} {selectedTheme}
                  </p>
                </div>
                <Star className="h-6 w-6 text-coral" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full h-16 rounded-2xl text-lg relative overflow-hidden group transition-all ${canGenerate ? "btn-magic" : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              {generationStep}
            </span>
          ) : (
            <>
              <span className="relative z-10 flex items-center gap-3">
                <Wand2 className="h-5 w-5" />
                Generate Magic Story
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {canGenerate && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              )}
            </>
          )}
        </Button>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              ✨ Our AI is crafting a unique adventure... This may take 1-2 minutes.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Info Note */}
      <motion.p
        variants={item}
        className="text-center text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2"
      >
        <span className="h-6 w-6 rounded-full bg-sage/10 flex items-center justify-center">
          <BookOpen className="h-3 w-3 text-sage-dark" />
        </span>
        Each story includes custom AI illustrations and is saved to your library
      </motion.p>
    </motion.div>
  );
}
