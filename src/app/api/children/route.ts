import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, badRequest } from "@/lib/api";

const CreateChild = z.object({
  nickname: z.string().min(1).max(40),
  age: z.number().int().min(2).max(8),
  pronouns: z.string().min(1).max(40),
  detail_tags: z.array(z.string().max(60)).max(12).optional(),
  character_description: z.string().max(1000).optional(),
  avatar_idx: z.number().int().min(0).max(7).optional(),
  narrator_voice: z.string().max(40).optional(),
  growth_traits: z.array(z.string().max(60)).max(8).optional(),
  quirk: z.string().max(500).optional(),
  skip_scary: z.boolean().optional(),
  short_stories: z.boolean().optional(),
  use_real_name: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("children")
    .select("id, nickname, age, pronouns, detail_tags, character_description, avatar_idx, narrator_voice, growth_traits, quirk, skip_scary, short_stories, use_real_name, created_at")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ children: data ?? [] });
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
  const parsed = CreateChild.safeParse(body);
  if (!parsed.success) return badRequest("Invalid child", parsed.error.flatten());

  const { data, error } = await supabase
    .from("children")
    .insert({ ...parsed.data, parent_id: user.id, detail_tags: parsed.data.detail_tags ?? [], growth_traits: parsed.data.growth_traits ?? [] })
    .select("id, nickname, age, pronouns, detail_tags, character_description, avatar_idx, narrator_voice, growth_traits, quirk, skip_scary, short_stories, use_real_name, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ child: data }, { status: 201 });
}
