import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/db/schema";
import { parseJsonBody } from "@/lib/api";
import { WaitlistSchema } from "@/lib/types";

// Intentionally public (no requireUser): a pre-launch waitlist must accept
// anonymous emails. Zod validates the input; the unique email + onConflictDoNothing
// make re-submits idempotent.
export async function POST(req: Request) {
  const parsed = await parseJsonBody(req, WaitlistSchema, "Invalid email");
  if ("error" in parsed) return parsed.error;

  await db
    .insert(waitlist)
    .values({ email: parsed.data.email.toLowerCase() })
    .onConflictDoNothing({ target: waitlist.email });

  return NextResponse.json({ ok: true });
}
