"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Users, Sparkles, Smile, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/tilt-card";

interface ChildrenClientViewProps {
  childrenData: any[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  },
};

export default function ChildrenClientView({ childrenData }: ChildrenClientViewProps) {
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-periwinkle/20 text-periwinkle",
      "bg-sage/20 text-sage-dark",
      "bg-coral/20 text-coral",
      "bg-purple-200 text-purple-700",
      "bg-yellow-200 text-yellow-700",
      "bg-pink-200 text-pink-700",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12 relative">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-periwinkle/15 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-coral/10 rounded-full blur-[100px] -z-10 animate-pulse delay-700 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-sage/10 rounded-full blur-[90px] -z-10 animate-pulse delay-300 pointer-events-none" />

      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-periwinkle via-coral to-periwinkle bg-[length:200%_auto] animate-gradient">Heroes</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-xl">
            Manage the stars of your stories. Each profile personalizes the magical adventures generated for them.
          </p>
        </div>
        <Link href="/dashboard/children/new">
          <Button className="btn-magic h-14 px-8 text-lg rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40">
            <Plus className="h-5 w-5 mr-2" />
            Add Another Hero
          </Button>
        </Link>
      </motion.div>

      {/* Grid */}
      {childrenData && childrenData.length > 0 ? (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {childrenData.map((child) => (
            <motion.div variants={item} key={child.id}>
              <TiltCard className="h-full" rotationFactor={12}>
                <Link href={`/dashboard/children/${child.id}`} className="block h-full">
                  <div className="glass-card h-full p-0 border-white/50 bg-gradient-to-b from-white/70 to-white/30 hover:border-periwinkle/40 transition-all duration-300 group relative overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-periwinkle/5 via-cream to-sage/5 relative">
                      <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground border border-white/20">
                        {child.stories?.[0]?.count || 0} Stories
                      </div>
                    </div>
                    <div className="absolute top-16 left-8">
                      <div className={`h-24 w-24 rounded-3xl rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-xl border-4 border-white flex items-center justify-center text-4xl font-bold ${getAvatarColor(child.nickname)}`}>
                        {child.nickname.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="pt-12 px-8 pb-8">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        {child.nickname}
                        <Sparkles className="h-4 w-4 text-coral opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground bg-white/40 p-2 rounded-lg backdrop-blur-sm">
                          <Crown className="h-4 w-4 mr-3 text-yellow-500/70" />
                          <span>{child.age} years old</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground bg-white/40 p-2 rounded-lg backdrop-blur-sm">
                          <Smile className="h-4 w-4 mr-3 text-periwinkle/70" />
                          <span className="truncate">{child.interests?.join(", ") || "No interests added"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-r from-periwinkle/20 to-coral/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
          <motion.div variants={item}>
            <TiltCard className="h-full" rotationFactor={8}>
              <Link href="/dashboard/children/new" className="block h-full">
                <div className="h-full min-h-[300px] border-3 border-dashed border-muted-foreground/20 rounded-[2rem] hover:border-coral/40 hover:bg-coral/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 group cursor-pointer bg-white/20 backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                    <Plus className="h-8 w-8 text-muted-foreground group-hover:text-coral transition-colors" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground group-hover:text-coral transition-colors">Add Another Hero</p>
                </div>
              </Link>
            </TiltCard>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div variants={item} className="flex justify-center py-20">
          <TiltCard>
            <div className="glass-card max-w-lg border-0 text-center py-16 px-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-periwinkle/5 to-coral/5 -z-10" />
              <div className="h-24 w-24 bg-white/60 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg animate-bounce-slow">
                <Users className="h-10 w-10 text-periwinkle" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No heroes found</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                To generate personalized stories, you first need to add a child (hero) profile. It only takes a minute!
              </p>
              <Link href="/dashboard/children/new">
                <Button className="btn-magic h-12 px-8 text-base">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Hero
                </Button>
              </Link>
            </div>
          </TiltCard>
        </motion.div>
      )}
    </motion.div>
  );
}
