import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StoriesClientView from "./client-view";

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

  // Fetch all stories with child info (including generating ones)
  const { data: stories } = await supabase
    .from("stories")
    .select("*, children!inner(nickname, parent_id)")
    .eq("children.parent_id", user.id)
    .order("created_at", { ascending: false });

  return <StoriesClientView stories={stories || []} />;
}
