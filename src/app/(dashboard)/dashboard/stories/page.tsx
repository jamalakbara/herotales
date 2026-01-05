import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { THEME_ICONS, THEME_LABELS, ThemeType } from "@/types/database";

// Prevent static pre-rendering since we need auth
export const dynamic = 'force-dynamic';

export default async function StoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all stories with child info
  const { data: stories } = await supabase
    .from("stories")
    .select("*, children!inner(nickname, parent_id)")
    .eq("children.parent_id", user.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Story Library</h1>
          <p className="text-muted-foreground mt-1">
            All the magical adventures you&apos;ve created
          </p>
        </div>
        <Link href="/dashboard/stories/new">
          <Button className="btn-magic flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Story
          </Button>
        </Link>
      </div>

      {/* Stories Grid */}
      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link key={story.id} href={`/reader/${story.id}`}>
              <Card className="story-card cursor-pointer h-full glass border-0 hover:shadow-xl group">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1 bg-primary/10 text-primary"
                    >
                      {THEME_ICONS[story.theme as ThemeType]}{" "}
                      {story.theme.charAt(0).toUpperCase() + story.theme.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {story.title || "Untitled Story"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      👤 {story.children?.nickname}
                    </span>
                    <span>
                      {new Date(story.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="glass-card border-0 text-center py-16">
          <CardContent>
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first magical adventure! Each story is uniquely
              generated with your child as the hero.
            </p>
            <Link href="/dashboard/stories/new">
              <Button className="btn-magic">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Story
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
