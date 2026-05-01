import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { adminClient } from "@/lib/supabase/admin";

export async function POST() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const sb = adminClient();

  // 1. list & remove all storage objects under users/{id}/
  const prefix = `users/${user.id}`;
  async function purge(folder: string) {
    const { data, error } = await sb.storage.from("story-assets").list(folder, { limit: 1000 });
    if (error || !data) return;
    const files = data.filter((d) => d.id);
    const subdirs = data.filter((d) => !d.id);
    if (files.length) {
      await sb.storage.from("story-assets").remove(files.map((f) => `${folder}/${f.name}`));
    }
    for (const sub of subdirs) await purge(`${folder}/${sub.name}`);
  }
  await purge(prefix);

  // 2. delete profile (cascades to children, stories, chapter_images)
  await sb.from("profiles").delete().eq("id", user.id);

  // 3. delete auth user (also cascades via FK on profiles)
  await sb.auth.admin.deleteUser(user.id);

  return NextResponse.json({ ok: true });
}
