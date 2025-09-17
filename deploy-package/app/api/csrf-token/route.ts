/**
 * CSRF Token API Endpoint
 * Learn Academy - SOC2/ISO27001 Compliant CSRF Token Generation
 *
 * Features:
 * - Secure token generation for forms
 * - Rate limiting protection
 * - Comprehensive audit logging
 * - Security headers
 */

import { NextRequest } from "next/server";
import { generateCSRFToken } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";
import { logApiEvent } from "@/lib/audit";

function getRealIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "127.0.0.1";
}

function generateSecureResponse(data: any, statusCode: number = 200) {
  const response = new Response(JSON.stringify(data), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Security headers for API responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

  return response;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ip = getRealIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    // Check rate limiting - allow more requests for token generation
    const rateCheck = await checkRateLimit("api", ip, {
      userAgent,
      requestPath: "/api/csrf-token",
    });

    if (!rateCheck.allowed) {
      return generateSecureResponse(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
          },
        },
        429,
      );
    }

    // Generate CSRF token
    const token = await generateCSRFToken({
      userAgent,
      ipAddress: ip,
      formType: "csrf_api_request",
    });

    // Log API call metrics
    await logApiEvent({
      endpoint: "/api/csrf-token",
      method: "GET",
      ipAddress: ip,
      userAgent,
      responseStatus: 200,
      responseTime: Date.now() - startTime,
      metadata: {
        tokenGenerated: true,
        rateLimit: {
          remaining: rateCheck.remaining - 1,
          resetTime: rateCheck.resetTime,
          usingRedis: rateCheck.usingRedis,
        },
      },
    });

    return generateSecureResponse({
      csrfToken: token,
      expiresIn: 30 * 60, // 30 minutes in seconds
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    // Log API error
    await logApiEvent({
      endpoint: "/api/csrf-token",
      method: "GET",
      ipAddress: ip,
      userAgent,
      responseStatus: 500,
      responseTime: Date.now() - startTime,
      metadata: {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });

    console.error("CSRF token generation error:", error);

    return generateSecureResponse(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate CSRF token. Please try again later.",
        },
      },
      500,
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return generateSecureResponse(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "POST method not supported for this endpoint",
      },
    },
    405,
  );
}

export async function PUT() {
  return generateSecureResponse(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "PUT method not supported for this endpoint",
      },
    },
    405,
  );
}

export async function DELETE() {
  return generateSecureResponse(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "DELETE method not supported for this endpoint",
      },
    },
    405,
  );
}
