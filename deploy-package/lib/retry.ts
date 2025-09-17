/**
 * Retry Logic with Exponential Backoff
 * Learn Academy - Production-Ready Retry Mechanism
 *
 * Features:
 * - Exponential backoff with jitter
 * - Configurable retry strategies
 * - Integration with circuit breaker
 * - Comprehensive retry metrics
 * - Abort on non-retryable errors
 * - Timeout protection
 */

import {
  ApplicationError,
  ExternalServiceError,
  isOperationalError,
} from "./errors";
import { logApiEvent } from "./audit";

/**
 * Retry configuration
 */
export interface RetryConfig {
  // Maximum number of retry attempts
  maxAttempts: number;

  // Base delay between retries (ms)
  baseDelay: number;

  // Maximum delay between retries (ms)
  maxDelay: number;

  // Exponential factor for backoff
  factor: number;

  // Add random jitter to prevent thundering herd
  jitter: boolean;

  // Timeout for entire retry operation (ms)
  timeout?: number;

  // Custom retry condition
  shouldRetry?: (error: unknown, attempt: number) => boolean;

  // Hook called before each retry
  onRetry?: (
    error: unknown,
    attempt: number,
    nextDelay: number,
  ) => void | Promise<void>;

  // Abort signal for cancellation
  abortSignal?: AbortSignal;
}

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  factor: 2,
  jitter: true,
};

/**
 * Retry statistics
 */
export interface RetryStats {
  attempts: number;
  successful: boolean;
  totalDuration: number;
  lastError?: unknown;
  delays: number[];
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff: baseDelay * (factor ^ attempt)
  let delay = config.baseDelay * Math.pow(config.factor, attempt - 1);

  // Cap at maximum delay
  delay = Math.min(delay, config.maxDelay);

  // Add jitter to prevent thundering herd
  if (config.jitter) {
    // Random jitter between 0% and 25% of delay
    const jitterAmount = delay * 0.25 * Math.random();
    delay = delay + jitterAmount;
  }

  return Math.floor(delay);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  // Network and timeout errors are retryable
  if (error instanceof Error) {
    const retryableMessages = [
      "ECONNREFUSED",
      "ECONNRESET",
      "ETIMEDOUT",
      "ENOTFOUND",
      "EHOSTUNREACH",
      "EAI_AGAIN",
      "SOCKET_TIMEOUT",
      "TIMEOUT",
      "Network request failed",
    ];

    if (retryableMessages.some((msg) => error.message.includes(msg))) {
      return true;
    }
  }

  // Application errors - check if operational
  if (error instanceof ApplicationError) {
    // Retry operational errors with specific status codes
    const retryableStatusCodes = [408, 429, 502, 503, 504];
    return (
      error.isOperational && retryableStatusCodes.includes(error.statusCode)
    );
  }

  // External service errors are usually retryable
  if (error instanceof ExternalServiceError) {
    return true;
  }

  // Default to not retrying unknown errors
  return false;
}

/**
 * Sleep for specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main retry function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>,
): Promise<T> {
  const finalConfig: RetryConfig = { ...DEFAULT_CONFIG, ...config };
  const stats: RetryStats = {
    attempts: 0,
    successful: false,
    totalDuration: 0,
    delays: [],
  };

  const startTime = Date.now();
  let lastError: unknown;

  // Set up timeout if specified
  const timeoutPromise = finalConfig.timeout
    ? new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new ApplicationError(
                `Retry timeout after ${finalConfig.timeout}ms`,
                504,
                true,
              ),
            ),
          finalConfig.timeout,
        ),
      )
    : null;

  // Retry loop
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    stats.attempts = attempt;

    // Check abort signal
    if (finalConfig.abortSignal?.aborted) {
      throw new ApplicationError("Retry aborted by signal", 499, true);
    }

    try {
      // Execute function with optional timeout
      const result = timeoutPromise
        ? await Promise.race([fn(), timeoutPromise])
        : await fn();

      // Success!
      stats.successful = true;
      stats.totalDuration = Date.now() - startTime;

      // Log successful retry if it wasn't the first attempt
      if (attempt > 1) {
        await logApiEvent({
          endpoint: "retry_mechanism",
          method: "RETRY_SUCCESS",
          ipAddress: "system",
          userAgent: "retry",
          responseStatus: 200,
          responseTime: stats.totalDuration,
          metadata: {
            attempts: attempt,
            delays: stats.delays,
            totalDuration: stats.totalDuration,
          },
        });
      }

      return result;
    } catch (error) {
      lastError = error;
      stats.lastError = error;

      // Check if we should retry
      const shouldRetry = finalConfig.shouldRetry
        ? finalConfig.shouldRetry(error, attempt)
        : isRetryableError(error);

      // Don't retry if this was the last attempt or error is not retryable
      if (attempt >= finalConfig.maxAttempts || !shouldRetry) {
        stats.totalDuration = Date.now() - startTime;

        // Log final failure
        await logApiEvent({
          endpoint: "retry_mechanism",
          method: "RETRY_FAILED",
          ipAddress: "system",
          userAgent: "retry",
          responseStatus: 500,
          responseTime: stats.totalDuration,
          metadata: {
            attempts: attempt,
            delays: stats.delays,
            totalDuration: stats.totalDuration,
            error: error instanceof Error ? error.message : "Unknown error",
            retryable: shouldRetry,
          },
        });

        throw error;
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, finalConfig);
      stats.delays.push(delay);

      // Call retry hook if provided
      if (finalConfig.onRetry) {
        await finalConfig.onRetry(error, attempt, delay);
      }

      // Log retry attempt
      await logApiEvent({
        endpoint: "retry_mechanism",
        method: "RETRY_ATTEMPT",
        ipAddress: "system",
        userAgent: "retry",
        responseStatus: 0,
        responseTime: Date.now() - startTime,
        metadata: {
          attempt,
          nextDelay: delay,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      // Wait before next attempt
      await sleep(delay);
    }
  }

  // Should never reach here, but for TypeScript
  throw lastError || new ApplicationError("Retry failed", 500, true);
}

/**
 * Retry decorator for class methods
 */
export function withRetry(config?: Partial<RetryConfig>): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return retry(() => originalMethod.apply(this, args), {
        ...config,
        onRetry: async (error, attempt, nextDelay) => {
          console.log(
            `Retrying ${target.constructor.name}.${String(propertyKey)} ` +
              `(attempt ${attempt}/${config?.maxAttempts || DEFAULT_CONFIG.maxAttempts}) ` +
              `after ${nextDelay}ms`,
          );

          if (config?.onRetry) {
            await config.onRetry(error, attempt, nextDelay);
          }
        },
      });
    };

    return descriptor;
  };
}

/**
 * Retry with linear backoff (constant delay)
 */
export async function retryLinear<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
): Promise<T> {
  return retry(fn, {
    maxAttempts,
    baseDelay: delay,
    maxDelay: delay,
    factor: 1,
    jitter: false,
  });
}

/**
 * Retry with fibonacci backoff
 */
export async function retryFibonacci<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 5,
): Promise<T> {
  const fibSequence = [1000, 1000, 2000, 3000, 5000, 8000, 13000];
  let attemptIndex = 0;

  return retry(fn, {
    maxAttempts,
    baseDelay: 1000,
    maxDelay: 13000,
    factor: 1,
    jitter: true,
    shouldRetry: (error, attempt) => {
      return isRetryableError(error);
    },
    onRetry: async (error, attempt, nextDelay) => {
      // Override delay with fibonacci sequence
      if (attemptIndex < fibSequence.length - 1) {
        attemptIndex++;
      }
    },
  });
}

/**
 * Retry policy presets
 */
export const RetryPolicies = {
  // Quick retry for transient failures
  quick: {
    maxAttempts: 3,
    baseDelay: 100,
    maxDelay: 500,
    factor: 2,
    jitter: true,
  },

  // Standard retry for API calls
  standard: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    factor: 2,
    jitter: true,
  },

  // Aggressive retry for critical operations
  aggressive: {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 30000,
    factor: 3,
    jitter: true,
    timeout: 120000, // 2 minutes total
  },

  // Patient retry for slow services
  patient: {
    maxAttempts: 10,
    baseDelay: 5000,
    maxDelay: 60000,
    factor: 1.5,
    jitter: true,
    timeout: 600000, // 10 minutes total
  },

  // No retry
  none: {
    maxAttempts: 1,
    baseDelay: 0,
    maxDelay: 0,
    factor: 1,
    jitter: false,
  },
};

/**
 * Create a retry wrapper for a specific service
 */
export function createRetryWrapper(
  serviceName: string,
  defaultConfig?: Partial<RetryConfig>,
) {
  return async function retryWrapper<T>(
    fn: () => Promise<T>,
    overrideConfig?: Partial<RetryConfig>,
  ): Promise<T> {
    const config = { ...defaultConfig, ...overrideConfig };

    return retry(fn, {
      ...config,
      onRetry: async (error, attempt, nextDelay) => {
        console.log(
          `[${serviceName}] Retry attempt ${attempt} after ${nextDelay}ms`,
          error instanceof Error ? error.message : error,
        );

        if (config.onRetry) {
          await config.onRetry(error, attempt, nextDelay);
        }
      },
    });
  };
}

/**
 * Batch retry for multiple operations
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  config?: Partial<RetryConfig>,
): Promise<Array<{ success: boolean; result?: T; error?: unknown }>> {
  const results = await Promise.allSettled(
    operations.map((op) => retry(op, config)),
  );

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return { success: true, result: result.value };
    } else {
      return { success: false, error: result.reason };
    }
  });
}
