"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StoryLoading } from "@/components/shared/story-loading";
import { ThemeType, THEME_LABELS, Child } from "@/types/database";

const themeCards: Array<{
  value: ThemeType;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
}> = [
    {
      value: "bravery",
      label: "Bravery",
      description: "Overcoming fear and facing challenges",
      icon: Shield,
      color: "from-amber-400 to-orange-500",
    },
    {
      value: "honesty",
      label: "Honesty",
      description: "Telling the truth and being accountable",
      icon: Gem,
      color: "from-blue-400 to-indigo-500",
    },
    {
      value: "patience",
      label: "Patience",
      description: "Waiting and understanding growth takes time",
      icon: Clock,
      color: "from-green-400 to-emerald-500",
    },
    {
      value: "kindness",
      label: "Kindness",
      description: "Empathy and helping others",
      icon: Heart,
      color: "from-pink-400 to-rose-500",
    },
    {
      value: "persistence",
      label: "Persistence",
      description: "Not giving up when things get hard",
      icon: Mountain,
      color: "from-purple-400 to-violet-500",
    },
  ];

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
    <div className="max-w-3xl mx-auto">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-periwinkle mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Create a New Story</h1>
          <p className="text-muted-foreground mt-2">
            Choose a hero and a lesson for today&apos;s adventure
          </p>
        </div>

        {/* No children state */}
        {!isLoading && children.length === 0 && (
          <Card className="glass-card border-0 text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No heroes yet</h3>
              <p className="text-muted-foreground mb-4">
                Add a child profile before creating a story
              </p>
              <Link href="/dashboard/children/new">
                <Button className="btn-magic">Add Your First Hero</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Story Configuration */}
        {children.length > 0 && (
          <div className="space-y-8">
            {/* Step 1: Select Child */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm font-bold">
                  1
                </span>
                Choose Your Hero
              </Label>
              <Select
                value={selectedChildId}
                onValueChange={setSelectedChildId}
              >
                <SelectTrigger className="h-14 rounded-xl bg-white/50 text-lg">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      <span className="flex items-center gap-2">
                        <span className="text-xl">
                          {child.nickname.charAt(0).toUpperCase()}
                        </span>
                        <span>
                          {child.nickname} ({child.age_group} years old)
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Select Theme */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm font-bold">
                  2
                </span>
                Choose Today&apos;s Lesson
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themeCards.map((theme) => (
                  <motion.button
                    key={theme.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTheme(theme.value)}
                    className={`
                      p-4 rounded-2xl text-left transition-all border-2
                      ${selectedTheme === theme.value
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-transparent bg-white/50 hover:bg-white/80"
                      }
                    `}
                  >
                    <div
                      className={`
                      inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3
                      bg-gradient-to-br ${theme.color}
                    `}
                    >
                      <theme.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">{theme.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {theme.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedChildId && selectedTheme ? 1 : 0.5 }}
              className="pt-4"
            >
              <Button
                onClick={handleGenerate}
                disabled={!selectedChildId || !selectedTheme || isGenerating}
                className="w-full h-16 rounded-2xl btn-magic text-xl font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    Creating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 mr-3" />
                    Generate Story
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                ⏱️ Story generation takes about 2-3 minutes
              </p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function NewStoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <NewStoryForm />
    </Suspense>
  );
}
