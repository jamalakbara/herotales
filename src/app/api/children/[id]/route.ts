import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, badRequest, notFound } from "@/lib/api";

const PatchChild = z
  .object({
    nickname: z.string().min(1).max(40).optional(),
    age: z.number().int().min(2).max(8).optional(),
    pronouns: z.string().min(1).max(40).optional(),
    detail_tags: z.array(z.string().max(60)).max(12).optional(),
    character_description: z.string().max(1000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Empty patch" });

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const parsed = PatchChild.safeParse(body);
  if (!parsed.success) return badRequest("Invalid patch", parsed.error.flatten());

  const { data, error } = await supabase
    .from("children")
    .update(parsed.data)
    .eq("id", id)
    .eq("parent_id", user.id)
    .select("id, nickname, age, pronouns, detail_tags, character_description, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return notFound("Child not found");
  return NextResponse.json({ child: data });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const { id } = await ctx.params;

  const { error } = await supabase
    .from("children")
    .delete()
    .eq("id", id)
    .eq("parent_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
