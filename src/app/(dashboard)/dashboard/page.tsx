import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, Plus, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Prevent static pre-rendering since we need auth
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch children count
  const { count: childrenCount } = await supabase
    .from("children")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", user.id);

  // Fetch stories count
  const { count: storiesCount } = await supabase
    .from("stories")
    .select("*, children!inner(parent_id)", { count: "exact", head: true })
    .eq("children.parent_id", user.id);

  // Fetch recent stories
  const { data: recentStories } = await supabase
    .from("stories")
    .select("*, children!inner(nickname, parent_id)")
    .eq("children.parent_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to HeroTales ✨
          </h1>
          <p className="text-muted-foreground mt-1">
            Create magical stories where your child is the hero
          </p>
        </div>
        <Link href="/dashboard/stories/new">
          <Button className="btn-magic flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create New Story
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Heroes
            </CardTitle>
            <Users className="h-5 w-5 text-periwinkle" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{childrenCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {childrenCount === 0
                ? "Add your first child to get started"
                : "Children with profiles"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stories Created
            </CardTitle>
            <BookOpen className="h-5 w-5 text-sage" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{storiesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Magical adventures written
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick Action
            </CardTitle>
            <Plus className="h-5 w-5 text-coral" />
          </CardHeader>
          <CardContent>
            {(childrenCount || 0) === 0 ? (
              <Link href="/dashboard/children/new">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-2 border-dashed border-coral/50 hover:border-coral hover:bg-coral/5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Child
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/stories/new">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create a New Story
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Stories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Stories</h2>
          {(storiesCount || 0) > 0 && (
            <Link
              href="/dashboard/stories"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {recentStories && recentStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentStories.map((story) => (
              <Link key={story.id} href={`/reader/${story.id}`}>
                <Card className="story-card cursor-pointer h-full glass border-0 hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {story.theme}
                      </span>
                      <span>•</span>
                      <span>
                        {story.children?.nickname || "Unknown"}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {story.title || "Untitled Story"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(story.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="glass-card border-0 text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No stories yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first magical adventure!
              </p>
              <Link href={childrenCount ? "/dashboard/stories/new" : "/dashboard/children/new"}>
                <Button className="btn-magic">
                  {childrenCount ? "Create First Story" : "Add a Child First"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
