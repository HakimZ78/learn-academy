/**
 * Enterprise Rate Limiting Configuration
 * Learn Academy - SOC2/ISO27001 Compliant Rate Limiting
 *
 * Features:
 * - Redis-backed distributed rate limiting (production)
 * - In-memory fallback for development/testing
 * - Multiple rate limit types (form submissions, API calls, login attempts)
 * - Comprehensive audit logging
 * - IP-based and user-based limiting
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logSecurityEvent } from "./audit";

// Rate limit configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Contact form submissions
  contact: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // 3 submissions per 15 minutes per IP
    identifier: "contact_form",
    description: "Contact form submissions",
  },

  // Enrollment form submissions
  enrollment: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    maxRequests: 2, // 2 submissions per 30 minutes per IP
    identifier: "enrollment_form",
    description: "Enrollment form submissions",
  },

  // General API requests
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute per IP
    identifier: "api_requests",
    description: "General API requests",
  },

  // Authentication attempts
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes per IP
    identifier: "auth_attempts",
    description: "Authentication attempts",
  },

  // Password reset requests
  password_reset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 password reset requests per hour per IP
    identifier: "password_reset",
    description: "Password reset requests",
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

// Redis configuration
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Rate limiter instances
const rateLimiters = new Map<RateLimitType, Ratelimit>();

// In-memory fallback store for development
const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Initialize rate limiter for a specific type
 */
function getRateLimiter(type: RateLimitType): Ratelimit | null {
  if (!redis) {
    return null; // Fall back to in-memory limiting
  }

  if (!rateLimiters.has(type)) {
    const config = RATE_LIMIT_CONFIGS[type];

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        config.maxRequests,
        `${config.windowMs}ms`,
      ),
      analytics: true,
    });

    rateLimiters.set(type, limiter);
  }

  return rateLimiters.get(type)!;
}

/**
 * In-memory rate limiting fallback
 */
function checkMemoryRateLimit(
  identifier: string,
  config: (typeof RATE_LIMIT_CONFIGS)[RateLimitType],
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${config.identifier}_${identifier}`;

  let entry = memoryStore.get(key);

  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  const allowed = entry.count < config.maxRequests;

  if (allowed) {
    entry.count++;
  }

  memoryStore.set(key, entry);

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}

/**
 * Check rate limit for a specific identifier and type
 */
export async function checkRateLimit(
  type: RateLimitType,
  identifier: string,
  metadata?: Record<string, any>,
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  usingRedis: boolean;
}> {
  const config = RATE_LIMIT_CONFIGS[type];
  const limiter = getRateLimiter(type);

  try {
    if (limiter && redis) {
      // Use Redis-backed rate limiting
      const result = await limiter.limit(identifier);

      // Log rate limit check for audit
      if (!result.success) {
        await logSecurityEvent({
          eventType: "rate_limit_exceeded",
          ipAddress: identifier,
          userAgent: "unknown",
          requestPath: `rate_limit_${type}`,
          metadata: {
            rateLimitType: type,
            limit: config.maxRequests,
            window: config.windowMs,
            remaining: result.remaining,
            resetTime: result.reset,
            usingRedis: true,
            ...metadata,
          },
        });
      }

      return {
        allowed: result.success,
        remaining: result.remaining,
        resetTime: result.reset,
        usingRedis: true,
      };
    } else {
      // Fall back to in-memory rate limiting
      const result = checkMemoryRateLimit(identifier, config);

      // Log rate limit check for audit
      if (!result.allowed) {
        await logSecurityEvent({
          eventType: "rate_limit_exceeded",
          ipAddress: identifier,
          userAgent: "unknown",
          requestPath: `rate_limit_${type}`,
          metadata: {
            rateLimitType: type,
            limit: config.maxRequests,
            window: config.windowMs,
            remaining: result.remaining,
            resetTime: result.resetTime,
            usingRedis: false,
            fallbackReason: redis
              ? "Redis connection failed"
              : "Redis not configured",
            ...metadata,
          },
        });
      }

      return {
        ...result,
        usingRedis: false,
      };
    }
  } catch (error) {
    // Log error and fall back to in-memory
    console.error("Rate limiting error:", error);

    await logSecurityEvent({
      eventType: "suspicious_activity",
      ipAddress: identifier,
      userAgent: "unknown",
      requestPath: `rate_limit_${type}`,
      metadata: {
        error: "Rate limiting system error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        fallbackUsed: true,
        rateLimitType: type,
        ...metadata,
      },
    });

    const result = checkMemoryRateLimit(identifier, config);
    return {
      ...result,
      usingRedis: false,
    };
  }
}

/**
 * Reset rate limit for a specific identifier and type
 * Useful for admin operations or after successful verification
 */
export async function resetRateLimit(
  type: RateLimitType,
  identifier: string,
): Promise<boolean> {
  const config = RATE_LIMIT_CONFIGS[type];
  const limiter = getRateLimiter(type);

  try {
    if (limiter && redis) {
      // Reset Redis-backed rate limit
      await redis.del(`ratelimit:${identifier}`);
      return true;
    } else {
      // Reset in-memory rate limit
      const key = `${config.identifier}_${identifier}`;
      memoryStore.delete(key);
      return true;
    }
  } catch (error) {
    console.error("Rate limit reset error:", error);
    return false;
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  type: RateLimitType,
  identifier: string,
): Promise<{
  remaining: number;
  resetTime: number;
  usingRedis: boolean;
} | null> {
  const config = RATE_LIMIT_CONFIGS[type];
  const limiter = getRateLimiter(type);

  try {
    if (limiter && redis) {
      // Get Redis status
      const key = `ratelimit:${identifier}`;
      const count = ((await redis.get(key)) as number) || 0;
      const ttl = await redis.ttl(key);

      return {
        remaining: Math.max(0, config.maxRequests - count),
        resetTime: Date.now() + ttl * 1000,
        usingRedis: true,
      };
    } else {
      // Get in-memory status
      const key = `${config.identifier}_${identifier}`;
      const entry = memoryStore.get(key);

      if (!entry) {
        return {
          remaining: config.maxRequests,
          resetTime: Date.now() + config.windowMs,
          usingRedis: false,
        };
      }

      return {
        remaining: Math.max(0, config.maxRequests - entry.count),
        resetTime: entry.resetTime,
        usingRedis: false,
      };
    }
  } catch (error) {
    console.error("Rate limit status error:", error);
    return null;
  }
}

/**
 * Clean up expired entries in memory store
 * Should be called periodically in production
 */
export function cleanupMemoryStore(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get comprehensive rate limiting metrics
 */
export async function getRateLimitMetrics(): Promise<{
  redisConnected: boolean;
  memoryStoreSize: number;
  configuredLimits: Record<
    RateLimitType,
    (typeof RATE_LIMIT_CONFIGS)[RateLimitType]
  >;
  environment: "redis" | "memory" | "hybrid";
}> {
  const redisConnected = redis !== null;

  let environment: "redis" | "memory" | "hybrid" = "memory";
  if (redisConnected) {
    try {
      await redis.ping();
      environment = "redis";
    } catch {
      environment = "hybrid"; // Redis configured but not working
    }
  }

  return {
    redisConnected,
    memoryStoreSize: memoryStore.size,
    configuredLimits: RATE_LIMIT_CONFIGS,
    environment,
  };
}
