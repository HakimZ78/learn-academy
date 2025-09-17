/**
 * Security Audit API Endpoint
 * Learn Academy - SOC2/ISO27001 Compliant Security Audit
 */

import { NextRequest, NextResponse } from "next/server";
import { generateApiAuditReport, saveAuditReport } from "@/lib/apiAudit";
import { logApiEvent } from "@/lib/audit";
import { getClientIP, nullToUndefined } from "@/lib/utils";

/**
 * GET /api/security/audit - Get security audit report
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const save = searchParams.get("save") === "true";
  const userId = request.headers.get("x-user-id");
  const ipAddress = getClientIP(request);

  try {
    // Generate comprehensive audit report
    const auditReport = await generateApiAuditReport();

    let savedPath: string | undefined;
    if (save) {
      savedPath = await saveAuditReport(auditReport);
    }

    await logApiEvent({
      endpoint: "/api/security/audit",
      method: "GET",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 200,
      responseTime: Date.now() - startTime,
      userId: nullToUndefined(userId),
      metadata: {
        totalEndpoints: auditReport.totalEndpoints,
        secureEndpoints: auditReport.secureEndpoints,
        criticalEndpoints: auditReport.criticalEndpoints,
        overallRiskScore: auditReport.overallRiskScore,
        saved: save,
        savedPath,
      },
    });

    const response = NextResponse.json({
      ...auditReport,
      savedPath: save ? savedPath : undefined,
    });

    // Add security headers
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate",
    );
    response.headers.set(
      "X-Audit-Timestamp",
      auditReport.timestamp.toISOString(),
    );
    response.headers.set(
      "X-Risk-Score",
      auditReport.overallRiskScore.toString(),
    );

    return response;
  } catch (error) {
    console.error("Security audit error:", error);

    await logApiEvent({
      endpoint: "/api/security/audit",
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
          code: "AUDIT_ERROR",
          message: "Failed to generate security audit report",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/security/audit - Trigger manual audit
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const userId = request.headers.get("x-user-id");
  const ipAddress = getClientIP(request);

  try {
    const body = await request.json();
    const { save = true, notify = false } = body;

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

    // Generate audit report
    const auditReport = await generateApiAuditReport();

    let savedPath: string | undefined;
    if (save) {
      savedPath = await saveAuditReport(
        auditReport,
        `manual-audit-${userId}-${Date.now()}.json`,
      );
    }

    await logApiEvent({
      endpoint: "/api/security/audit",
      method: "POST",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 200,
      responseTime: Date.now() - startTime,
      userId: nullToUndefined(userId),
      metadata: {
        auditType: "manual",
        totalEndpoints: auditReport.totalEndpoints,
        criticalEndpoints: auditReport.criticalEndpoints,
        overallRiskScore: auditReport.overallRiskScore,
        saved: save,
        savedPath,
        notify,
      },
    });

    return NextResponse.json({
      success: true,
      auditId: `audit-${Date.now()}`,
      timestamp: auditReport.timestamp,
      summary: {
        totalEndpoints: auditReport.totalEndpoints,
        secureEndpoints: auditReport.secureEndpoints,
        warningEndpoints: auditReport.warningEndpoints,
        criticalEndpoints: auditReport.criticalEndpoints,
        overallRiskScore: auditReport.overallRiskScore,
      },
      savedPath: save ? savedPath : undefined,
    });
  } catch (error) {
    console.error("Manual audit error:", error);

    await logApiEvent({
      endpoint: "/api/security/audit",
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
          code: "MANUAL_AUDIT_ERROR",
          message: "Failed to execute manual security audit",
        },
      },
      { status: 500 },
    );
  }
}
