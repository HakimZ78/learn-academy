/**
 * API Endpoint Security Audit System
 * Learn Academy - SOC2/ISO27001 Compliant API Security
 *
 * Features:
 * - Automatic API endpoint discovery
 * - Security vulnerability assessment
 * - Authentication requirements analysis
 * - Rate limiting compliance check
 * - Input validation assessment
 * - Comprehensive security reporting
 */

import { Glob } from "glob";
import * as fs from "fs/promises";
import * as path from "path";
import { logApiEvent } from "./audit";

/**
 * API endpoint security assessment
 */
export interface ApiSecurityAssessment {
  endpoint: string;
  method: string[];
  file: string;
  securityStatus: "secure" | "warning" | "critical";
  issues: SecurityIssue[];
  recommendations: string[];
  hasAuthentication: boolean;
  hasRateLimit: boolean;
  hasInputValidation: boolean;
  hasErrorHandling: boolean;
  hasAuditLogging: boolean;
  riskScore: number; // 0-100, higher is more risky
}

/**
 * Security issue classification
 */
export interface SecurityIssue {
  type:
    | "authentication"
    | "authorization"
    | "input_validation"
    | "rate_limiting"
    | "error_handling"
    | "audit_logging"
    | "data_exposure"
    | "csrf"
    | "cors";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location?: string;
  remediation: string;
}

/**
 * API audit report
 */
export interface ApiAuditReport {
  timestamp: Date;
  totalEndpoints: number;
  secureEndpoints: number;
  warningEndpoints: number;
  criticalEndpoints: number;
  overallRiskScore: number;
  endpoints: ApiSecurityAssessment[];
  summary: {
    authenticationCoverage: number;
    rateLimitCoverage: number;
    inputValidationCoverage: number;
    auditLoggingCoverage: number;
  };
  recommendations: string[];
}

/**
 * Discover all API endpoints in the app/api directory
 */
export async function discoverApiEndpoints(): Promise<
  {
    endpoint: string;
    method: string[];
    file: string;
  }[]
> {
  const apiDir = path.join(process.cwd(), "app/api");
  const endpoints: { endpoint: string; method: string[]; file: string }[] = [];

  try {
    // Find all route.ts files
    const glob = new Glob("**/route.ts", { cwd: apiDir });
    const routeFiles: string[] = [];
    for await (const file of glob) {
      routeFiles.push(file);
    }

    for (const routeFile of routeFiles) {
      const fullPath = path.join(apiDir, routeFile);
      const endpointPath =
        "/api/" + path.dirname(routeFile).replace(/\\/g, "/");

      // Read file to determine supported HTTP methods
      const content = await fs.readFile(fullPath, "utf-8");
      const methods = extractHttpMethods(content);

      endpoints.push({
        endpoint: endpointPath === "/api/." ? "/api" : endpointPath,
        method: methods,
        file: fullPath,
      });
    }

    return endpoints;
  } catch (error) {
    console.error("Error discovering API endpoints:", error);
    return [];
  }
}

/**
 * Extract HTTP methods from route file content
 */
function extractHttpMethods(content: string): string[] {
  const methods: string[] = [];
  const httpMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS",
  ];

  for (const method of httpMethods) {
    // Look for export async function GET/POST/etc
    const regex = new RegExp(`export\\s+async\\s+function\\s+${method}`, "i");
    if (regex.test(content)) {
      methods.push(method);
    }
  }

  return methods;
}

/**
 * Analyze file content for security features
 */
async function analyzeEndpointSecurity(
  endpoint: string,
  methods: string[],
  filePath: string,
): Promise<ApiSecurityAssessment> {
  const content = await fs.readFile(filePath, "utf-8");
  const issues: SecurityIssue[] = [];
  const recommendations: string[] = [];

  // Check for authentication
  const hasAuthentication = checkAuthentication(content, issues);

  // Check for rate limiting
  const hasRateLimit = checkRateLimit(content, issues);

  // Check for input validation
  const hasInputValidation = checkInputValidation(content, issues);

  // Check for error handling
  const hasErrorHandling = checkErrorHandling(content, issues);

  // Check for audit logging
  const hasAuditLogging = checkAuditLogging(content, issues);

  // Additional security checks
  checkDataExposure(content, issues);
  checkCsrfProtection(content, issues, methods);
  checkCorsConfiguration(content, issues);

  // Calculate risk score
  const riskScore = calculateRiskScore(
    issues,
    hasAuthentication,
    hasRateLimit,
    hasInputValidation,
  );

  // Generate recommendations
  generateRecommendations(issues, recommendations);

  // Determine overall security status
  let securityStatus: "secure" | "warning" | "critical" = "secure";
  if (issues.some((i) => i.severity === "critical")) {
    securityStatus = "critical";
  } else if (issues.some((i) => i.severity === "high") || riskScore > 60) {
    securityStatus = "warning";
  }

  return {
    endpoint,
    method: methods,
    file: filePath,
    securityStatus,
    issues,
    recommendations,
    hasAuthentication,
    hasRateLimit,
    hasInputValidation,
    hasErrorHandling,
    hasAuditLogging,
    riskScore,
  };
}

/**
 * Check for authentication implementation
 */
function checkAuthentication(
  content: string,
  issues: SecurityIssue[],
): boolean {
  const authPatterns = [
    /authentication|auth|jwt|token|session/i,
    /headers\.get\(['"]authorization['"]\)/i,
    /bearer\s+token/i,
    /api\s*key/i,
  ];

  const hasAuth = authPatterns.some((pattern) => pattern.test(content));

  if (!hasAuth) {
    issues.push({
      type: "authentication",
      severity: "high",
      description: "No authentication mechanism detected",
      remediation:
        "Implement authentication using JWT tokens, API keys, or session-based auth",
    });
  }

  return hasAuth;
}

/**
 * Check for rate limiting implementation
 */
function checkRateLimit(content: string, issues: SecurityIssue[]): boolean {
  const rateLimitPatterns = [
    /rate.?limit/i,
    /checkRateLimit/i,
    /rateLimitMiddleware/i,
    /429/,
  ];

  const hasRateLimit = rateLimitPatterns.some((pattern) =>
    pattern.test(content),
  );

  if (!hasRateLimit) {
    issues.push({
      type: "rate_limiting",
      severity: "medium",
      description: "No rate limiting detected",
      remediation: "Implement rate limiting to prevent abuse and DDoS attacks",
    });
  }

  return hasRateLimit;
}

/**
 * Check for input validation
 */
function checkInputValidation(
  content: string,
  issues: SecurityIssue[],
): boolean {
  const validationPatterns = [
    /validation|validate/i,
    /zod|joi|yup/i,
    /schema/i,
    /sanitize|dompurify/i,
    /\.parse\(/,
    /validateContactForm/i,
  ];

  const hasValidation = validationPatterns.some((pattern) =>
    pattern.test(content),
  );

  if (!hasValidation) {
    issues.push({
      type: "input_validation",
      severity: "high",
      description: "No input validation detected",
      remediation:
        "Implement comprehensive input validation using schema validation libraries like Zod",
    });
  }

  return hasValidation;
}

/**
 * Check for error handling
 */
function checkErrorHandling(content: string, issues: SecurityIssue[]): boolean {
  const errorHandlingPatterns = [
    /try\s*\{[\s\S]*catch/,
    /ApplicationError|Error/,
    /error\s*:/,
    /status:\s*(400|401|403|404|429|500)/,
  ];

  const hasErrorHandling = errorHandlingPatterns.some((pattern) =>
    pattern.test(content),
  );

  if (!hasErrorHandling) {
    issues.push({
      type: "error_handling",
      severity: "medium",
      description: "Limited error handling detected",
      remediation:
        "Implement comprehensive error handling with proper HTTP status codes",
    });
  }

  return hasErrorHandling;
}

/**
 * Check for audit logging
 */
function checkAuditLogging(content: string, issues: SecurityIssue[]): boolean {
  const auditPatterns = [
    /logApiEvent|logSecurityEvent|logFormEvent/i,
    /audit|log/i,
    /console\.log/,
  ];

  const hasAudit = auditPatterns.some((pattern) => pattern.test(content));

  if (!hasAudit) {
    issues.push({
      type: "audit_logging",
      severity: "medium",
      description: "No audit logging detected",
      remediation:
        "Implement comprehensive audit logging for security monitoring and compliance",
    });
  }

  return hasAudit;
}

/**
 * Check for potential data exposure
 */
function checkDataExposure(content: string, issues: SecurityIssue[]): void {
  const exposurePatterns = [
    /password|secret|key|token/i,
    /process\.env/,
    /console\.log.*password|console\.log.*secret/i,
  ];

  exposurePatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      issues.push({
        type: "data_exposure",
        severity: "high",
        description: "Potential sensitive data exposure in logs or responses",
        remediation: "Review and sanitize all logged data and API responses",
      });
    }
  });
}

/**
 * Check for CSRF protection
 */
function checkCsrfProtection(
  content: string,
  issues: SecurityIssue[],
  methods: string[],
): void {
  const modifyingMethods = ["POST", "PUT", "DELETE", "PATCH"];
  const needsCsrf = methods.some((method) => modifyingMethods.includes(method));

  if (needsCsrf) {
    const csrfPatterns = [/csrf|xsrf/i, /token/i];

    const hasCsrf = csrfPatterns.some((pattern) => pattern.test(content));

    if (!hasCsrf) {
      issues.push({
        type: "csrf",
        severity: "high",
        description: "State-changing endpoint lacks CSRF protection",
        remediation:
          "Implement CSRF token validation for all state-changing operations",
      });
    }
  }
}

/**
 * Check for CORS configuration
 */
function checkCorsConfiguration(
  content: string,
  issues: SecurityIssue[],
): void {
  const corsPatterns = [
    /cors/i,
    /Access-Control-Allow-Origin/i,
    /cross.?origin/i,
  ];

  const hasCors = corsPatterns.some((pattern) => pattern.test(content));

  if (!hasCors) {
    issues.push({
      type: "cors",
      severity: "low",
      description: "No explicit CORS configuration detected",
      remediation: "Configure CORS headers appropriately for your use case",
    });
  }
}

/**
 * Calculate risk score based on issues and missing features
 */
function calculateRiskScore(
  issues: SecurityIssue[],
  hasAuth: boolean,
  hasRateLimit: boolean,
  hasValidation: boolean,
): number {
  let score = 0;

  // Base score for missing core features
  if (!hasAuth) score += 30;
  if (!hasRateLimit) score += 15;
  if (!hasValidation) score += 25;

  // Add points for each issue
  issues.forEach((issue) => {
    switch (issue.severity) {
      case "critical":
        score += 25;
        break;
      case "high":
        score += 15;
        break;
      case "medium":
        score += 8;
        break;
      case "low":
        score += 3;
        break;
    }
  });

  return Math.min(100, score);
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  issues: SecurityIssue[],
  recommendations: string[],
): void {
  const criticalIssues = issues.filter((i) => i.severity === "critical");
  const highIssues = issues.filter((i) => i.severity === "high");

  if (criticalIssues.length > 0) {
    recommendations.push(
      "🚨 CRITICAL: Address critical security issues immediately before deployment",
    );
  }

  if (highIssues.length > 0) {
    recommendations.push(
      "⚠️  HIGH: Resolve high-severity security issues as soon as possible",
    );
  }

  // Specific recommendations based on issue patterns
  const issueTypes = new Set(issues.map((i) => i.type));

  if (issueTypes.has("authentication")) {
    recommendations.push("Implement API authentication using JWT or API keys");
  }

  if (issueTypes.has("input_validation")) {
    recommendations.push(
      "Add comprehensive input validation using Zod schemas",
    );
  }

  if (issueTypes.has("rate_limiting")) {
    recommendations.push("Enable rate limiting to prevent abuse");
  }
}

/**
 * Generate comprehensive API security audit report
 */
export async function generateApiAuditReport(): Promise<ApiAuditReport> {
  const startTime = Date.now();
  console.log("🔍 Starting API security audit...");

  try {
    // Discover all API endpoints
    const endpoints = await discoverApiEndpoints();
    console.log(`📊 Found ${endpoints.length} API endpoints`);

    // Analyze each endpoint
    const assessments: ApiSecurityAssessment[] = [];
    for (const endpoint of endpoints) {
      console.log(`🔍 Analyzing ${endpoint.endpoint}...`);
      const assessment = await analyzeEndpointSecurity(
        endpoint.endpoint,
        endpoint.method,
        endpoint.file,
      );
      assessments.push(assessment);
    }

    // Calculate summary statistics
    const secureEndpoints = assessments.filter(
      (a) => a.securityStatus === "secure",
    ).length;
    const warningEndpoints = assessments.filter(
      (a) => a.securityStatus === "warning",
    ).length;
    const criticalEndpoints = assessments.filter(
      (a) => a.securityStatus === "critical",
    ).length;

    const authCoverage =
      (assessments.filter((a) => a.hasAuthentication).length /
        assessments.length) *
      100;
    const rateLimitCoverage =
      (assessments.filter((a) => a.hasRateLimit).length / assessments.length) *
      100;
    const validationCoverage =
      (assessments.filter((a) => a.hasInputValidation).length /
        assessments.length) *
      100;
    const auditCoverage =
      (assessments.filter((a) => a.hasAuditLogging).length /
        assessments.length) *
      100;

    const overallRiskScore =
      assessments.reduce((sum, a) => sum + a.riskScore, 0) / assessments.length;

    // Generate overall recommendations
    const recommendations = [
      "Review and address all critical security issues immediately",
      "Implement missing authentication for unprotected endpoints",
      "Enable comprehensive input validation across all APIs",
      "Add rate limiting to prevent abuse and DDoS attacks",
      "Enhance audit logging for compliance and monitoring",
    ];

    const report: ApiAuditReport = {
      timestamp: new Date(),
      totalEndpoints: assessments.length,
      secureEndpoints,
      warningEndpoints,
      criticalEndpoints,
      overallRiskScore: Math.round(overallRiskScore),
      endpoints: assessments,
      summary: {
        authenticationCoverage: Math.round(authCoverage),
        rateLimitCoverage: Math.round(rateLimitCoverage),
        inputValidationCoverage: Math.round(validationCoverage),
        auditLoggingCoverage: Math.round(auditCoverage),
      },
      recommendations,
    };

    // Log audit completion
    await logApiEvent({
      endpoint: "api_security_audit",
      method: "AUDIT",
      ipAddress: "system",
      userAgent: "api_auditor",
      responseStatus: 200,
      responseTime: Date.now() - startTime,
      metadata: {
        totalEndpoints: assessments.length,
        secureEndpoints,
        warningEndpoints,
        criticalEndpoints,
        overallRiskScore: Math.round(overallRiskScore),
        auditDuration: Date.now() - startTime,
      },
    });

    console.log("✅ API security audit completed");
    return report;
  } catch (error) {
    console.error("❌ API security audit failed:", error);
    throw error;
  }
}

/**
 * Save audit report to file
 */
export async function saveAuditReport(
  report: ApiAuditReport,
  filename?: string,
): Promise<string> {
  const reportsDir = path.join(process.cwd(), "security-reports");
  await fs.mkdir(reportsDir, { recursive: true });

  const reportFilename =
    filename || `api-audit-${new Date().toISOString().split("T")[0]}.json`;
  const reportPath = path.join(reportsDir, reportFilename);

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  return reportPath;
}
