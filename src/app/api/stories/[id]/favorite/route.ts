import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireUser, notFound, checkRateLimit } from "@/lib/api";
import { mutationLimiter } from "@/lib/ratelimit";
import { invalidate, keys } from "@/lib/redis";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;
  const { id } = await ctx.params;

  const limited = await checkRateLimit(mutationLimiter(), userId);
  if (limited) return limited;

  let body: { favorite?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body = toggle */
  }

  let favorite = body.favorite;
  if (typeof favorite !== "boolean") {
    const [cur] = await db
      .select({ favorite: stories.favorite })
      .from(stories)
      .where(and(eq(stories.id, id), eq(stories.parentId, userId)));
    if (!cur) return notFound("Story not found");
    favorite = !cur.favorite;
  }

  const [data] = await db
    .update(stories)
    .set({ favorite })
    .where(and(eq(stories.id, id), eq(stories.parentId, userId)))
    .returning({ id: stories.id, favorite: stories.favorite });
  if (!data) return notFound("Story not found");
  await invalidate(keys.story(userId, id), keys.dashboard(userId));
  return NextResponse.json({ story: data });
}
