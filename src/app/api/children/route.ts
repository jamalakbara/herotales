import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { requireUser, parseJsonBody, checkRateLimit } from "@/lib/api";
import { mutationLimiter } from "@/lib/ratelimit";
import { cached, invalidate, keys, ttl } from "@/lib/redis";
import { getErrorMessage } from "@/lib/errors";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { childSelect, toChildColumns } from "@/lib/db/children-fields";
import { signedImageUrl } from "@/lib/cloudinary";
import { getQuotaCached } from "@/lib/quota";
import { ChildFieldsSchema } from "@/lib/types";

// Swap the raw portrait storage path for a signed delivery URL. Kept local to
// the children API since it's the only consumer of the portrait field.
type ChildRow = { portrait_storage_path: string | null } & Record<string, unknown>;
function withPortrait({ portrait_storage_path, ...c }: ChildRow) {
  return { ...c, portrait_url: portrait_storage_path ? signedImageUrl(portrait_storage_path) : null };
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;
  try {
    const [data, quota] = await Promise.all([
      cached(keys.children(userId), ttl.children, async () =>
        db
          .select(childSelect)
          .from(children)
          .where(eq(children.parentId, userId))
          .orderBy(asc(children.createdAt)),
      ),
      getQuotaCached(userId),
    ]);
    return NextResponse.json({ children: data.map(withPortrait), quota });
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err, "Query failed") }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { userId } = auth;

  const limited = await checkRateLimit(mutationLimiter(), userId);
  if (limited) return limited;

  const parsed = await parseJsonBody(req, ChildFieldsSchema, "Invalid child");
  if ("error" in parsed) return parsed.error;

  const [data] = await db
    .insert(children)
    .values({
      ...toChildColumns(parsed.data),
      parentId: userId,
      nickname: parsed.data.nickname,
      age: parsed.data.age,
      pronouns: parsed.data.pronouns,
      detailTags: parsed.data.detail_tags ?? [],
      growthTraits: parsed.data.growth_traits ?? [],
    })
    .returning(childSelect);
  if (!data) return NextResponse.json({ error: "Child create failed" }, { status: 500 });
  await invalidate(keys.children(userId), keys.dashboard(userId));
  return NextResponse.json({ child: withPortrait(data) }, { status: 201 });
}
