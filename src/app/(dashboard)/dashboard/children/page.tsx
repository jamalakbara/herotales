import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChildCard } from "@/components/dashboard/child-card";

// Prevent static pre-rendering since we need auth
export const dynamic = 'force-dynamic';

export default async function ChildrenPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch children with story counts
  const { data: children } = await supabase
    .from("children")
    .select("*, stories(count)")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Heroes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your children&apos;s profiles for personalized stories
          </p>
        </div>
        <Link href="/dashboard/children/new">
          <Button className="btn-magic flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Child
          </Button>
        </Link>
      </div>

      {/* Children Grid */}
      {children && children.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={{
                ...child,
                story_count: child.stories?.[0]?.count || 0,
              }}
            />
          ))}

          {/* Add New Child Card */}
          <Link href="/dashboard/children/new">
            <Card className="h-full min-h-[200px] border-2 border-dashed border-primary/30 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer group">
              <CardContent className="h-full flex flex-col items-center justify-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <p className="font-medium text-primary">Add Another Hero</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <Card className="glass-card border-0 text-center py-16">
          <CardContent>
            <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No children yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your child&apos;s profile to start creating personalized stories
              where they become the hero!
            </p>
            <Link href="/dashboard/children/new">
              <Button className="btn-magic">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Child
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
