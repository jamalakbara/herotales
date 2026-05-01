import { NextResponse } from "next/server";
import { createClient } from "./supabase/server";
import { adminClient } from "./supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { supabase, user };
}

export function badRequest(msg: string, details?: unknown) {
  return NextResponse.json({ error: msg, details }, { status: 400 });
}

export function notFound(msg = "Not found") {
  return NextResponse.json({ error: msg }, { status: 404 });
}

export async function signImageUrl(
  sb: SupabaseClient,
  storagePath: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const { data } = await sb.storage.from("story-assets").createSignedUrl(storagePath, expiresInSeconds);
  return data?.signedUrl ?? null;
}

export async function signImageUrlsForStory(parentId: string, storyId: string) {
  const sb = adminClient();
  const { data } = await sb
    .from("chapter_images")
    .select("chapter_index, storage_path")
    .eq("story_id", storyId)
    .order("chapter_index", { ascending: true });
  if (!data) return [];
  void parentId;
  const out: Array<{ chapter_index: number; url: string | null }> = [];
  for (const row of data) {
    out.push({
      chapter_index: row.chapter_index,
      url: await signImageUrl(sb, row.storage_path),
    });
  }
  return out;
}
