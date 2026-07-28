import { and, inArray, lt, sql } from "drizzle-orm";
import { inngest } from "../client";
import { db } from "../../db";
import { stories } from "../../db/schema";
import { invalidate, keys } from "../../redis";

// Safety net for stuck generations. A story is only marked "ready"/"failed" by
// the pipeline itself; if the process dies mid-run (crash, deploy, provider
// hang) it can sit in "pending"/"generating" forever and show as a permanent
// "Conjuring…" card. This cron flips anything stuck past the timeout to
// "failed" so the UI can surface it (and offer delete/retry).
const STALE_MINUTES = 15;

export const reapStaleStories = inngest.createFunction(
  { id: "reap-stale-stories", triggers: [{ cron: "*/5 * * * *" }] },
  async ({ step }) => {
    const reaped = await step.run("mark-stale-failed", async () => {
      return db
        .update(stories)
        .set({ status: "failed", error: "Generation timed out" })
        .where(
          and(
            inArray(stories.status, ["pending", "generating"]),
            lt(stories.createdAt, sql`now() - interval '${sql.raw(String(STALE_MINUTES))} minutes'`),
          ),
        )
        .returning({ id: stories.id, parentId: stories.parentId });
    });

    // Bust the affected users' caches so the failed state surfaces immediately.
    await step.run("invalidate-caches", async () => {
      const parents = new Set(reaped.map((r) => r.parentId));
      for (const uid of parents) {
        await invalidate(keys.dashboard(uid));
      }
      for (const r of reaped) {
        await invalidate(keys.story(r.parentId, r.id));
      }
    });

    return { reaped: reaped.length };
  },
);
