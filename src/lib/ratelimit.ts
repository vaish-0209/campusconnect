import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

/**
 * Rate limiter for general API endpoints
 * 10 requests per 10 seconds per IP
 */
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@ratelimit/general',
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 1 minute per IP
 */
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: '@ratelimit/auth',
});

/**
 * Rate limiter for file uploads
 * 3 uploads per 1 minute per user
 */
export const uploadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  prefix: '@ratelimit/upload',
});

/**
 * Rate limiter for bulk operations (admin only)
 * 2 requests per 1 minute per user
 */
export const bulkRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, '1 m'),
  analytics: true,
  prefix: '@ratelimit/bulk',
});
