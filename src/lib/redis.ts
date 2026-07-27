import { Redis } from "@upstash/redis";

// Upstash Redis is a *performance / abuse* layer, never a source of truth.
// Everything here fails OPEN: if Redis is unconfigured or unreachable, callers
// fall back to Postgres (cache) or simply proceed (locks / rate limits). This
// keeps local dev working without Upstash and keeps prod serving during an
// Upstash outage.
let client: Redis | null = null;

function init(): Redis {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set");
  client = new Redis({ url, token });
  return client;
}

// Lazy proxy — mirrors src/lib/db/index.ts so `next build` never needs the
// Upstash vars at build time and the client is created on first use only.
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const real = init() as unknown as Record<string | symbol, unknown>;
    const val = real[prop];
    return typeof val === "function" ? (val as (...a: unknown[]) => unknown).bind(real) : val;
  },
});

export function redisEnabled(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// ---- Single source of truth for cache keys + TTLs (DRY) ------------------

export const keys = {
  quota: (userId: string) => `quota:${userId}`,
  dashboard: (userId: string) => `dashboard:${userId}`,
  children: (userId: string) => `children:${userId}`,
  story: (userId: string, storyId: string) => `story:${userId}:${storyId}`,
  storyLock: (userId: string, childId: string, blueprint: string) =>
    `story-lock:${userId}:${childId}:${blueprint}`,
  signedUrl: (publicId: string) => `signed-url:${publicId}`,
} as const;

export const ttl = {
  quota: 60,
  dashboard: 30,
  children: 300,
  storyReady: 60, // terminal state, stable
  storyPending: 2, // matches the reader's 2s poll — bounds staleness
  storyLock: 300, // safety net; released explicitly on completion/failure
  signedUrl: 60 * 60 * 24, // deterministic per publicId (no expiry on the sig)
} as const;

// ---- Fail-open helpers ---------------------------------------------------

/**
 * Get-or-load. On any Redis miss/error the loader (DB) is the fallback.
 * `ttlSeconds` may be a function of the loaded value (e.g. cache terminal
 * states longer than in-progress ones).
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number | ((value: T) => number),
  loader: () => Promise<T>,
): Promise<T> {
  if (!redisEnabled()) return loader();
  try {
    const hit = await redis.get<T>(key);
    if (hit !== null && hit !== undefined) return hit;
  } catch (err) {
    console.error("[redis] get failed, falling back to DB", key, err);
    return loader();
  }
  const value = await loader();
  try {
    const ex = typeof ttlSeconds === "function" ? ttlSeconds(value) : ttlSeconds;
    await redis.set(key, value, { ex });
  } catch (err) {
    console.error("[redis] set failed", key, err);
  }
  return value;
}

export async function invalidate(...cacheKeys: string[]): Promise<void> {
  if (!redisEnabled() || cacheKeys.length === 0) return;
  try {
    await redis.del(...cacheKeys);
  } catch (err) {
    console.error("[redis] del failed", cacheKeys, err);
  }
}

/** Acquire an NX lock. Returns true if acquired (or Redis is off → fail-open). */
export async function acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
  if (!redisEnabled()) return true;
  try {
    const res = await redis.set(key, "1", { nx: true, ex: ttlSeconds });
    return res === "OK";
  } catch (err) {
    console.error("[redis] lock acquire failed, allowing through", key, err);
    return true;
  }
}

export async function releaseLock(key: string): Promise<void> {
  await invalidate(key);
}
