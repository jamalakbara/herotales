import { NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { requireUser, badRequest } from "@/lib/api";
import { db } from "@/lib/db";
import { children, stories } from "@/lib/db/schema";
import { getOrResetQuota } from "@/lib/quota";
import { inngest } from "@/lib/inngest/client";
import { BlueprintEnum, LengthEnum, VoiceEnum, ChildInputSchema } from "@/lib/types";
import type { StoryBlueprint, StoryStatus } from "@/lib/types";

const BLUEPRINT_VALUES: readonly StoryBlueprint[] = ["Bravery", "Honesty", "Patience", "Kindness", "Persistence"];
const STATUS_VALUES: readonly StoryStatus[] = ["pending", "generating", "ready", "failed"];

const CreateStory = z
  .object({
    child_id: z.string().uuid().optional(),
    child: ChildInputSchema.optional(),
    blueprint: BlueprintEnum,
    length: LengthEnum.default("Bedtime"),
    voice: VoiceEnum.default("Juniper"),
    hook: z.string().max(240).optional(),
  })
  .refine((v) => v.child_id || v.child, { message: "child_id or child required" });

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
  if (blueprint && (BLUEPRINT_VALUES as readonly string[]).includes(blueprint)) {
    conds.push(eq(stories.blueprint, blueprint as StoryBlueprint));
  }
  if (favorite === "true") conds.push(eq(stories.favorite, true));
  if (status && (STATUS_VALUES as readonly string[]).includes(status)) {
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

    return NextResponse.json({ stories: rows, total: total ?? 0, limit, offset });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Query failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const parsed = CreateStory.safeParse(body);
  if (!parsed.success) return badRequest("Invalid story request", parsed.error.flatten());

  const quota = await getOrResetQuota(userId);
  if (quota.remaining <= 0) {
    return NextResponse.json({ error: "Monthly story quota reached", quota }, { status: 402 });
  }

  let childId = parsed.data.child_id;
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
  } else if (childId) {
    const [owned] = await db
      .select({ id: children.id })
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, userId)));
    if (!owned) return NextResponse.json({ error: "Child not found" }, { status: 404 });
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

  return NextResponse.json({ story_id: story.id, status: "pending" }, { status: 202 });
}
