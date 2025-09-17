/**
 * Circuit Breaker Pattern Implementation
 * Learn Academy - Production-Ready Fault Tolerance
 *
 * Features:
 * - Prevents cascading failures in distributed systems
 * - Automatic failure detection and recovery
 * - Configurable thresholds and timeouts
 * - Half-open state for gradual recovery
 * - Comprehensive metrics and monitoring
 * - Integration with error handling system
 */

import { ExternalServiceError, ApplicationError } from "./errors";
import { logApiEvent } from "./audit";

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Failing, reject requests
  HALF_OPEN = "half_open", // Testing recovery
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  // Failure threshold before opening circuit
  failureThreshold: number;

  // Success threshold in half-open state before closing
  successThreshold: number;

  // Time window for counting failures (ms)
  windowDuration: number;

  // Time to wait before trying half-open state (ms)
  resetTimeout: number;

  // Request timeout (ms)
  requestTimeout: number;

  // Name for logging and monitoring
  name: string;

  // Optional custom error validator
  isFailure?: (error: unknown) => boolean;

  // Optional fallback function
  fallback?: () => Promise<any>;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<CircuitBreakerConfig> = {
  failureThreshold: 5,
  successThreshold: 2,
  windowDuration: 60000, // 1 minute
  resetTimeout: 30000, // 30 seconds
  requestTimeout: 10000, // 10 seconds
};

/**
 * Circuit breaker statistics
 */
interface CircuitStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rejectedRequests: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  averageResponseTime: number;
}

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker<T = any> {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private stats: CircuitStats;
  private stateChangeTime: Date;
  private failureWindow: Date[] = [];
  private responseTimes: number[] = [];

  constructor(config: Partial<CircuitBreakerConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      name: config.name || "default",
    } as CircuitBreakerConfig;

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      averageResponseTime: 0,
    };

    this.stateChangeTime = new Date();
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<R = T>(
    fn: () => Promise<R>,
    context?: { operation?: string; metadata?: Record<string, any> },
  ): Promise<R> {
    const startTime = Date.now();

    // Check if circuit should transition from OPEN to HALF_OPEN
    this.checkStateTransition();

    // Reject if circuit is OPEN
    if (this.state === CircuitState.OPEN) {
      this.stats.rejectedRequests++;
      await this.logEvent("request_rejected", context);

      // Try fallback if available
      if (this.config.fallback) {
        return this.config.fallback() as Promise<R>;
      }

      throw new ExternalServiceError(
        this.config.name,
        context?.operation || "unknown",
        undefined,
        {
          circuitState: this.state,
          resetTime: new Date(
            this.stateChangeTime.getTime() + this.config.resetTimeout,
          ),
        },
      );
    }

    this.stats.totalRequests++;

    try {
      // Add timeout wrapper
      const result = await this.executeWithTimeout(fn);

      // Record success
      this.recordSuccess(Date.now() - startTime);
      await this.logEvent("request_success", context);

      return result;
    } catch (error) {
      // Record failure
      this.recordFailure(error);
      await this.logEvent("request_failure", { ...context, error });

      // Try fallback if available
      if (this.config.fallback) {
        return this.config.fallback() as Promise<R>;
      }

      throw error;
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<R>(fn: () => Promise<R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new ApplicationError(
            `Circuit breaker timeout after ${this.config.requestTimeout}ms`,
            504,
            true,
          ),
        );
      }, this.config.requestTimeout);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Record successful request
   */
  private recordSuccess(responseTime: number): void {
    this.stats.successfulRequests++;
    this.stats.consecutiveSuccesses++;
    this.stats.consecutiveFailures = 0;
    this.stats.lastSuccessTime = new Date();

    // Update response time metrics
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
    this.stats.averageResponseTime =
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    // Handle state transitions
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.stats.consecutiveSuccesses >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }
  }

  /**
   * Record failed request
   */
  private recordFailure(error: unknown): void {
    // Check if error should be counted as failure
    if (this.config.isFailure && !this.config.isFailure(error)) {
      return;
    }

    this.stats.failedRequests++;
    this.stats.consecutiveFailures++;
    this.stats.consecutiveSuccesses = 0;
    this.stats.lastFailureTime = new Date();

    // Add to failure window
    this.failureWindow.push(new Date());

    // Clean old failures outside window
    const windowStart = Date.now() - this.config.windowDuration;
    this.failureWindow = this.failureWindow.filter(
      (date) => date.getTime() > windowStart,
    );

    // Check if circuit should open
    if (this.state === CircuitState.CLOSED) {
      if (this.failureWindow.length >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      // Single failure in half-open reopens circuit
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Check if state should transition
   */
  private checkStateTransition(): void {
    if (this.state === CircuitState.OPEN) {
      const timeSinceOpen = Date.now() - this.stateChangeTime.getTime();
      if (timeSinceOpen >= this.config.resetTimeout) {
        this.transitionTo(CircuitState.HALF_OPEN);
      }
    }
  }

  /**
   * Transition to new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.stateChangeTime = new Date();

    // Reset counters on state change
    if (newState === CircuitState.CLOSED) {
      this.failureWindow = [];
      this.stats.consecutiveFailures = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.stats.consecutiveSuccesses = 0;
    }

    this.logEvent("state_change", {
      oldState,
      newState,
      stats: this.getStats(),
    });
  }

  /**
   * Log circuit breaker events
   */
  private async logEvent(
    event: string,
    context?: Record<string, any>,
  ): Promise<void> {
    try {
      await logApiEvent({
        endpoint: `circuit_breaker_${this.config.name}`,
        method: event.toUpperCase(),
        ipAddress: "system",
        userAgent: "circuit_breaker",
        responseStatus: this.state === CircuitState.OPEN ? 503 : 200,
        responseTime: 0,
        metadata: {
          event,
          state: this.state,
          stats: this.stats,
          ...context,
        },
      });
    } catch (error) {
      console.error("Failed to log circuit breaker event:", error);
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    this.checkStateTransition();
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats(): CircuitStats {
    return { ...this.stats };
  }

  /**
   * Get configuration
   */
  getConfig(): CircuitBreakerConfig {
    return { ...this.config };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.stateChangeTime = new Date();
    this.failureWindow = [];
    this.responseTimes = [];
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * Force circuit to OPEN state (for testing/emergency)
   */
  trip(): void {
    this.transitionTo(CircuitState.OPEN);
  }

  /**
   * Force circuit to CLOSED state (for testing/recovery)
   */
  close(): void {
    this.transitionTo(CircuitState.CLOSED);
  }

  /**
   * Check if circuit is healthy
   */
  isHealthy(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    healthy: boolean;
    state: CircuitState;
    stats: CircuitStats;
    nextStateChange?: Date;
  } {
    const healthy = this.isHealthy();
    const result: any = {
      healthy,
      state: this.state,
      stats: this.getStats(),
    };

    if (this.state === CircuitState.OPEN) {
      result.nextStateChange = new Date(
        this.stateChangeTime.getTime() + this.config.resetTimeout,
      );
    }

    return result;
  }
}

/**
 * Circuit breaker factory for managing multiple breakers
 */
export class CircuitBreakerFactory {
  private static instance: CircuitBreakerFactory;
  private breakers: Map<string, CircuitBreaker> = new Map();

  private constructor() {}

  static getInstance(): CircuitBreakerFactory {
    if (!CircuitBreakerFactory.instance) {
      CircuitBreakerFactory.instance = new CircuitBreakerFactory();
    }
    return CircuitBreakerFactory.instance;
  }

  /**
   * Get or create a circuit breaker
   */
  getBreaker(
    name: string,
    config?: Partial<CircuitBreakerConfig>,
  ): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker({ ...config, name }));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breakers
   */
  getAllBreakers(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  /**
   * Get health status of all breakers
   */
  getAllHealthStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    this.breakers.forEach((breaker, name) => {
      status[name] = breaker.getHealthStatus();
    });
    return status;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach((breaker) => breaker.reset());
  }

  /**
   * Remove a circuit breaker
   */
  removeBreaker(name: string): void {
    this.breakers.delete(name);
  }
}

/**
 * Decorator for applying circuit breaker to methods
 */
export function withCircuitBreaker(
  config: Partial<CircuitBreakerConfig>,
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const breakerName = `${target.constructor.name}.${String(propertyKey)}`;

    descriptor.value = async function (...args: any[]) {
      const factory = CircuitBreakerFactory.getInstance();
      const breaker = factory.getBreaker(breakerName, {
        ...config,
        name: breakerName,
      });

      return breaker.execute(() => originalMethod.apply(this, args), {
        operation: String(propertyKey),
        metadata: { args: args.length },
      });
    };

    return descriptor;
  };
}
