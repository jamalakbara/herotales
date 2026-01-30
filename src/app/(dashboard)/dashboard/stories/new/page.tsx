"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  BookOpen,
  Heart,
  Shield,
  Clock,
  Mountain,
  Gem,
  Wand2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StoryLoading } from "@/components/shared/story-loading";
import { ThemeType, Child } from "@/types/database";

const themeCards: Array<{
  value: ThemeType;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
  bgGlow: string;
}> = [
    {
      value: "bravery",
      label: "Bravery",
      description: "Overcoming fear and facing challenges",
      icon: Shield,
      color: "from-amber-400 to-orange-500",
      bgGlow: "bg-amber-500/20",
    },
    {
      value: "honesty",
      label: "Honesty",
      description: "Telling the truth and being accountable",
      icon: Gem,
      color: "from-blue-400 to-indigo-500",
      bgGlow: "bg-blue-500/20",
    },
    {
      value: "patience",
      label: "Patience",
      description: "Waiting and understanding growth takes time",
      icon: Clock,
      color: "from-green-400 to-emerald-500",
      bgGlow: "bg-green-500/20",
    },
    {
      value: "kindness",
      label: "Kindness",
      description: "Empathy and helping others",
      icon: Heart,
      color: "from-pink-400 to-rose-500",
      bgGlow: "bg-pink-500/20",
    },
    {
      value: "persistence",
      label: "Persistence",
      description: "Not giving up when things get hard",
      icon: Mountain,
      color: "from-purple-400 to-violet-500",
      bgGlow: "bg-purple-500/20",
    },
  ];

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
      damping: 15
    }
  },
};

function NewStoryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load children on mount
  useEffect(() => {
    async function loadChildren() {
      setIsLoading(true);
      const { data } = await supabase
        .from("children")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setChildren(data);
        // Pre-select child from URL param
        const childIdParam = searchParams.get("childId");
        if (childIdParam && data.find((c) => c.id === childIdParam)) {
          setSelectedChildId(childIdParam);
        } else if (data.length === 1) {
          setSelectedChildId(data[0].id);
        }
      }
      setIsLoading(false);
    }
    loadChildren();
  }, []);

  const handleGenerate = async () => {
    if (!selectedChildId || !selectedTheme) {
      toast.error("Please select a child and theme");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          theme: selectedTheme,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate story");
      }

      toast.success("Story created! ✨");
      router.push(`/reader/${data.storyId}`);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate story"
      );
      setIsGenerating(false);
    }
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);

  // Show loading skeleton while generating
  if (isGenerating) {
    return (
      <StoryLoading
        childName={selectedChild?.nickname || "your hero"}
        theme={selectedTheme || "bravery"}
      />
    );
  }

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
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-all group"
        >
          <span className="h-8 w-8 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium">Back to dashboard</span>
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
          <span>Story Workshop Active</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
          Craft a <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-periwinkle via-coral to-periwinkle bg-[length:200%_auto] animate-gradient">
            Magical Tale
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg">
          Select your hero and choose a timeless lesson. Watch as AI weaves them into an unforgettable adventure.
        </p>
      </motion.div>

      {/* No children state */}
      {!isLoading && children.length === 0 && (
        <motion.div
          variants={item}
          className="glass-card p-12 border-white/50 bg-gradient-to-br from-white/80 to-white/40 rounded-3xl text-center relative overflow-hidden"
        >
          <div className="absolute right-[-30px] top-[-30px] opacity-5 pointer-events-none">
            <BookOpen size={180} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="h-20 w-20 rounded-3xl bg-muted/20 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Heroes Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Every story needs a hero. Create a child profile to begin your journey.
            </p>
            <Link href="/dashboard/children/new">
              <Button className="btn-magic h-14 px-8 rounded-2xl text-lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Add Your First Hero
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Story Configuration */}
      {children.length > 0 && (
        <div className="space-y-10">
          {/* Step 1: Select Child */}
          <motion.div variants={item} className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-periwinkle to-periwinkle/80 text-white text-sm font-bold shadow-lg shadow-periwinkle/20">
                1
              </span>
              <span>Choose Your Hero</span>
            </Label>
            <Select
              value={selectedChildId}
              onValueChange={setSelectedChildId}
            >
              <SelectTrigger className="h-16 rounded-2xl bg-white/60 border-white/60 backdrop-blur-sm text-lg focus:border-periwinkle/50 focus:ring-periwinkle/20">
                <SelectValue placeholder="Select a hero for this story" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id} className="py-3">
                    <span className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-gradient-to-br from-periwinkle/20 to-coral/20 flex items-center justify-center text-sm font-bold">
                        {child.nickname.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium">
                        {child.nickname}
                      </span>
                      <span className="text-muted-foreground">
                        • {child.age_group} years old
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Step 2: Select Theme */}
          <motion.div variants={item} className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-coral to-coral/80 text-white text-sm font-bold shadow-lg shadow-coral/20">
                2
              </span>
              <span>Choose Today&apos;s Lesson</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {themeCards.map((theme, index) => (
                <motion.button
                  key={theme.value}
                  type="button"
                  variants={item}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTheme(theme.value)}
                  className={`
                    relative p-6 rounded-3xl text-left transition-all border-2 overflow-hidden group
                    ${selectedTheme === theme.value
                      ? "border-foreground/20 bg-white/80 shadow-2xl"
                      : "border-white/40 bg-white/40 hover:bg-white/60 hover:border-white/60"
                    }
                  `}
                >
                  {/* Glow effect on selection */}
                  {selectedTheme === theme.value && (
                    <div className={`absolute inset-0 ${theme.bgGlow} blur-xl opacity-50`} />
                  )}

                  <div className="relative z-10">
                    <div
                      className={`
                        inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4
                        bg-gradient-to-br ${theme.color}
                        shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
                      `}
                      style={{
                        boxShadow: selectedTheme === theme.value
                          ? `0 10px 40px -10px rgba(0,0,0,0.3)`
                          : undefined
                      }}
                    >
                      <theme.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-bold text-xl mb-1">{theme.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {theme.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  {selectedTheme === theme.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 h-6 w-6 rounded-full bg-foreground text-white flex items-center justify-center"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div
            variants={item}
            className="pt-6"
          >
            <Button
              onClick={handleGenerate}
              disabled={!selectedChildId || !selectedTheme || isGenerating}
              className={`
                w-full h-20 rounded-3xl text-xl font-bold relative overflow-hidden group
                ${selectedChildId && selectedTheme
                  ? "btn-magic"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-7 w-7 animate-spin mr-3" />
                  Weaving Magic...
                </>
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-3">
                    <Wand2 className="h-6 w-6" />
                    Generate Story
                  </span>
                  <span className="absolute right-0 top-0 h-full w-20 bg-white/20 -skew-x-12 translate-x-24 group-hover:translate-x-0 transition-transform duration-500 ease-out flex items-center justify-center">
                    <ChevronRight className="h-8 w-8" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </>
              )}
            </Button>

            {/* Helper text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground"
            >
              <span className="h-6 w-6 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-xs">⏱️</span>
              <span>Story generation takes about 2-3 minutes</span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default function NewStoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-periwinkle/20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-periwinkle" />
          </div>
          <p className="text-sm text-muted-foreground">Loading story workshop...</p>
        </div>
      </div>
    }>
      <NewStoryForm />
    </Suspense>
  );
}
