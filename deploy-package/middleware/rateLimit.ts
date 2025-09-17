/**
 * API Rate Limiting Middleware
 * Learn Academy - SOC2/ISO27001 Compliant Rate Limiting
 *
 * Features:
 * - Global API rate limiting middleware
 * - Per-endpoint custom limits
 * - IP-based and user-based limiting
 * - Integration with centralized rate limiting system
 * - Comprehensive security logging
 * - DDoS protection
 */

import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  RATE_LIMIT_CONFIGS,
  RateLimitType,
} from "@/lib/rate-limit";
import { logSecurityEvent, logApiEvent } from "@/lib/audit";

/**
 * Rate limit configuration per API endpoint
 */
const API_RATE_LIMITS: Record<
  string,
  {
    type: RateLimitType;
    customLimits?: {
      maxRequests: number;
      windowMs: number;
    };
  }
> = {
  // Contact and form endpoints
  "/api/contact": { type: "contact" },
  "/api/csrf-token": { type: "api" },

  // Health and monitoring (more permissive)
  "/api/health": {
    type: "api",
    customLimits: { maxRequests: 200, windowMs: 60000 }, // 200/min
  },
  "/api/health/detailed": {
    type: "api",
    customLimits: { maxRequests: 100, windowMs: 60000 }, // 100/min
  },
  "/api/health/ready": {
    type: "api",
    customLimits: { maxRequests: 200, windowMs: 60000 }, // 200/min
  },

  // Future endpoints (will be enabled when implemented)
  "/api/enrollment": { type: "enrollment" },
  "/api/auth/login": { type: "auth" },
  "/api/auth/register": { type: "auth" },
  "/api/auth/reset-password": { type: "password_reset" },

  // Admin endpoints (very restrictive)
  "/api/admin": {
    type: "api",
    customLimits: { maxRequests: 10, windowMs: 60000 }, // 10/min
  },
};

/**
 * Get real IP address from request
 */
function getRealIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check if endpoint should be rate limited
 */
function shouldRateLimit(pathname: string): boolean {
  // Always rate limit API endpoints
  if (pathname.startsWith("/api/")) {
    return true;
  }

  // Rate limit specific form submission endpoints
  const rateLimitedPaths = ["/contact", "/enrol", "/portal/login"];

  return rateLimitedPaths.some((path) => pathname.includes(path));
}

/**
 * Get rate limit configuration for endpoint
 */
function getRateLimitConfig(pathname: string): {
  type: RateLimitType;
  customLimits?: { maxRequests: number; windowMs: number };
} {
  // Exact match first
  if (API_RATE_LIMITS[pathname]) {
    return API_RATE_LIMITS[pathname];
  }

  // Pattern matching for dynamic routes
  for (const [pattern, config] of Object.entries(API_RATE_LIMITS)) {
    if (pathname.startsWith(pattern)) {
      return config;
    }
  }

  // Default for any API endpoint
  if (pathname.startsWith("/api/")) {
    return { type: "api" };
  }

  // Default for non-API endpoints
  return { type: "api" };
}

/**
 * Create rate limit response
 */
function createRateLimitResponse(
  retryAfter: number,
  remaining: number,
  resetTime: number,
  usingRedis: boolean,
): NextResponse {
  const response = NextResponse.json(
    {
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        retryAfter,
        rateLimitInfo: {
          remaining,
          resetTime: new Date(resetTime).toISOString(),
          usingRedis,
        },
      },
    },
    { status: 429 },
  );

  // Add standard rate limiting headers
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(resetTime).toISOString());
  response.headers.set("Retry-After", retryAfter.toString());

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

  return response;
}

/**
 * Main rate limiting middleware function
 */
export async function rateLimitMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  const startTime = Date.now();
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const ip = getRealIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Skip rate limiting for certain paths
  const skipPaths = [
    "/_next/",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/images/",
    "/static/",
  ];

  if (skipPaths.some((path) => pathname.startsWith(path))) {
    return null; // Continue to next middleware
  }

  // Check if endpoint should be rate limited
  if (!shouldRateLimit(pathname)) {
    return null; // Continue to next middleware
  }

  try {
    // Get rate limit configuration for this endpoint
    const config = getRateLimitConfig(pathname);

    // Apply custom limits if specified
    let rateLimitResult;
    if (config.customLimits) {
      // For custom limits, we'll use the generic rate limiter but adjust the identifier
      const customIdentifier = `${config.type}_custom_${ip}`;
      rateLimitResult = await checkRateLimit(config.type, customIdentifier, {
        userAgent,
        requestPath: pathname,
        method,
        customLimits: config.customLimits,
      });
    } else {
      // Use standard rate limiting
      rateLimitResult = await checkRateLimit(config.type, ip, {
        userAgent,
        requestPath: pathname,
        method,
      });
    }

    // If rate limit exceeded, return 429 response
    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000,
      );

      // Log rate limit violation
      await logSecurityEvent({
        eventType: "rate_limit_exceeded",
        ipAddress: ip,
        userAgent,
        requestPath: pathname,
        metadata: {
          method,
          rateLimitType: config.type,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
          usingRedis: rateLimitResult.usingRedis,
          customLimits: config.customLimits,
        },
      });

      return createRateLimitResponse(
        retryAfter,
        rateLimitResult.remaining,
        rateLimitResult.resetTime,
        rateLimitResult.usingRedis,
      );
    }

    // Log successful rate limit check for monitoring
    if (pathname.startsWith("/api/")) {
      await logApiEvent({
        endpoint: "rate_limit_middleware",
        method: "CHECK",
        ipAddress: ip,
        userAgent,
        responseStatus: 200,
        responseTime: Date.now() - startTime,
        metadata: {
          originalPath: pathname,
          originalMethod: method,
          rateLimitType: config.type,
          remaining: rateLimitResult.remaining,
          usingRedis: rateLimitResult.usingRedis,
        },
      });
    }

    // Continue to next middleware/handler
    return null;
  } catch (error) {
    // Log rate limiting error
    console.error("Rate limiting middleware error:", error);

    await logSecurityEvent({
      eventType: "suspicious_activity",
      ipAddress: ip,
      userAgent,
      requestPath: pathname,
      metadata: {
        error: "Rate limiting middleware error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        method,
      },
    });

    // On error, allow the request to continue (fail open)
    return null;
  }
}

/**
 * Express.js compatible rate limiting middleware
 */
export async function expressRateLimitMiddleware(
  req: any,
  res: any,
  next: any,
): Promise<void> {
  const mockRequest = {
    nextUrl: { pathname: req.path },
    method: req.method,
    headers: {
      get: (name: string) =>
        req.headers[name.toLowerCase()] ||
        (name === "x-forwarded-for" ? req.ip : null),
    },
  } as unknown as NextRequest;

  const result = await rateLimitMiddleware(mockRequest);

  if (result) {
    // Rate limit exceeded
    const body = await result.json();
    res.status(result.status).json(body);
  } else {
    // Continue
    next();
  }
}

/**
 * Rate limiting statistics for monitoring
 */
export async function getRateLimitStats(): Promise<{
  totalEndpoints: number;
  configuredEndpoints: string[];
  rateLimitTypes: RateLimitType[];
  lastUpdate: string;
}> {
  return {
    totalEndpoints: Object.keys(API_RATE_LIMITS).length,
    configuredEndpoints: Object.keys(API_RATE_LIMITS),
    rateLimitTypes: Object.values(RATE_LIMIT_CONFIGS).map(
      (config) => config.identifier as RateLimitType,
    ),
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * Helper to add new rate limit configuration
 */
export function addRateLimitConfig(
  endpoint: string,
  config: {
    type: RateLimitType;
    customLimits?: { maxRequests: number; windowMs: number };
  },
): void {
  API_RATE_LIMITS[endpoint] = config;
}

/**
 * Helper to remove rate limit configuration
 */
export function removeRateLimitConfig(endpoint: string): void {
  delete API_RATE_LIMITS[endpoint];
}

/**
 * Check if IP is in whitelist (for admin/monitoring tools)
 */
function isWhitelisted(ip: string): boolean {
  const whitelist = ["127.0.0.1", "::1", "localhost"];

  // Add environment-based whitelist
  if (process.env.RATE_LIMIT_WHITELIST) {
    const envWhitelist = process.env.RATE_LIMIT_WHITELIST.split(",");
    whitelist.push(...envWhitelist);
  }

  return whitelist.includes(ip);
}

/**
 * Enhanced rate limiting with whitelist support
 */
export async function enhancedRateLimitMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  const ip = getRealIP(request);

  // Skip rate limiting for whitelisted IPs
  if (isWhitelisted(ip)) {
    return null;
  }

  return rateLimitMiddleware(request);
}
