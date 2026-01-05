"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Pencil, Trash2, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChildWithStories } from "@/types/database";

interface ChildCardProps {
  child: ChildWithStories;
}

// Fun avatar colors based on name
const avatarColors = [
  "bg-periwinkle",
  "bg-sage",
  "bg-coral",
  "bg-amber-400",
  "bg-pink-400",
  "bg-cyan-400",
];

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

export function ChildCard({ child }: ChildCardProps) {
  const initials = child.nickname
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarColor = getAvatarColor(child.nickname);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="glass-card border-0 h-full overflow-hidden group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className={`h-14 w-14 ${avatarColor}`}>
                <AvatarFallback className="text-white font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{child.nickname}</h3>
                <p className="text-sm text-muted-foreground">
                  Age: {child.age_group} years old
                </p>
              </div>
            </div>
            <Link href={`/dashboard/children/${child.id}/edit`}>
              <Button
                size="icon"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Story Count Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              <BookOpen className="h-3 w-3 mr-1" />
              {child.story_count || 0} {child.story_count === 1 ? "story" : "stories"}
            </Badge>
          </div>

          {/* Character Description Preview */}
          {child.character_description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {child.character_description}
            </p>
          )}

          {/* Action Button */}
          <Link href={`/dashboard/stories/new?childId=${child.id}`}>
            <Button className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Story for {child.nickname.split(" ")[0]}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
