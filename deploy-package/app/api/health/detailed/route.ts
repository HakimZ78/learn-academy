/**
 * Detailed Health Check API Endpoint
 * Learn Academy - Production-Ready Health Monitoring
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
 * GET /api/health/detailed - Detailed health status
 */
export async function GET() {
  try {
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
  } catch (error) {
    console.error("Detailed health check error:", error);

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
