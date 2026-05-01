import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getOrResetQuota } from "@/lib/quota";

export async function GET() {
  try {
    const auth = await requireUser();
    if ("error" in auth) return auth.error;
    const { supabase, user } = auth;

    const [{ data: profile }, { data: kids }, { data: stories }, quota] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, display_name, streak_nights, last_read_date, story_quota_monthly, stories_used_this_month, quota_period_start")
        .eq("id", user.id)
        .single(),
      supabase
        .from("children")
        .select("id, nickname, age, pronouns, detail_tags, character_description, created_at")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("stories")
        .select("id, child_id, blueprint, length, voice, status, progress, title, favorite, created_at, completed_at, children(nickname)")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8),
      getOrResetQuota(user.id),
    ]);

    // per-kid stats
    const perKid = (kids ?? []).map((k) => {
      const own = (stories ?? []).filter((s) => s.child_id === k.id);
      return {
        ...k,
        tales: own.length,
        favorites: own.filter((s) => s.favorite).length,
      };
    });

    return NextResponse.json({
      profile,
      quota,
      kids: perKid,
      recent_stories: stories ?? [],
    });
  } catch (err) {
    console.error("[/api/dashboard]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
