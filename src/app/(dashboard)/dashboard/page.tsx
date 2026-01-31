import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClientView from "./client-view";

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
    <DashboardClientView
      user={user}
      childrenCount={childrenCount || 0}
      storiesCount={storiesCount || 0}
      recentStories={recentStories || []}
    />
  );
}
