/**
 * CSRF Protection System
 * Learn Academy - SOC2/ISO27001 Compliant CSRF Protection
 *
 * Features:
 * - Stateless CSRF token generation and validation
 * - SHA-256 HMAC-based tokens for security
 * - Configurable token expiration
 * - Comprehensive audit logging
 * - Integration with form validation
 */

import { createHash, createHmac, randomBytes } from "crypto";
import { logSecurityEvent } from "./audit";

// CSRF configuration
const CSRF_CONFIG = {
  // Token expiration time (30 minutes)
  tokenExpiry: 30 * 60 * 1000, // 30 minutes in milliseconds

  // Secret for HMAC generation
  // In production, this should come from environment variables
  secret:
    process.env.CSRF_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "fallback-csrf-secret-change-in-production",

  // Salt length for token generation
  saltLength: 16,

  // Algorithm for HMAC
  algorithm: "sha256",
} as const;

/**
 * Token structure:
 * [timestamp(13)][salt(32)][hmac(64)]
 * Total length: 109 characters
 */

/**
 * Generate a CSRF token for form protection
 */
export async function generateCSRFToken(metadata?: {
  userAgent?: string;
  ipAddress?: string;
  formType?: string;
}): Promise<string> {
  try {
    const timestamp = Date.now().toString();
    const salt = randomBytes(CSRF_CONFIG.saltLength).toString("hex");

    // Create HMAC of timestamp + salt
    const hmac = createHmac(CSRF_CONFIG.algorithm, CSRF_CONFIG.secret)
      .update(timestamp + salt)
      .digest("hex");

    const token = timestamp + salt + hmac;

    // Log token generation for audit
    await logSecurityEvent({
      eventType: "suspicious_activity",
      ipAddress: metadata?.ipAddress || "unknown",
      userAgent: metadata?.userAgent || "unknown",
      requestPath: "csrf_token_generation",
      metadata: {
        action: "csrf_token_generated",
        formType: metadata?.formType || "unknown",
        tokenLength: token.length,
        expiresIn: CSRF_CONFIG.tokenExpiry / 1000, // seconds
      },
    });

    return token;
  } catch (error) {
    console.error("CSRF token generation error:", error);
    throw new Error("Failed to generate CSRF token");
  }
}

/**
 * Validate a CSRF token
 */
export async function validateCSRFToken(
  token: string,
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    formType?: string;
  },
): Promise<{
  valid: boolean;
  reason?: string;
  expired?: boolean;
}> {
  try {
    // Check token format
    if (!token || typeof token !== "string" || token.length !== 109) {
      await logSecurityEvent({
        eventType: "suspicious_activity",
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
        requestPath: "csrf_token_validation",
        metadata: {
          action: "invalid_csrf_token",
          reason: "Invalid token format",
          tokenLength: token?.length || 0,
          formType: metadata?.formType || "unknown",
        },
      });

      return { valid: false, reason: "Invalid token format" };
    }

    // Extract components
    const timestampStr = token.substring(0, 13);
    const salt = token.substring(13, 45); // 16 bytes = 32 hex chars
    const providedHmac = token.substring(45, 109); // 32 bytes = 64 hex chars

    // Validate timestamp format
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      await logSecurityEvent({
        eventType: "suspicious_activity",
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
        requestPath: "csrf_token_validation",
        metadata: {
          action: "invalid_csrf_token",
          reason: "Invalid timestamp in token",
          formType: metadata?.formType || "unknown",
        },
      });

      return { valid: false, reason: "Invalid token timestamp" };
    }

    // Check if token has expired
    const now = Date.now();
    if (now - timestamp > CSRF_CONFIG.tokenExpiry) {
      await logSecurityEvent({
        eventType: "suspicious_activity",
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
        requestPath: "csrf_token_validation",
        metadata: {
          action: "expired_csrf_token",
          tokenAge: now - timestamp,
          maxAge: CSRF_CONFIG.tokenExpiry,
          formType: metadata?.formType || "unknown",
        },
      });

      return { valid: false, reason: "Token expired", expired: true };
    }

    // Regenerate HMAC and compare
    const expectedHmac = createHmac(CSRF_CONFIG.algorithm, CSRF_CONFIG.secret)
      .update(timestampStr + salt)
      .digest("hex");

    // Use timing-safe comparison
    if (!timingSafeEqual(providedHmac, expectedHmac)) {
      await logSecurityEvent({
        eventType: "suspicious_activity",
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
        requestPath: "csrf_token_validation",
        metadata: {
          action: "invalid_csrf_token",
          reason: "HMAC mismatch - possible tampering",
          formType: metadata?.formType || "unknown",
        },
      });

      return { valid: false, reason: "Invalid token signature" };
    }

    // Token is valid
    return { valid: true };
  } catch (error) {
    console.error("CSRF token validation error:", error);

    await logSecurityEvent({
      eventType: "suspicious_activity",
      ipAddress: metadata?.ipAddress || "unknown",
      userAgent: metadata?.userAgent || "unknown",
      requestPath: "csrf_token_validation",
      metadata: {
        action: "csrf_validation_error",
        error: error instanceof Error ? error.message : "Unknown error",
        formType: metadata?.formType || "unknown",
      },
    });

    return { valid: false, reason: "Token validation error" };
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Get CSRF token information without validating
 * Useful for debugging and monitoring
 */
export function getCSRFTokenInfo(token: string): {
  valid: boolean;
  timestamp?: number;
  age?: number;
  expired?: boolean;
  formatValid?: boolean;
} {
  try {
    if (!token || typeof token !== "string" || token.length !== 109) {
      return { valid: false, formatValid: false };
    }

    const timestampStr = token.substring(0, 13);
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) {
      return { valid: false, formatValid: false };
    }

    const now = Date.now();
    const age = now - timestamp;
    const expired = age > CSRF_CONFIG.tokenExpiry;

    return {
      valid: true,
      formatValid: true,
      timestamp,
      age,
      expired,
    };
  } catch (error) {
    return { valid: false, formatValid: false };
  }
}

/**
 * Generate a new token if the current one is expired or invalid
 */
export async function refreshCSRFTokenIfNeeded(
  currentToken?: string,
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    formType?: string;
  },
): Promise<string> {
  if (!currentToken) {
    return generateCSRFToken(metadata);
  }

  const tokenInfo = getCSRFTokenInfo(currentToken);

  // Generate new token if current is invalid, expired, or will expire soon (5 minutes)
  const fiveMinutes = 5 * 60 * 1000;
  if (
    !tokenInfo.valid ||
    tokenInfo.expired ||
    (tokenInfo.age && tokenInfo.age > CSRF_CONFIG.tokenExpiry - fiveMinutes)
  ) {
    return generateCSRFToken(metadata);
  }

  return currentToken;
}

/**
 * Create CSRF token for API endpoint
 */
export async function createCSRFTokenAPI(): Promise<Response> {
  try {
    const token = await generateCSRFToken({
      formType: "api_request",
    });

    return new Response(
      JSON.stringify({
        csrfToken: token,
        expiresIn: CSRF_CONFIG.tokenExpiry / 1000, // seconds
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to generate CSRF token",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

/**
 * Middleware helper to validate CSRF token from request
 */
export async function validateRequestCSRF(request: Request): Promise<{
  valid: boolean;
  reason?: string;
  token?: string;
}> {
  try {
    const contentType = request.headers.get("content-type");
    let token: string | undefined;

    if (contentType?.includes("application/json")) {
      const body = await request.json();
      token = body.csrfToken;
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      token = formData.get("csrfToken") as string;
    }

    if (!token) {
      return { valid: false, reason: "CSRF token missing" };
    }

    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const validation = await validateCSRFToken(token, {
      userAgent,
      ipAddress,
      formType: "api_request",
    });

    return {
      valid: validation.valid,
      reason: validation.reason,
      token,
    };
  } catch (error) {
    return {
      valid: false,
      reason: "CSRF validation error",
    };
  }
}
