import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached: NeonHttpDatabase<typeof schema> | null = null;

function init(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  cached = drizzle(neon(url), { schema });
  return cached;
}

// Lazy proxy so the connection is only created on first query — keeps
// `next build` from throwing when DATABASE_URL is absent at build time.
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const real = init() as unknown as Record<string | symbol, unknown>;
    const val = real[prop];
    return typeof val === "function" ? (val as (...a: unknown[]) => unknown).bind(real) : val;
  },
});

export { schema };
