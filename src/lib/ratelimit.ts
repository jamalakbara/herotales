import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Named sliding-window limiters, keyed by Clerk userId in the callers.
// Construction never touches Redis (only .limit() does), so these are safe to
// build even when Upstash is unconfigured — checkRateLimit() short-circuits
// via redisEnabled() before ever calling .limit().
let _storyCreate: Ratelimit | null = null;
let _mutations: Ratelimit | null = null;

export function storyCreateLimiter(): Ratelimit {
  if (!_storyCreate) {
    _storyCreate = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:story-create",
    });
  }
  return _storyCreate;
}

export function mutationLimiter(): Ratelimit {
  if (!_mutations) {
    _mutations = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "rl:mutation",
    });
  }
  return _mutations;
}
