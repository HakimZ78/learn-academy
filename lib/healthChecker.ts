/**
 * Health Check System
 * Learn Academy - Production-Ready Health Monitoring
 *
 * Features:
 * - Multi-component health checks
 * - Dependency health monitoring
 * - Performance metrics collection
 * - Graceful degradation support
 * - Kubernetes-compatible health endpoints
 * - Detailed and simple health reports
 */

import { CircuitBreakerFactory } from "./circuitBreaker";
import { logApiEvent } from "./audit";
import { retry, RetryPolicies } from "./retry";

/**
 * Health check status
 */
export enum HealthStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message?: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Overall system health
 */
export interface SystemHealth {
  status: HealthStatus;
  version: string;
  uptime: number;
  timestamp: Date;
  checks: HealthCheckResult[];
  metrics?: {
    memory: NodeJS.MemoryUsage;
    cpu?: number;
    connections?: number;
  };
}

/**
 * Health check function type
 */
export type HealthCheckFunction = () => Promise<HealthCheckResult>;

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
  name: string;
  check: () => Promise<
    boolean | { healthy: boolean; message?: string; metadata?: any }
  >;
  timeout?: number;
  critical?: boolean;
  retryOnFailure?: boolean;
}

/**
 * Health checker class
 */
export class HealthChecker {
  private checks: Map<string, HealthCheckConfig> = new Map();
  private lastResults: Map<string, HealthCheckResult> = new Map();
  private startTime: Date = new Date();

  /**
   * Register a health check
   */
  register(config: HealthCheckConfig): void {
    this.checks.set(config.name, {
      timeout: 5000,
      critical: false,
      retryOnFailure: false,
      ...config,
    });
  }

  /**
   * Unregister a health check
   */
  unregister(name: string): void {
    this.checks.delete(name);
    this.lastResults.delete(name);
  }

  /**
   * Execute a single health check
   */
  private async executeCheck(
    config: HealthCheckConfig,
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error(`Health check timeout after ${config.timeout}ms`)),
          config.timeout!,
        ),
      );

      // Execute check with timeout
      const checkPromise = config.retryOnFailure
        ? retry(config.check, RetryPolicies.quick)
        : config.check();

      const result = await Promise.race([checkPromise, timeoutPromise]);

      // Parse result
      const isHealthy = typeof result === "boolean" ? result : result.healthy;
      const message = typeof result === "object" ? result.message : undefined;
      const metadata = typeof result === "object" ? result.metadata : undefined;

      return {
        name: config.name,
        status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
        message: message || (isHealthy ? "Check passed" : "Check failed"),
        duration: Date.now() - startTime,
        timestamp: new Date(),
        metadata,
      };
    } catch (error) {
      return {
        name: config.name,
        status: HealthStatus.UNHEALTHY,
        message: error instanceof Error ? error.message : "Check failed",
        duration: Date.now() - startTime,
        timestamp: new Date(),
        metadata: { error: error instanceof Error ? error.stack : error },
      };
    }
  }

  /**
   * Check health of all registered components
   */
  async checkAll(): Promise<SystemHealth> {
    const checks = await Promise.all(
      Array.from(this.checks.values()).map((config) =>
        this.executeCheck(config),
      ),
    );

    // Store results for caching
    checks.forEach((result) => {
      this.lastResults.set(result.name, result);
    });

    // Determine overall status
    const hasUnhealthy = checks.some(
      (c) => c.status === HealthStatus.UNHEALTHY,
    );
    const hasCriticalUnhealthy = checks.some(
      (c) =>
        c.status === HealthStatus.UNHEALTHY &&
        this.checks.get(c.name)?.critical,
    );

    let overallStatus: HealthStatus;
    if (hasCriticalUnhealthy) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else if (hasUnhealthy) {
      overallStatus = HealthStatus.DEGRADED;
    } else {
      overallStatus = HealthStatus.HEALTHY;
    }

    // Get system metrics
    const metrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage ? process.cpuUsage().user / 1000000 : undefined,
    };

    const health: SystemHealth = {
      status: overallStatus,
      version: process.env.npm_package_version || "1.0.0",
      uptime: Date.now() - this.startTime.getTime(),
      timestamp: new Date(),
      checks,
      metrics,
    };

    // Log health check
    await logApiEvent({
      endpoint: "health_check",
      method: "CHECK",
      ipAddress: "system",
      userAgent: "health_checker",
      responseStatus: overallStatus === HealthStatus.HEALTHY ? 200 : 503,
      responseTime: checks.reduce((sum, c) => sum + c.duration, 0),
      metadata: {
        status: overallStatus,
        checkCount: checks.length,
        failedChecks: checks
          .filter((c) => c.status === HealthStatus.UNHEALTHY)
          .map((c) => c.name),
      },
    });

    return health;
  }

  /**
   * Get cached health results
   */
  getCachedResults(): SystemHealth {
    const checks = Array.from(this.lastResults.values());

    const hasUnhealthy = checks.some(
      (c) => c.status === HealthStatus.UNHEALTHY,
    );
    const hasCriticalUnhealthy = checks.some(
      (c) =>
        c.status === HealthStatus.UNHEALTHY &&
        this.checks.get(c.name)?.critical,
    );

    let overallStatus: HealthStatus;
    if (hasCriticalUnhealthy) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else if (hasUnhealthy) {
      overallStatus = HealthStatus.DEGRADED;
    } else if (checks.length === 0) {
      overallStatus = HealthStatus.HEALTHY; // No checks registered
    } else {
      overallStatus = HealthStatus.HEALTHY;
    }

    return {
      status: overallStatus,
      version: process.env.npm_package_version || "1.0.0",
      uptime: Date.now() - this.startTime.getTime(),
      timestamp: new Date(),
      checks,
    };
  }

  /**
   * Check if system is healthy
   */
  async isHealthy(): Promise<boolean> {
    const health = await this.checkAll();
    return health.status === HealthStatus.HEALTHY;
  }

  /**
   * Get simple health status (for k8s liveness)
   */
  async getLiveness(): Promise<{ status: "ok" | "error" }> {
    try {
      // Just check if the process is responsive
      return { status: "ok" };
    } catch {
      return { status: "error" };
    }
  }

  /**
   * Get readiness status (for k8s readiness)
   */
  async getReadiness(): Promise<{ ready: boolean; checks?: string[] }> {
    const health = await this.checkAll();
    const failedChecks = health.checks
      .filter(
        (c) =>
          c.status === HealthStatus.UNHEALTHY &&
          this.checks.get(c.name)?.critical,
      )
      .map((c) => c.name);

    return {
      ready: failedChecks.length === 0,
      checks: failedChecks.length > 0 ? failedChecks : undefined,
    };
  }
}

/**
 * Global health checker instance
 */
export const healthChecker = new HealthChecker();

/**
 * Built-in health checks
 */

// File system health check
export const fileSystemHealthCheck: HealthCheckConfig = {
  name: "filesystem",
  check: async () => {
    try {
      const fs = await import("fs/promises");
      const testFile = `/tmp/health_check_${Date.now()}.txt`;

      // Try to write and delete a file
      await fs.writeFile(testFile, "health check");
      await fs.unlink(testFile);

      return { healthy: true, message: "File system is writable" };
    } catch (error) {
      return {
        healthy: false,
        message: "File system check failed",
        metadata: { error: error instanceof Error ? error.message : error },
      };
    }
  },
  timeout: 2000,
};

// Memory health check
export const memoryHealthCheck: HealthCheckConfig = {
  name: "memory",
  check: async () => {
    const usage = process.memoryUsage();
    const maxHeap = 500 * 1024 * 1024; // 500MB threshold

    const healthy = usage.heapUsed < maxHeap;

    return {
      healthy,
      message: healthy
        ? `Memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`
        : `High memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      metadata: {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        rss: usage.rss,
        external: usage.external,
      },
    };
  },
  timeout: 1000,
};

// Circuit breaker health check
export const circuitBreakerHealthCheck: HealthCheckConfig = {
  name: "circuit_breakers",
  check: async () => {
    const factory = CircuitBreakerFactory.getInstance();
    const breakers = factory.getAllHealthStatus();

    const unhealthyBreakers = Object.entries(breakers)
      .filter(([_, status]) => !status.healthy)
      .map(([name]) => name);

    return {
      healthy: unhealthyBreakers.length === 0,
      message:
        unhealthyBreakers.length === 0
          ? "All circuit breakers healthy"
          : `Circuit breakers open: ${unhealthyBreakers.join(", ")}`,
      metadata: breakers,
    };
  },
  timeout: 1000,
};

// Redis health check (when configured)
export const redisHealthCheck: HealthCheckConfig = {
  name: "redis",
  check: async () => {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return {
        healthy: true,
        message: "Redis not configured (using in-memory fallback)",
      };
    }

    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      await redis.ping();

      return {
        healthy: true,
        message: "Redis connection successful",
      };
    } catch (error) {
      return {
        healthy: false,
        message: "Redis connection failed",
        metadata: { error: error instanceof Error ? error.message : error },
      };
    }
  },
  timeout: 3000,
  retryOnFailure: true,
};

/**
 * Register default health checks
 */
export function registerDefaultHealthChecks(): void {
  healthChecker.register(fileSystemHealthCheck);
  healthChecker.register(memoryHealthCheck);
  healthChecker.register(circuitBreakerHealthCheck);

  // Only register Redis check if configured
  if (process.env.UPSTASH_REDIS_REST_URL) {
    healthChecker.register(redisHealthCheck);
  }
}

/**
 * Express health check middleware
 */
export async function healthCheckMiddleware(
  req: any,
  res: any,
  next: any,
): Promise<void> {
  if (req.path === "/health") {
    const health = await healthChecker.getLiveness();
    res.status(health.status === "ok" ? 200 : 503).json(health);
  } else if (req.path === "/health/ready") {
    const readiness = await healthChecker.getReadiness();
    res.status(readiness.ready ? 200 : 503).json(readiness);
  } else if (req.path === "/health/detailed") {
    const health = await healthChecker.checkAll();
    res.status(health.status === HealthStatus.HEALTHY ? 200 : 503).json(health);
  } else {
    next();
  }
}
