/**
 * Rate limiting utility using Upstash Redis
 * Provides tiered rate limiting based on user subscription status
 */

import { isRateLimitingEnabled } from './env';

// Rate limit configuration
const RATE_LIMITS = {
  // Free users: 1 story per day
  freeUser: {
    limit: 1,
    window: 24 * 60 * 60, // 24 hours in seconds
  },
  // Free users IP limit: 10 per day
  freeIp: {
    limit: 10,
    window: 24 * 60 * 60,
  },
  // Pro users IP limit: 50 per day (prevent account sharing abuse)
  proIp: {
    limit: 50,
    window: 24 * 60 * 60,
  },
};

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when limit resets
}

/**
 * Check rate limit using Upstash Redis REST API
 */
async function checkLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // If Upstash not configured, use in-memory fallback (for dev)
  if (!upstashUrl || !upstashToken) {
    console.warn('Upstash not configured, rate limiting disabled');
    return { success: true, limit, remaining: limit, reset: 0 };
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowSeconds)}`;

    // Increment counter
    const incrResponse = await fetch(`${upstashUrl}/incr/${windowKey}`, {
      headers: { Authorization: `Bearer ${upstashToken}` },
    });
    const incrData = await incrResponse.json();
    const count = incrData.result as number;

    // Set expiry if this is first request in window
    if (count === 1) {
      await fetch(`${upstashUrl}/expire/${windowKey}/${windowSeconds}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
    }

    const remaining = Math.max(0, limit - count);
    const reset = (Math.floor(now / windowSeconds) + 1) * windowSeconds;

    return {
      success: count <= limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if rate limiting is broken
    return { success: true, limit, remaining: limit, reset: 0 };
  }
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // Seconds until retry
  userRemaining?: number;
  ipRemaining?: number;
}

/**
 * Check if a story generation request is allowed
 * @param userId - User ID (from auth)
 * @param ip - Client IP address
 * @param isPro - Whether user has Pro subscription
 */
export async function checkStoryRateLimit(
  userId: string,
  ip: string,
  isPro: boolean
): Promise<RateLimitCheckResult> {
  // Skip rate limiting if disabled
  if (!isRateLimitingEnabled()) {
    return { allowed: true };
  }

  const now = Math.floor(Date.now() / 1000);

  // Pro users: only check IP limit (50/day)
  if (isPro) {
    const ipResult = await checkLimit(
      `pro:ip:${ip}`,
      RATE_LIMITS.proIp.limit,
      RATE_LIMITS.proIp.window
    );

    if (!ipResult.success) {
      return {
        allowed: false,
        reason: 'IP rate limit exceeded. Please try again later.',
        retryAfter: ipResult.reset - now,
        ipRemaining: 0,
      };
    }

    return {
      allowed: true,
      ipRemaining: ipResult.remaining,
    };
  }

  // Free users: check both user limit (1/day) and IP limit (10/day)
  const [userResult, ipResult] = await Promise.all([
    checkLimit(
      `free:user:${userId}`,
      RATE_LIMITS.freeUser.limit,
      RATE_LIMITS.freeUser.window
    ),
    checkLimit(
      `free:ip:${ip}`,
      RATE_LIMITS.freeIp.limit,
      RATE_LIMITS.freeIp.window
    ),
  ]);

  if (!userResult.success) {
    return {
      allowed: false,
      reason: 'You\'ve reached your daily story limit. Upgrade to Pro for unlimited stories!',
      retryAfter: userResult.reset - now,
      userRemaining: 0,
      ipRemaining: ipResult.remaining,
    };
  }

  if (!ipResult.success) {
    return {
      allowed: false,
      reason: 'Too many requests from this location. Please try again later.',
      retryAfter: ipResult.reset - now,
      userRemaining: userResult.remaining,
      ipRemaining: 0,
    };
  }

  return {
    allowed: true,
    userRemaining: userResult.remaining,
    ipRemaining: ipResult.remaining,
  };
}

/**
 * Format rate limit error for API response
 */
export function formatRateLimitError(result: RateLimitCheckResult) {
  const hours = result.retryAfter ? Math.ceil(result.retryAfter / 3600) : 24;

  return {
    error: result.reason || 'Rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: result.retryAfter,
    message: `Please try again in ${hours} hour${hours > 1 ? 's' : ''}.`,
  };
}
