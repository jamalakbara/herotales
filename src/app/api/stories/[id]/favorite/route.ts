import { NextResponse } from "next/server";
import { requireUser, notFound } from "@/lib/api";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;
  const { id } = await ctx.params;

  let body: { favorite?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body = toggle */
  }

  let favorite = body.favorite;
  if (typeof favorite !== "boolean") {
    const { data: cur } = await supabase
      .from("stories")
      .select("favorite")
      .eq("id", id)
      .eq("parent_id", user.id)
      .single();
    if (!cur) return notFound("Story not found");
    favorite = !cur.favorite;
  }

  const { data, error } = await supabase
    .from("stories")
    .update({ favorite })
    .eq("id", id)
    .eq("parent_id", user.id)
    .select("id, favorite")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return notFound("Story not found");
  return NextResponse.json({ story: data });
}
