import { NextRequest } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (for production, use Redis)
const store: RateLimitStore = {};

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

/**
 * Simple rate limiter
 * For production, replace with Redis-based solution (Upstash, etc.)
 */
export function rateLimit(options: RateLimitOptions) {
  return async (req: NextRequest, identifier: string) => {
    const now = Date.now();
    const key = `${identifier}`;

    // Clean up expired entries
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }

    // Initialize or get current count
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + options.interval,
      };
    }

    // Increment count
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > options.maxRequests) {
      const timeLeft = Math.ceil((store[key].resetTime - now) / 1000);
      return {
        success: false,
        limit: options.maxRequests,
        remaining: 0,
        reset: store[key].resetTime,
        retryAfter: timeLeft,
      };
    }

    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - store[key].count,
      reset: store[key].resetTime,
    };
  };
}

/**
 * Password reset rate limiter (3 requests per hour per email)
 */
export const passwordResetLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
});

/**
 * Broadcast notification rate limiter (10 broadcasts per hour per admin)
 */
export const broadcastLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
});

/**
 * Email rate limiter (100 emails per day per system)
 */
export const emailLimiter = rateLimit({
  interval: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 100,
});

/**
 * API rate limiter (100 requests per minute per IP)
 */
export const apiLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 100,
});

/**
 * Get client IP from request
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
