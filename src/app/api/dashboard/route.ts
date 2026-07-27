import { NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { db } from "@/lib/db";
import { children, profiles, stories } from "@/lib/db/schema";
import { signedImageUrl } from "@/lib/cloudinary";
import { getOrResetQuota } from "@/lib/quota";
import { cached, keys, ttl } from "@/lib/redis";

export async function GET() {
  try {
    const auth = await requireUser();
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    // Cache the whole aggregation — this endpoint is client-polled. Busted on
    // story/child create/update (see stories + children routes + Inngest).
    const payload = await cached(keys.dashboard(userId), ttl.dashboard, async () => {
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
          portrait_storage_path: children.portraitStoragePath,
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
          cover_storage_path: stories.coverStoragePath,
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

    const recentSigned = recent.map(({ cover_storage_path, ...s }) => ({
      ...s,
      cover_url: cover_storage_path ? signedImageUrl(cover_storage_path) : null,
    }));

    const perKid = kids.map(({ portrait_storage_path, ...k }) => {
      const own = recent.filter((s) => s.child_id === k.id);
      return {
        ...k,
        portrait_url: portrait_storage_path ? signedImageUrl(portrait_storage_path) : null,
        tales: own.length,
        favorites: own.filter((s) => s.favorite).length,
      };
    });

      return {
        profile: profileRows[0] ?? null,
        quota,
        kids: perKid,
        recent_stories: recentSigned,
      };
    });

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[/api/dashboard]", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Internal server error") },
      { status: 500 },
    );
  }
}
