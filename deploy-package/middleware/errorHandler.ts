/**
 * Global Error Handler Middleware
 * Learn Academy - Production-Ready Error Handling
 *
 * Features:
 * - Centralized error handling for all API routes
 * - Structured error responses
 * - Comprehensive error logging
 * - Security-focused error sanitization
 * - Development vs production error details
 */

import { NextRequest, NextResponse } from "next/server";
import {
  ApplicationError,
  createApplicationError,
  isOperationalError,
  formatErrorResponse,
  ErrorSeverity,
  ErrorCategory,
} from "@/lib/errors";
import { logApiEvent, logSecurityEvent } from "@/lib/audit";

/**
 * Error handler configuration
 */
const ERROR_CONFIG = {
  // Maximum error message length for security
  maxMessageLength: 500,

  // Include stack traces in development
  includeStackTrace: process.env.NODE_ENV === "development",

  // Log all errors to console in development
  consoleLogErrors: process.env.NODE_ENV === "development",

  // Default error messages for production
  defaultMessages: {
    400: "Invalid request",
    401: "Authentication required",
    403: "Permission denied",
    404: "Resource not found",
    429: "Too many requests",
    500: "Internal server error",
    503: "Service temporarily unavailable",
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
 * Sanitize error message for production
 */
function sanitizeErrorMessage(message: string): string {
  // Remove sensitive patterns
  const sensitivePatterns = [
    /password[s]?\s*[:=]\s*["']?[\w\s]+["']?/gi,
    /api[_-]?key[s]?\s*[:=]\s*["']?[\w\s]+["']?/gi,
    /token[s]?\s*[:=]\s*["']?[\w\s]+["']?/gi,
    /secret[s]?\s*[:=]\s*["']?[\w\s]+["']?/gi,
    /\/Users\/[\w/]+/g, // File paths
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
  ];

  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  // Truncate if too long
  if (sanitized.length > ERROR_CONFIG.maxMessageLength) {
    sanitized = sanitized.substring(0, ERROR_CONFIG.maxMessageLength) + "...";
  }

  return sanitized;
}

/**
 * Create error response with proper headers
 */
function createErrorResponse(
  error: ApplicationError,
  startTime: number,
): NextResponse {
  const responseData = formatErrorResponse(error);
  const response = NextResponse.json(responseData, {
    status: error.statusCode,
  });

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

  // Add error-specific headers
  response.headers.set("X-Error-Id", error.id);
  response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);

  // Add rate limit headers if applicable
  if (responseData.headers) {
    Object.entries(responseData.headers).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
  }

  return response;
}

/**
 * Main error handler function
 */
export async function handleError(
  error: unknown,
  request: NextRequest,
  context?: {
    endpoint?: string;
    method?: string;
    userId?: string;
  },
): Promise<NextResponse> {
  const startTime = Date.now();
  const ip = getRealIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Convert to ApplicationError
  const appError = createApplicationError(error);

  // Sanitize error message for production
  if (process.env.NODE_ENV === "production") {
    appError.message = sanitizeErrorMessage(appError.message);
  }

  // Log to console in development
  if (ERROR_CONFIG.consoleLogErrors) {
    console.error(`[${appError.id}] Error:`, {
      message: appError.message,
      statusCode: appError.statusCode,
      severity: appError.severity,
      category: appError.category,
      isOperational: appError.isOperational,
      stack: appError.stack,
    });
  }

  // Log error to audit system
  try {
    await appError.log(ip, userAgent);

    // Additional security logging for critical errors
    if (
      appError.severity === ErrorSeverity.CRITICAL ||
      !appError.isOperational
    ) {
      await logSecurityEvent({
        eventType: "suspicious_activity",
        ipAddress: ip,
        userAgent,
        requestPath: context?.endpoint || request.url,
        metadata: {
          errorId: appError.id,
          errorCategory: appError.category,
          errorSeverity: appError.severity,
          method: context?.method || request.method,
          userId: context?.userId,
        },
      });
    }

    // Log API metrics
    await logApiEvent({
      endpoint: context?.endpoint || request.url,
      method: context?.method || request.method,
      ipAddress: ip,
      userAgent,
      responseStatus: appError.statusCode,
      responseTime: Date.now() - startTime,
      metadata: {
        errorId: appError.id,
        errorCategory: appError.category,
        isOperational: appError.isOperational,
      },
    });
  } catch (loggingError) {
    console.error("Failed to log error:", loggingError);
  }

  // Create and return error response
  return createErrorResponse(appError, startTime);
}

/**
 * Error handler wrapper for API routes
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
): (...args: T) => Promise<R | NextResponse> {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Extract request from args if it's a Next.js API route
      const request = args.find((arg) => arg instanceof NextRequest) as
        | NextRequest
        | undefined;

      if (request) {
        return handleError(error, request);
      }

      // Re-throw if we can't handle it
      throw error;
    }
  };
}

/**
 * Express-style error handler for middleware chain
 */
export async function errorHandlerMiddleware(
  error: unknown,
  request: NextRequest,
): Promise<NextResponse> {
  return handleError(error, request);
}

/**
 * Async error wrapper for non-API functions
 */
export function asyncErrorWrapper<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = createApplicationError(error);

      // Log error
      await appError.log();

      // Re-throw operational errors
      if (isOperationalError(appError)) {
        throw appError;
      }

      // For non-operational errors, throw a generic error to avoid leaking info
      throw new ApplicationError(
        "An unexpected error occurred. Please try again later.",
        500,
        true,
      );
    }
  };
}

/**
 * Error boundary for React components (client-side)
 */
export function createErrorBoundaryHandler(
  componentName: string,
): (error: Error, errorInfo: React.ErrorInfo) => void {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    const appError = createApplicationError(error);

    // Log to console in development
    if (ERROR_CONFIG.consoleLogErrors) {
      console.error(`Error in ${componentName}:`, {
        error: appError,
        errorInfo,
        componentStack: errorInfo.componentStack,
      });
    }

    // Send error to monitoring service (if configured)
    if (typeof window !== "undefined" && window.fetch) {
      window
        .fetch("/api/client-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            errorId: appError.id,
            message: sanitizeErrorMessage(appError.message),
            component: componentName,
            stack: ERROR_CONFIG.includeStackTrace ? appError.stack : undefined,
            componentStack: ERROR_CONFIG.includeStackTrace
              ? errorInfo.componentStack
              : undefined,
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        })
        .catch((fetchError) => {
          console.error("Failed to report client error:", fetchError);
        });
    }
  };
}

/**
 * Unhandled rejection handler for process-level errors
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof process !== "undefined") {
    process.on(
      "unhandledRejection",
      async (reason: unknown, promise: Promise<unknown>) => {
        const error = new ApplicationError(
          "Unhandled Promise Rejection",
          500,
          false,
          ErrorSeverity.CRITICAL,
          ErrorCategory.SYSTEM,
          { reason },
        );

        console.error("Unhandled Rejection:", error);
        await error.log();

        // In production, exit gracefully
        if (process.env.NODE_ENV === "production") {
          process.exit(1);
        }
      },
    );

    process.on("uncaughtException", async (error: Error) => {
      const appError = new ApplicationError(
        "Uncaught Exception",
        500,
        false,
        ErrorSeverity.CRITICAL,
        ErrorCategory.SYSTEM,
        { originalError: error.message },
      );

      console.error("Uncaught Exception:", appError);

      try {
        await appError.log();
      } catch (logError) {
        console.error("Failed to log uncaught exception:", logError);
      }

      // Always exit on uncaught exceptions
      process.exit(1);
    });
  }
}
