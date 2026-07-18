import { NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/api";
import { db } from "@/lib/db";
import { children, profiles, stories } from "@/lib/db/schema";
import { getOrResetQuota } from "@/lib/quota";

export async function GET() {
  try {
    const auth = await requireUser();
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    // getOrResetQuota lazily creates the profile row, so run it first.
    const quota = await getOrResetQuota(userId);

    const [profileRows, kids, recent] = await Promise.all([
      db
        .select({
          id: profiles.id,
          email: profiles.email,
          display_name: profiles.displayName,
          streak_nights: profiles.streakNights,
          last_read_date: profiles.lastReadDate,
          story_quota_monthly: profiles.storyQuotaMonthly,
          stories_used_this_month: profiles.storiesUsedThisMonth,
          quota_period_start: profiles.quotaPeriodStart,
        })
        .from(profiles)
        .where(eq(profiles.id, userId)),
      db
        .select({
          id: children.id,
          nickname: children.nickname,
          age: children.age,
          pronouns: children.pronouns,
          detail_tags: children.detailTags,
          character_description: children.characterDescription,
          created_at: children.createdAt,
        })
        .from(children)
        .where(eq(children.parentId, userId))
        .orderBy(asc(children.createdAt)),
      db
        .select({
          id: stories.id,
          child_id: stories.childId,
          blueprint: stories.blueprint,
          length: stories.length,
          voice: stories.voice,
          status: stories.status,
          progress: stories.progress,
          title: stories.title,
          favorite: stories.favorite,
          created_at: stories.createdAt,
          completed_at: stories.completedAt,
          children: { nickname: children.nickname },
        })
        .from(stories)
        .leftJoin(children, eq(children.id, stories.childId))
        .where(eq(stories.parentId, userId))
        .orderBy(desc(stories.createdAt))
        .limit(8),
    ]);

    const perKid = kids.map((k) => {
      const own = recent.filter((s) => s.child_id === k.id);
      return {
        ...k,
        tales: own.length,
        favorites: own.filter((s) => s.favorite).length,
      };
    });

    return NextResponse.json({
      profile: profileRows[0] ?? null,
      quota,
      kids: perKid,
      recent_stories: recent,
    });
  } catch (err) {
    console.error("[/api/dashboard]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
