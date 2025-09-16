/**
 * Security Metrics API Endpoint
 * Learn Academy - SOC2/ISO27001 Compliant Security Metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { securityMonitor, MetricType } from "@/lib/securityMonitor";
import { logApiEvent } from "@/lib/audit";
import { getClientIP, nullToUndefined } from "@/lib/utils";

/**
 * GET /api/security/metrics - Get security metrics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") as MetricType;
  const hours = parseInt(searchParams.get("hours") || "24");
  const userId = request.headers.get("x-user-id");
  const ipAddress = getClientIP(request);

  try {
    let metrics;

    if (type) {
      // Get specific metric history
      metrics = securityMonitor.getMetricHistory(type, hours);
    } else {
      // Get dashboard with all current metrics
      const dashboard = await securityMonitor.getDashboard();
      metrics = dashboard.metrics;
    }

    await logApiEvent({
      endpoint: "/api/security/metrics",
      method: "GET",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 200,
      responseTime: Date.now() - startTime,
      userId: nullToUndefined(userId),
      metadata: {
        metricType: type,
        hoursRequested: hours,
        metricsReturned: Array.isArray(metrics) ? metrics.length : 0,
      },
    });

    const response = NextResponse.json({
      metrics,
      timestamp: new Date().toISOString(),
      type: type || "all",
      timeRange: hours,
    });

    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate",
    );

    return response;
  } catch (error) {
    console.error("Security metrics error:", error);

    await logApiEvent({
      endpoint: "/api/security/metrics",
      method: "GET",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 500,
      responseTime: Date.now() - startTime,
      userId: nullToUndefined(userId),
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        metricType: type,
      },
    });

    return NextResponse.json(
      {
        error: {
          code: "METRICS_ERROR",
          message: "Failed to retrieve security metrics",
        },
      },
      { status: 500 },
    );
  }
}
