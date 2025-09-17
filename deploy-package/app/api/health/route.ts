/**
 * Health Check API Endpoints
 * Learn Academy - Production-Ready Health Monitoring
 *
 * Endpoints:
 * - GET /api/health - Simple liveness check
 * - GET /api/health/detailed - Detailed health status
 * - GET /api/health/ready - Readiness check for load balancers
 */

import { NextRequest, NextResponse } from "next/server";
import {
  healthChecker,
  registerDefaultHealthChecks,
  HealthStatus,
} from "@/lib/healthChecker";

// Register default health checks on module load
registerDefaultHealthChecks();

/**
 * GET /api/health - Simple liveness check
 * Returns 200 if service is alive, 503 if not
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Detailed health check
    if (path.endsWith("/detailed")) {
      const health = await healthChecker.checkAll();

      const response = NextResponse.json(health, {
        status:
          health.status === HealthStatus.HEALTHY
            ? 200
            : health.status === HealthStatus.DEGRADED
              ? 200
              : 503,
      });

      // Add cache headers
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate",
      );
      response.headers.set("X-Health-Status", health.status);

      return response;
    }

    // Readiness check
    if (path.endsWith("/ready")) {
      const readiness = await healthChecker.getReadiness();

      const response = NextResponse.json(readiness, {
        status: readiness.ready ? 200 : 503,
      });

      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate",
      );
      response.headers.set("X-Ready", readiness.ready.toString());

      return response;
    }

    // Simple liveness check (default)
    const liveness = await healthChecker.getLiveness();

    const response = NextResponse.json(liveness, {
      status: liveness.status === "ok" ? 200 : 503,
    });

    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate",
    );
    response.headers.set("X-Liveness", liveness.status);

    return response;
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 503 },
    );
  }
}
