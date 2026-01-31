import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChildrenClientView from "./client-view";

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

  return <ChildrenClientView childrenData={children || []} />;
}
