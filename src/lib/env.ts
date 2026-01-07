/**
 * Environment configuration helper
 * Centralizes environment checks for feature flags
 */

export type AppEnvironment = 'development' | 'staging' | 'production';

/**
 * Get current application environment
 */
export function getAppEnv(): AppEnvironment {
  const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;

  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return getAppEnv() === 'development';
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return getAppEnv() === 'production';
}

/**
 * Check if subscriptions are enabled
 * Disabled in production until payment gateway is ready
 */
export function isSubscriptionEnabled(): boolean {
  // Always enabled in development
  if (isDevelopment()) return true;

  // Check explicit flag for other environments
  return process.env.ENABLE_SUBSCRIPTIONS === 'true';
}

/**
 * Check if rate limiting is enabled
 * Only enabled in production to protect costs
 */
export function isRateLimitingEnabled(): boolean {
  // Never enabled in development
  if (isDevelopment()) return false;

  // Check explicit flag for other environments
  return process.env.ENABLE_RATE_LIMITING === 'true';
}

/**
 * Feature flags object for easy access
 */
export const features = {
  get subscriptions() {
    return isSubscriptionEnabled();
  },
  get rateLimiting() {
    return isRateLimitingEnabled();
  },
  get environment() {
    return getAppEnv();
  },
};
