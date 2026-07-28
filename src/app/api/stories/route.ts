import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { requireUser, parseJsonBody, checkRateLimit } from "@/lib/api";
import { storyCreateLimiter } from "@/lib/ratelimit";
import { acquireLock, invalidate, keys } from "@/lib/redis";
import { getErrorMessage } from "@/lib/errors";
import { db } from "@/lib/db";
import { children, stories } from "@/lib/db/schema";
import { signedImageUrl } from "@/lib/cloudinary";
import { getOrResetQuota } from "@/lib/quota";
import { inngest } from "@/lib/inngest/client";
import { BLUEPRINTS, STORY_STATUSES, StoryRequestSchema } from "@/lib/types";
import type { StoryBlueprint, StoryStatus } from "@/lib/types";

export async function GET(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;

  const url = new URL(req.url);
  const childId = url.searchParams.get("child_id");
  const blueprint = url.searchParams.get("blueprint");
  const favorite = url.searchParams.get("favorite");
  const status = url.searchParams.get("status");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 100);
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0", 10) || 0, 0);

  const conds = [eq(stories.parentId, userId)];
  if (childId) conds.push(eq(stories.childId, childId));
  if (blueprint && (BLUEPRINTS as readonly string[]).includes(blueprint)) {
    conds.push(eq(stories.blueprint, blueprint as StoryBlueprint));
  }
  if (favorite === "true") conds.push(eq(stories.favorite, true));
  if (status && (STORY_STATUSES as readonly string[]).includes(status)) {
    conds.push(eq(stories.status, status as StoryStatus));
  }
  const where = and(...conds);

  try {
    const [rows, [{ total }]] = await Promise.all([
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
          children: { nickname: children.nickname, age: children.age, pronouns: children.pronouns },
        })
        .from(stories)
        .leftJoin(children, eq(children.id, stories.childId))
        .where(where)
        .orderBy(desc(stories.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(stories).where(where),
    ]);

    // Replace the raw storage path with a signed delivery URL (cheap string build).
    const signed = rows.map(({ cover_storage_path, ...r }) => ({
      ...r,
      cover_url: cover_storage_path ? signedImageUrl(cover_storage_path) : null,
    }));

    return NextResponse.json({ stories: signed, total: total ?? 0, limit, offset });
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err, "Query failed") }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;

  const limited = await checkRateLimit(storyCreateLimiter(), userId);
  if (limited) return limited;

  const parsed = await parseJsonBody(req, StoryRequestSchema, "Invalid story request");
  if ("error" in parsed) return parsed.error;

  const quota = await getOrResetQuota(userId);
  if (quota.remaining <= 0) {
    return NextResponse.json({ error: "Monthly story quota reached", quota }, { status: 402 });
  }

  let childId = parsed.data.child_id;
  let createdChild = false;
  if (!childId && parsed.data.child) {
    const [created] = await db
      .insert(children)
      .values({
        parentId: userId,
        nickname: parsed.data.child.nickname,
        age: parsed.data.child.age,
        pronouns: parsed.data.child.pronouns,
        detailTags: parsed.data.child.detail_tags ?? [],
        characterDescription: parsed.data.child.character_description ?? null,
      })
      .returning({ id: children.id });
    if (!created) return NextResponse.json({ error: "Child create failed" }, { status: 500 });
    childId = created.id;
    createdChild = true;
  } else if (childId) {
    const [owned] = await db
      .select({ id: children.id })
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, userId)));
    if (!owned) return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  // Dedup lock: a rapid double-submit for the same child + blueprint must not
  // create a second row or fire a duplicate Inngest event. Released when the
  // pipeline finishes/fails (TTL is the safety net). Fails open if Redis is off.
  const lockKey = keys.storyLock(userId, childId!, parsed.data.blueprint);
  const locked = await acquireLock(lockKey, 300);
  if (!locked) {
    return NextResponse.json(
      { error: "A story for this hero is already being generated." },
      { status: 409 },
    );
  }

  const [story] = await db
    .insert(stories)
    .values({
      parentId: userId,
      childId: childId!,
      blueprint: parsed.data.blueprint,
      length: parsed.data.length,
      voice: parsed.data.voice,
      hook: parsed.data.hook ?? null,
      status: "pending",
      progress: 0,
    })
    .returning({ id: stories.id });
  if (!story) return NextResponse.json({ error: "Story create failed" }, { status: 500 });

  // fire async pipeline
  await inngest.send({ name: "story/requested", data: { storyId: story.id } });

  // Refresh hot-path caches: the dashboard's recent list changes now; children
  // list too if we just created a hero inline.
  await invalidate(
    keys.dashboard(userId),
    ...(createdChild ? [keys.children(userId)] : []),
  );

  return NextResponse.json({ story_id: story.id, status: "pending" }, { status: 202 });
}
