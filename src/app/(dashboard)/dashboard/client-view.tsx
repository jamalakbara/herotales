"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Users, Plus, Sparkles, ArrowRight, Wand2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";

interface DashboardClientViewProps {
  user: any;
  childrenCount: number;
  storiesCount: number;
  recentStories: any[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export default function DashboardClientView({
  user,
  childrenCount,
  storiesCount,
  recentStories,
}: DashboardClientViewProps) {
  // Get user's first name
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Hero";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 relative min-h-[80vh] flex flex-col justify-center"
    >
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-periwinkle/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-coral/10 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />
      <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-sage/10 rounded-full blur-[90px] -z-10 animate-pulse delay-300" />

      {/* Header Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/40 backdrop-blur-xl text-sm font-medium text-muted-foreground mb-5 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
            </span>
            <span>Premium Story Engine Active</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Hello, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-periwinkle via-coral to-periwinkle bg-[length:200%_auto] animate-gradient">
              {userName}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-lg">
            Ready to craft another magical adventure? Your imagination is the only limit today.
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

      {/* BENTO GRID LAYOUT */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

        {/* Main Hero Stat - Spans 8 cols */}
        <div className="col-span-1 md:col-span-8">
          <TiltCard className="h-full">
            <Link href="/dashboard/children">
              <div className="glass-card h-full p-8 flex flex-col justify-between border-white/50 bg-gradient-to-br from-white/80 to-white/40 hover:border-periwinkle/30 group cursor-pointer relative overflow-hidden">
                {/* 3D Floating Icon Background */}
                <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                  <Users size={200} />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h3 className="text-muted-foreground font-medium text-lg mb-1">Your Heroes</h3>
                    <p className="text-sm text-muted-foreground/80">Manage profiles & preferences</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-periwinkle/10 flex items-center justify-center text-periwinkle group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                </div>

                <div className="relative z-10 mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold tracking-tighter text-foreground">{childrenCount}</span>
                    <span className="text-xl text-muted-foreground">active profiles</span>
                  </div>

                  {/* Avatar Stack Visual */}
                  <div className="flex items-center -space-x-3 mt-4 ml-1">
                    {[...Array(Math.min(3, Math.max(1, childrenCount)))].map((_, i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 shadow-md flex items-center justify-center text-xs font-bold text-slate-500">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                    {childrenCount > 3 && (
                      <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                        +{childrenCount - 3}
                      </div>
                    )}
                    {childrenCount === 0 && (
                      <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-lg">
                        <Plus className="h-4 w-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </TiltCard>
        </div>

        {/* Secondary Stat - Spans 4 cols */}
        <div className="col-span-1 md:col-span-4">
          <TiltCard className="h-full">
            <Link href="/dashboard/stories">
              <div className="glass-card h-full p-8 flex flex-col justify-between border-white/50 bg-gradient-to-br from-white/80 to-white/40 hover:border-sage/30 group cursor-pointer relative overflow-hidden">
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-20 transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
                  <BookOpen size={140} />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <h3 className="text-muted-foreground font-medium text-lg">Library</h3>
                  <div className="h-10 w-10 rounded-xl bg-sage/10 flex items-center justify-center text-sage-dark group-hover:rotate-12 transition-transform">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <span className="text-5xl font-bold tracking-tighter text-foreground block">{storiesCount}</span>
                  <span className="text-sm text-muted-foreground">tales written</span>
                </div>
              </div>
            </Link>
          </TiltCard>
        </div>

        {/* Recent Stories Row - Spans full width */}
        <div className="col-span-1 md:col-span-12 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Recent Adventures</h2>
            <Link href="/dashboard/stories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              View All &rarr;
            </Link>
          </div>

          {recentStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-64">
              {recentStories.map((story) => (
                <TiltCard key={story.id} className="h-full" rotationFactor={10}>
                  <Link href={`/reader/${story.id}`} className="block h-full">
                    <div className="glass-card h-full p-0 border-white/40 overflow-hidden group hover:border-primary/20 transition-colors bg-white/40">
                      <div className="h-1/2 bg-gradient-to-br from-periwinkle/5 to-sage/5 p-6 relative">
                        <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                          {story.theme}
                        </div>
                        <div className="absolute bottom-[-20px] left-6 text-4xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-lg">
                          {story.theme === "Adventure" ? "🗺️" :
                            story.theme === "Fantasy" ? "🦄" :
                              story.theme === "Sci-Fi" ? "🚀" : "✨"}
                        </div>
                      </div>
                      <div className="p-6 pt-10">
                        <h4 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">{story.title || "Untitled Story"}</h4>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                            {story.children?.nickname?.charAt(0) || "H"}
                          </span>
                          <span>For {story.children?.nickname}</span>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground/60">
                          {new Date(story.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </div>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              ))}
            </div>
          ) : (
            <div className="col-span-full h-40 glass-card border-dashed border-2 flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground mb-4">No stories yet. Create something magical!</p>
              <Link href={childrenCount ? "/dashboard/stories/new" : "/dashboard/children/new"}>
                <Button variant="outline" size="sm">Start Writing</Button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
