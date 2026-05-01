import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, badRequest } from "@/lib/api";
import { adminClient } from "@/lib/supabase/admin";
import { getOrResetQuota } from "@/lib/quota";
import { inngest } from "@/lib/inngest/client";
import { BlueprintEnum, LengthEnum, VoiceEnum, ChildInputSchema } from "@/lib/types";
import type { StoryBlueprint, StoryStatus } from "@/lib/supabase/database.types";

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
  const { supabase, user } = auth;

  const url = new URL(req.url);
  const childId = url.searchParams.get("child_id");
  const blueprint = url.searchParams.get("blueprint");
  const favorite = url.searchParams.get("favorite");
  const status = url.searchParams.get("status");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 100);
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0", 10) || 0, 0);

  let q = supabase
    .from("stories")
    .select(
      "id, child_id, blueprint, length, voice, status, progress, title, favorite, created_at, completed_at, children(nickname, age, pronouns)",
      { count: "exact" },
    )
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (childId) q = q.eq("child_id", childId);
  if (blueprint && (BLUEPRINT_VALUES as readonly string[]).includes(blueprint)) {
    q = q.eq("blueprint", blueprint as StoryBlueprint);
  }
  if (favorite === "true") q = q.eq("favorite", true);
  if (status && (STATUS_VALUES as readonly string[]).includes(status)) {
    q = q.eq("status", status as StoryStatus);
  }

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stories: data ?? [], total: count ?? 0, limit, offset });
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const parsed = CreateStory.safeParse(body);
  if (!parsed.success) return badRequest("Invalid story request", parsed.error.flatten());

  const quota = await getOrResetQuota(user.id);
  if (quota.remaining <= 0) {
    return NextResponse.json(
      { error: "Monthly story quota reached", quota },
      { status: 402 },
    );
  }

  let childId = parsed.data.child_id;
  if (!childId && parsed.data.child) {
    const { data: created, error: cErr } = await supabase
      .from("children")
      .insert({
        parent_id: user.id,
        nickname: parsed.data.child.nickname,
        age: parsed.data.child.age,
        pronouns: parsed.data.child.pronouns,
        detail_tags: parsed.data.child.detail_tags ?? [],
        character_description: parsed.data.child.character_description ?? null,
      })
      .select("id")
      .single();
    if (cErr || !created) return NextResponse.json({ error: cErr?.message ?? "Child create failed" }, { status: 500 });
    childId = created.id;
  } else if (childId) {
    const { data: owned } = await supabase
      .from("children")
      .select("id")
      .eq("id", childId)
      .eq("parent_id", user.id)
      .single();
    if (!owned) return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const { data: story, error: sErr } = await supabase
    .from("stories")
    .insert({
      parent_id: user.id,
      child_id: childId!,
      blueprint: parsed.data.blueprint,
      length: parsed.data.length,
      voice: parsed.data.voice,
      hook: parsed.data.hook ?? null,
      status: "pending",
      progress: 0,
    })
    .select("id")
    .single();
  if (sErr || !story) return NextResponse.json({ error: sErr?.message ?? "Story create failed" }, { status: 500 });

  // fire async pipeline (admin client because it bypasses any header constraints)
  await inngest.send({ name: "story/requested", data: { storyId: story.id } });
  // ensure DB shows pending immediately even if inngest is offline
  await adminClient().from("stories").update({ status: "pending" }).eq("id", story.id);

  return NextResponse.json({ story_id: story.id, status: "pending" }, { status: 202 });
}
