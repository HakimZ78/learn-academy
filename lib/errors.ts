/**
 * Structured Error Classes
 * Learn Academy - Production-Ready Error Handling System
 *
 * Features:
 * - Hierarchical error structure for different error types
 * - HTTP status code mapping
 * - Error serialization for API responses
 * - Stack trace management
 * - Error correlation IDs for debugging
 * - Comprehensive error metadata
 */

import { randomBytes } from "crypto";
import { logApiEvent, logSecurityEvent } from "./audit";

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  RATE_LIMIT = "rate_limit",
  EXTERNAL_SERVICE = "external_service",
  DATABASE = "database",
  FILE_SYSTEM = "file_system",
  CONFIGURATION = "configuration",
  BUSINESS_LOGIC = "business_logic",
  SYSTEM = "system",
}

/**
 * Base application error class
 */
export class ApplicationError extends Error {
  public readonly id: string;
  public readonly timestamp: Date;
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly isOperational: boolean;
  public readonly metadata?: Record<string, any>;
  public readonly originalError?: Error;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    metadata?: Record<string, any>,
    originalError?: Error,
  ) {
    super(message);

    // Generate unique error ID for tracking
    this.id = `err_${randomBytes(8).toString("hex")}`;
    this.timestamp = new Date();
    this.statusCode = statusCode;
    this.severity = severity;
    this.category = category;
    this.isOperational = isOperational;
    this.metadata = metadata;
    this.originalError = originalError;

    // Maintain proper stack trace
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error for API response
   */
  toJSON(): Record<string, any> {
    const isDevelopment = process.env.NODE_ENV === "development";

    return {
      error: {
        id: this.id,
        code: this.name,
        message: this.message,
        category: this.category,
        timestamp: this.timestamp.toISOString(),
        ...(isDevelopment && {
          severity: this.severity,
          statusCode: this.statusCode,
          stack: this.stack,
          metadata: this.metadata,
        }),
      },
    };
  }

  /**
   * Log error to audit system
   */
  async log(ipAddress?: string, userAgent?: string): Promise<void> {
    const logData = {
      errorId: this.id,
      message: this.message,
      severity: this.severity,
      category: this.category,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      metadata: this.metadata,
      stack: this.stack,
    };

    if (this.severity === ErrorSeverity.CRITICAL || !this.isOperational) {
      await logSecurityEvent({
        eventType: "suspicious_activity",
        ipAddress: ipAddress || "unknown",
        userAgent: userAgent || "unknown",
        requestPath: "error_handler",
        metadata: logData,
      });
    } else {
      await logApiEvent({
        endpoint: "error_handler",
        method: "ERROR",
        ipAddress: ipAddress || "unknown",
        userAgent: userAgent || "unknown",
        responseStatus: this.statusCode,
        responseTime: 0,
        metadata: logData,
      });
    }
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends ApplicationError {
  public readonly fields?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    fields?: Array<{ field: string; message: string }>,
    metadata?: Record<string, any>,
  ) {
    super(
      message,
      400,
      true,
      ErrorSeverity.LOW,
      ErrorCategory.VALIDATION,
      metadata,
    );
    this.fields = fields;
  }

  toJSON(): Record<string, any> {
    const base = super.toJSON();
    if (this.fields && this.fields.length > 0) {
      base.error.details = this.fields;
    }
    return base;
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends ApplicationError {
  public readonly resource?: string;
  public readonly identifier?: string;

  constructor(
    resource?: string,
    identifier?: string,
    metadata?: Record<string, any>,
  ) {
    const message = resource
      ? `${resource} not found${identifier ? `: ${identifier}` : ""}`
      : "Resource not found";

    super(
      message,
      404,
      true,
      ErrorSeverity.LOW,
      ErrorCategory.NOT_FOUND,
      metadata,
    );
    this.resource = resource;
    this.identifier = identifier;
  }
}

/**
 * Authentication error for auth failures
 */
export class AuthenticationError extends ApplicationError {
  constructor(
    message: string = "Authentication required",
    metadata?: Record<string, any>,
  ) {
    super(
      message,
      401,
      true,
      ErrorSeverity.MEDIUM,
      ErrorCategory.AUTHENTICATION,
      metadata,
    );
  }
}

/**
 * Authorization error for permission failures
 */
export class AuthorizationError extends ApplicationError {
  constructor(
    message: string = "Permission denied",
    metadata?: Record<string, any>,
  ) {
    super(
      message,
      403,
      true,
      ErrorSeverity.MEDIUM,
      ErrorCategory.AUTHORIZATION,
      metadata,
    );
  }
}

/**
 * Rate limit error for too many requests
 */
export class RateLimitError extends ApplicationError {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number, metadata?: Record<string, any>) {
    super(
      "Too many requests. Please try again later.",
      429,
      true,
      ErrorSeverity.LOW,
      ErrorCategory.RATE_LIMIT,
      metadata,
    );
    this.retryAfter = retryAfter;
  }

  toJSON(): Record<string, any> {
    const base = super.toJSON();
    if (this.retryAfter) {
      base.error.retryAfter = this.retryAfter;
    }
    return base;
  }
}

/**
 * External service error for third-party failures
 */
export class ExternalServiceError extends ApplicationError {
  public readonly service: string;
  public readonly operation?: string;

  constructor(
    service: string,
    operation?: string,
    originalError?: Error,
    metadata?: Record<string, any>,
  ) {
    const message = `External service error: ${service}${operation ? ` (${operation})` : ""}`;

    super(
      message,
      503,
      true,
      ErrorSeverity.HIGH,
      ErrorCategory.EXTERNAL_SERVICE,
      metadata,
      originalError,
    );
    this.service = service;
    this.operation = operation;
  }
}

/**
 * Database error for database-related failures
 */
export class DatabaseError extends ApplicationError {
  public readonly query?: string;
  public readonly code?: string;

  constructor(
    message: string,
    query?: string,
    code?: string,
    originalError?: Error,
    metadata?: Record<string, any>,
  ) {
    super(
      message,
      500,
      true,
      ErrorSeverity.HIGH,
      ErrorCategory.DATABASE,
      metadata,
      originalError,
    );
    this.query = query;
    this.code = code;
  }
}

/**
 * Business logic error for business rule violations
 */
export class BusinessLogicError extends ApplicationError {
  public readonly rule?: string;

  constructor(message: string, rule?: string, metadata?: Record<string, any>) {
    super(
      message,
      400,
      true,
      ErrorSeverity.MEDIUM,
      ErrorCategory.BUSINESS_LOGIC,
      metadata,
    );
    this.rule = rule;
  }
}

/**
 * Configuration error for missing or invalid configuration
 */
export class ConfigurationError extends ApplicationError {
  public readonly configKey?: string;

  constructor(
    message: string,
    configKey?: string,
    metadata?: Record<string, any>,
  ) {
    super(
      message,
      500,
      false, // Not operational - system configuration issue
      ErrorSeverity.CRITICAL,
      ErrorCategory.CONFIGURATION,
      metadata,
    );
    this.configKey = configKey;
  }
}

/**
 * Error utility functions
 */

/**
 * Check if error is operational (expected)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof ApplicationError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Create error from unknown type
 */
export function createApplicationError(
  error: unknown,
  defaultMessage: string = "An unexpected error occurred",
): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApplicationError(
      error.message || defaultMessage,
      500,
      false,
      ErrorSeverity.HIGH,
      ErrorCategory.SYSTEM,
      undefined,
      error,
    );
  }

  if (typeof error === "string") {
    return new ApplicationError(error, 500, false);
  }

  return new ApplicationError(defaultMessage, 500, false);
}

/**
 * Error response formatter for API
 */
export function formatErrorResponse(
  error: ApplicationError,
): Record<string, any> {
  const response = error.toJSON();

  // Add additional headers for rate limit errors
  if (error instanceof RateLimitError && error.retryAfter) {
    return {
      ...response,
      headers: {
        "Retry-After": error.retryAfter.toString(),
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(
          Date.now() + error.retryAfter * 1000,
        ).toISOString(),
      },
    };
  }

  return response;
}

/**
 * Error aggregator for multiple errors
 */
export class AggregateError extends ApplicationError {
  public readonly errors: ApplicationError[];

  constructor(errors: ApplicationError[], message?: string) {
    const errorMessage =
      message || `Multiple errors occurred (${errors.length} errors)`;
    const highestSeverity = errors.reduce((max, err) => {
      const severityOrder = [
        ErrorSeverity.LOW,
        ErrorSeverity.MEDIUM,
        ErrorSeverity.HIGH,
        ErrorSeverity.CRITICAL,
      ];
      return severityOrder.indexOf(err.severity) > severityOrder.indexOf(max)
        ? err.severity
        : max;
    }, ErrorSeverity.LOW);

    super(errorMessage, 400, true, highestSeverity, ErrorCategory.SYSTEM, {
      errorCount: errors.length,
      errorIds: errors.map((e) => e.id),
    });
    this.errors = errors;
  }

  toJSON(): Record<string, any> {
    const base = super.toJSON();
    base.error.errors = this.errors.map((e) => e.toJSON().error);
    return base;
  }
}
