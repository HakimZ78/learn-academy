/**
 * Security Dashboard API Endpoint
 * Learn Academy - SOC2/ISO27001 Compliant Security Dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import { securityMonitor, MetricType } from "@/lib/securityMonitor";
import { logApiEvent } from "@/lib/audit";
import { getClientIP, nullToUndefined } from "@/lib/utils";

/**
 * GET /api/security/dashboard - Get security dashboard data
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const hours = parseInt(searchParams.get("hours") || "24");
  const userId = request.headers.get("x-user-id");
  const ipAddress = getClientIP(request);

  try {
    // Get dashboard data
    const dashboard = await securityMonitor.getDashboard();

    // Log API access
    await logApiEvent({
      endpoint: "/api/security/dashboard",
      method: "GET",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 200,
      responseTime: Date.now() - startTime,
      userId: nullToUndefined(userId),
      metadata: {
        hoursRequested: hours,
        metricsCount: dashboard.metrics.length,
        alertsCount: dashboard.alerts.length,
        overallScore: dashboard.overallScore,
        riskLevel: dashboard.riskLevel,
      },
    });

    const response = NextResponse.json(dashboard);

    // Add cache headers
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate",
    );
    response.headers.set("X-Security-Score", dashboard.overallScore.toString());
    response.headers.set("X-Risk-Level", dashboard.riskLevel);

    return response;
  } catch (error) {
    console.error("Security dashboard error:", error);

    await logApiEvent({
      endpoint: "/api/security/dashboard",
      method: "GET",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 500,
      responseTime: Date.now() - startTime,
      userId: nullToUndefined(userId),
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      {
        error: {
          code: "DASHBOARD_ERROR",
          message: "Failed to load security dashboard",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/security/dashboard/acknowledge - Acknowledge security alert
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const userId = request.headers.get("x-user-id");
  const ipAddress = getClientIP(request);

  try {
    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json(
        {
          error: { code: "MISSING_ALERT_ID", message: "Alert ID is required" },
        },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required",
          },
        },
        { status: 401 },
      );
    }

    const acknowledged = await securityMonitor.acknowledgeAlert(
      alertId,
      userId,
    );

    if (!acknowledged) {
      return NextResponse.json(
        { error: { code: "ALERT_NOT_FOUND", message: "Alert not found" } },
        { status: 404 },
      );
    }

    await logApiEvent({
      endpoint: "/api/security/dashboard/acknowledge",
      method: "POST",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 200,
      responseTime: Date.now() - startTime,
      userId: nullToUndefined(userId),
      metadata: {
        alertId,
        action: "acknowledge",
      },
    });

    return NextResponse.json({ success: true, alertId });
  } catch (error) {
    console.error("Alert acknowledgment error:", error);

    await logApiEvent({
      endpoint: "/api/security/dashboard/acknowledge",
      method: "POST",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 500,
      responseTime: Date.now() - startTime,
      userId: nullToUndefined(userId),
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      {
        error: {
          code: "ACKNOWLEDGE_ERROR",
          message: "Failed to acknowledge alert",
        },
      },
      { status: 500 },
    );
  }
}
