import { NextResponse } from "next/server";
import { requireUser, notFound, signImageUrlsForStory } from "@/lib/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const { id } = await ctx.params;

  const { data, error } = await supabase
    .from("stories")
    .select(
      "id, parent_id, child_id, blueprint, length, voice, status, progress, title, full_text, favorite, error, created_at, completed_at, children(nickname, age, pronouns, character_description)",
    )
    .eq("id", id)
    .eq("parent_id", user.id)
    .single();
  if (error || !data) return notFound("Story not found");

  const images = data.status === "ready" || data.status === "generating"
    ? await signImageUrlsForStory(user.id, id)
    : [];

  return NextResponse.json({ story: data, images });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const { id } = await ctx.params;

  // pull image paths so we can clean storage
  const { data: imgs } = await supabase
    .from("chapter_images")
    .select("storage_path, stories!inner(parent_id)")
    .eq("story_id", id);
  const paths = (imgs ?? [])
    .filter((r) => Array.isArray(r.stories) ? r.stories.some((s) => s.parent_id === user.id) : (r.stories as { parent_id: string } | null)?.parent_id === user.id)
    .map((r) => r.storage_path);

  if (paths.length) {
    await supabase.storage.from("story-assets").remove(paths);
  }

  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", id)
    .eq("parent_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
