import { adminClient } from "./supabase/admin";

export type QuotaStatus = {
  quota: number;
  used: number;
  remaining: number;
  periodStart: string;
};

export async function getOrResetQuota(userId: string): Promise<QuotaStatus> {
  const sb = adminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error: upsertErr } = await sb
    .from("profiles")
    .upsert({ id: userId, quota_period_start: today }, { onConflict: "id", ignoreDuplicates: true });
  if (upsertErr) throw new Error(upsertErr.message);

  const { data, error } = await sb
    .from("profiles")
    .select("story_quota_monthly, stories_used_this_month, quota_period_start")
    .eq("id", userId)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Profile not found");

  const periodStart = new Date(data.quota_period_start);
  const now = new Date();
  const sameMonth =
    periodStart.getUTCFullYear() === now.getUTCFullYear() &&
    periodStart.getUTCMonth() === now.getUTCMonth();

  if (!sameMonth) {
    const newStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      .toISOString()
      .slice(0, 10);
    const { data: reset, error: e2 } = await sb
      .from("profiles")
      .update({ stories_used_this_month: 0, quota_period_start: newStart })
      .eq("id", userId)
      .select("story_quota_monthly, stories_used_this_month, quota_period_start")
      .single();
    if (e2 || !reset) throw new Error(e2?.message ?? "Quota reset failed");
    return {
      quota: reset.story_quota_monthly,
      used: reset.stories_used_this_month,
      remaining: reset.story_quota_monthly - reset.stories_used_this_month,
      periodStart: reset.quota_period_start,
    };
  }

  return {
    quota: data.story_quota_monthly,
    used: data.stories_used_this_month,
    remaining: data.story_quota_monthly - data.stories_used_this_month,
    periodStart: data.quota_period_start,
  };
}
