import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { cached, invalidate, keys, ttl } from "@/lib/redis";

export type QuotaStatus = {
  quota: number;
  used: number;
  remaining: number;
  periodStart: string;
};

export async function getOrResetQuota(userId: string): Promise<QuotaStatus> {
  const today = new Date().toISOString().slice(0, 10);

  // Lazy-create the profile row (replaces the old handle_new_user auth trigger).
  await db
    .insert(profiles)
    .values({ id: userId, quotaPeriodStart: today })
    .onConflictDoNothing({ target: profiles.id });

  const [data] = await db
    .select({
      storyQuotaMonthly: profiles.storyQuotaMonthly,
      storiesUsedThisMonth: profiles.storiesUsedThisMonth,
      quotaPeriodStart: profiles.quotaPeriodStart,
    })
    .from(profiles)
    .where(eq(profiles.id, userId));
  if (!data) throw new Error("Profile not found");

  const periodStart = new Date(data.quotaPeriodStart);
  const now = new Date();
  const sameMonth =
    periodStart.getUTCFullYear() === now.getUTCFullYear() &&
    periodStart.getUTCMonth() === now.getUTCMonth();

  if (!sameMonth) {
    const newStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      .toISOString()
      .slice(0, 10);
    const [reset] = await db
      .update(profiles)
      .set({ storiesUsedThisMonth: 0, quotaPeriodStart: newStart })
      .where(eq(profiles.id, userId))
      .returning({
        storyQuotaMonthly: profiles.storyQuotaMonthly,
        storiesUsedThisMonth: profiles.storiesUsedThisMonth,
        quotaPeriodStart: profiles.quotaPeriodStart,
      });
    if (!reset) throw new Error("Quota reset failed");
    // A month rolled over and we just reset the counter — drop any stale cache.
    await invalidate(keys.quota(userId));
    return {
      quota: reset.storyQuotaMonthly,
      used: reset.storiesUsedThisMonth,
      remaining: reset.storyQuotaMonthly - reset.storiesUsedThisMonth,
      periodStart: reset.quotaPeriodStart,
    };
  }

  return {
    quota: data.storyQuotaMonthly,
    used: data.storiesUsedThisMonth,
    remaining: data.storyQuotaMonthly - data.storiesUsedThisMonth,
    periodStart: data.quotaPeriodStart,
  };
}

// Cached read for non-enforcement paths (dashboard / children lists). Slightly
// stale (<=60s) is fine here. Enforcement paths (story POST) call the
// authoritative getOrResetQuota directly so month-rollover + limits are exact.
export function getQuotaCached(userId: string): Promise<QuotaStatus> {
  return cached(keys.quota(userId), ttl.quota, () => getOrResetQuota(userId));
}

export function invalidateQuota(userId: string): Promise<void> {
  return invalidate(keys.quota(userId));
}
