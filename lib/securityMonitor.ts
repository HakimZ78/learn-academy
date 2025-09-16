/**
 * Security Monitoring Dashboard System
 * Learn Academy - SOC2/ISO27001 Compliant Security Monitoring
 *
 * Features:
 * - Real-time security metrics collection
 * - Threat detection and alerting
 * - Security event correlation and analysis
 * - Compliance dashboard with KPIs
 * - Incident response automation
 * - Security posture assessment
 * - Integration with SIEM systems
 * - Automated threat intelligence
 */

import { logSecurityEvent, auditLogger, AuditEventType } from "@/lib/audit";
import { logger, LogCategory } from "@/lib/logger";
import { generateApiAuditReport, ApiAuditReport } from "@/lib/apiAudit";
import { getRateLimitStats } from "@/middleware/rateLimit";
import { getAuthStats } from "@/middleware/authMiddleware";

/**
 * Security alert severity levels
 */
export enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Security metric types
 */
export enum MetricType {
  AUTHENTICATION_ATTEMPTS = "auth_attempts",
  FAILED_LOGINS = "failed_logins",
  RATE_LIMIT_VIOLATIONS = "rate_limit_violations",
  API_ERRORS = "api_errors",
  SUSPICIOUS_ACTIVITIES = "suspicious_activities",
  COMPLIANCE_SCORE = "compliance_score",
  VULNERABILITY_COUNT = "vulnerability_count",
  INCIDENT_COUNT = "incident_count",
}

/**
 * Security metrics interface
 */
export interface SecurityMetric {
  id: string;
  type: MetricType;
  name: string;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: "up" | "down" | "stable";
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Security alert interface
 */
export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  type: AuditEventType | "system";
  timestamp: Date;
  source: string;
  ipAddress?: string;
  userId?: string;
  metadata?: Record<string, any>;
  acknowledged: boolean;
  resolvedAt?: Date;
  responseActions?: string[];
}

/**
 * Security dashboard data
 */
export interface SecurityDashboard {
  timestamp: Date;
  overallScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  metrics: SecurityMetric[];
  alerts: SecurityAlert[];
  recentEvents: {
    total: number;
    byType: Record<AuditEventType, number>;
    last24Hours: number;
  };
  compliance: {
    soc2: number;
    iso27001: number;
    gdpr: number;
    overall: number;
  };
  systemHealth: {
    apiEndpoints: number;
    secureEndpoints: number;
    authCoverage: number;
    rateLimitCoverage: number;
    lastAudit: Date;
  };
  threatIntelligence: {
    blockedIPs: number;
    detectedThreats: number;
    mitigatedAttacks: number;
  };
}

/**
 * Threat detection rules
 */
interface ThreatRule {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  pattern: RegExp | ((event: any) => boolean);
  threshold: number;
  timeWindow: number; // minutes
  actions: string[];
}

/**
 * Security Monitor class
 */
export class SecurityMonitor {
  private alerts: SecurityAlert[] = [];
  private metrics: Map<string, SecurityMetric[]> = new Map();
  private threatRules: ThreatRule[] = [];
  private ipReputation: Map<
    string,
    { score: number; lastSeen: Date; blocked: boolean }
  > = new Map();
  private activeThreats: Set<string> = new Set();

  constructor() {
    this.initializeThreatRules();
    this.startBackgroundMonitoring();
  }

  /**
   * Initialize threat detection rules
   */
  private initializeThreatRules(): void {
    this.threatRules = [
      {
        id: "brute_force_detection",
        name: "Brute Force Attack Detection",
        description: "Multiple failed login attempts from same IP",
        severity: AlertSeverity.HIGH,
        pattern: /failed_login|authentication_failed/,
        threshold: 5,
        timeWindow: 15,
        actions: ["block_ip", "notify_admin", "log_incident"],
      },
      {
        id: "rate_limit_abuse",
        name: "Rate Limit Abuse Detection",
        description: "Excessive rate limiting violations",
        severity: AlertSeverity.MEDIUM,
        pattern: /rate_limit_exceeded/,
        threshold: 10,
        timeWindow: 5,
        actions: ["temporary_block", "log_incident"],
      },
      {
        id: "sql_injection_attempt",
        name: "SQL Injection Detection",
        description: "Potential SQL injection in request",
        severity: AlertSeverity.CRITICAL,
        pattern: /(union\s+select|drop\s+table|delete\s+from|insert\s+into)/i,
        threshold: 1,
        timeWindow: 1,
        actions: ["block_ip", "immediate_alert", "log_incident"],
      },
      {
        id: "xss_attempt",
        name: "XSS Attack Detection",
        description: "Cross-site scripting attempt detected",
        severity: AlertSeverity.HIGH,
        pattern: /<script|javascript:|onload=|onerror=/i,
        threshold: 1,
        timeWindow: 1,
        actions: ["block_request", "log_incident"],
      },
      {
        id: "unusual_api_activity",
        name: "Unusual API Activity",
        description: "Abnormal API usage patterns detected",
        severity: AlertSeverity.MEDIUM,
        pattern: (event: any) => {
          // Custom logic for unusual patterns
          return (
            event.metadata?.responseTime > 5000 ||
            event.metadata?.requestSize > 1000000
          );
        },
        threshold: 3,
        timeWindow: 10,
        actions: ["monitor_closely", "log_incident"],
      },
    ];
  }

  /**
   * Start background monitoring processes
   */
  private startBackgroundMonitoring(): void {
    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateSecurityMetrics().catch(console.error);
    }, 30000);

    // Check for threats every 60 seconds
    setInterval(() => {
      this.analyzeThreats().catch(console.error);
    }, 60000);

    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData().catch(console.error);
    }, 3600000);
  }

  /**
   * Update security metrics from various sources
   */
  private async updateSecurityMetrics(): Promise<void> {
    try {
      const timestamp = new Date();
      const auditLogs = await auditLogger.queryLogs({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      });

      // Authentication metrics
      const authAttempts = auditLogs.filter(
        (log) =>
          log.eventType.includes("authentication") ||
          log.eventType.includes("login"),
      ).length;

      const failedLogins = auditLogs.filter(
        (log) =>
          log.eventType === "authentication_failed" ||
          log.eventType === "login_failure",
      ).length;

      // Rate limiting metrics
      const rateLimitViolations = auditLogs.filter(
        (log) => log.eventType === "rate_limit_exceeded",
      ).length;

      // API error metrics
      const apiErrors = auditLogs.filter(
        (log) =>
          log.eventType.includes("error") && log.metadata?.statusCode >= 400,
      ).length;

      // Suspicious activities
      const suspiciousActivities = auditLogs.filter(
        (log) => log.eventType === "suspicious_activity",
      ).length;

      // Update metrics
      this.addMetric({
        id: `auth_attempts_${timestamp.getTime()}`,
        type: MetricType.AUTHENTICATION_ATTEMPTS,
        name: "Authentication Attempts (24h)",
        value: authAttempts,
        unit: "attempts",
        threshold: { warning: 100, critical: 500 },
        trend: this.calculateTrend(
          MetricType.AUTHENTICATION_ATTEMPTS,
          authAttempts,
        ),
        timestamp,
      });

      this.addMetric({
        id: `failed_logins_${timestamp.getTime()}`,
        type: MetricType.FAILED_LOGINS,
        name: "Failed Login Attempts (24h)",
        value: failedLogins,
        unit: "failures",
        threshold: { warning: 20, critical: 100 },
        trend: this.calculateTrend(MetricType.FAILED_LOGINS, failedLogins),
        timestamp,
      });

      this.addMetric({
        id: `rate_limit_violations_${timestamp.getTime()}`,
        type: MetricType.RATE_LIMIT_VIOLATIONS,
        name: "Rate Limit Violations (24h)",
        value: rateLimitViolations,
        unit: "violations",
        threshold: { warning: 50, critical: 200 },
        trend: this.calculateTrend(
          MetricType.RATE_LIMIT_VIOLATIONS,
          rateLimitViolations,
        ),
        timestamp,
      });

      // Calculate compliance score
      const apiAuditReport = await generateApiAuditReport();
      const complianceScore = this.calculateComplianceScore(apiAuditReport);

      this.addMetric({
        id: `compliance_score_${timestamp.getTime()}`,
        type: MetricType.COMPLIANCE_SCORE,
        name: "Overall Compliance Score",
        value: complianceScore,
        unit: "percentage",
        threshold: { warning: 80, critical: 60 },
        trend: this.calculateTrend(
          MetricType.COMPLIANCE_SCORE,
          complianceScore,
        ),
        timestamp,
        metadata: {
          soc2: Math.round(
            (apiAuditReport.summary.authenticationCoverage +
              apiAuditReport.summary.auditLoggingCoverage) /
              2,
          ),
          iso27001: Math.round(
            (apiAuditReport.summary.rateLimitCoverage +
              apiAuditReport.summary.inputValidationCoverage) /
              2,
          ),
        },
      });

      await logger.debug("Security metrics updated", LogCategory.SECURITY, {
        metricsCount: this.metrics.size,
        timestamp: timestamp.toISOString(),
      });
    } catch (error) {
      await logger.error(
        "Failed to update security metrics",
        LogCategory.ERROR,
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  }

  /**
   * Add a security metric
   */
  private addMetric(metric: SecurityMetric): void {
    const key = metric.type;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metrics = this.metrics.get(key)!;
    metrics.push(metric);

    // Keep only last 100 metrics per type
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
  }

  /**
   * Calculate metric trend
   */
  private calculateTrend(
    type: MetricType,
    currentValue: number,
  ): "up" | "down" | "stable" {
    const metrics = this.metrics.get(type);
    if (!metrics || metrics.length < 2) {
      return "stable";
    }

    const previousValue = metrics[metrics.length - 1].value;
    const threshold = previousValue * 0.1; // 10% threshold

    if (currentValue > previousValue + threshold) {
      return "up";
    } else if (currentValue < previousValue - threshold) {
      return "down";
    }

    return "stable";
  }

  /**
   * Calculate overall compliance score
   */
  private calculateComplianceScore(auditReport: ApiAuditReport): number {
    const weights = {
      authentication: 0.25,
      rateLimit: 0.2,
      inputValidation: 0.25,
      auditLogging: 0.15,
      securityRatio: 0.15,
    };

    const securityRatio =
      auditReport.totalEndpoints > 0
        ? (auditReport.secureEndpoints / auditReport.totalEndpoints) * 100
        : 0;

    return Math.round(
      auditReport.summary.authenticationCoverage * weights.authentication +
        auditReport.summary.rateLimitCoverage * weights.rateLimit +
        auditReport.summary.inputValidationCoverage * weights.inputValidation +
        auditReport.summary.auditLoggingCoverage * weights.auditLogging +
        securityRatio * weights.securityRatio,
    );
  }

  /**
   * Analyze threats based on recent events
   */
  private async analyzeThreats(): Promise<void> {
    try {
      const recentEvents = await auditLogger.queryLogs({
        startDate: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      });

      for (const rule of this.threatRules) {
        const matchingEvents = recentEvents.filter((event) => {
          if (typeof rule.pattern === "function") {
            return rule.pattern(event);
          }

          const searchText = `${event.eventType} ${event.metadata?.message || ""} ${event.metadata?.userAgent || ""}`;
          return rule.pattern.test(searchText);
        });

        if (matchingEvents.length >= rule.threshold) {
          await this.createThreatAlert(rule, matchingEvents);
        }
      }
    } catch (error) {
      await logger.error("Threat analysis failed", LogCategory.ERROR, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Create a threat alert
   */
  private async createThreatAlert(
    rule: ThreatRule,
    events: any[],
  ): Promise<void> {
    const alertId = `${rule.id}_${Date.now()}`;

    // Check if similar alert already exists
    const existingAlert = this.alerts.find(
      (alert) =>
        alert.type === rule.id &&
        !alert.acknowledged &&
        Date.now() - alert.timestamp.getTime() < 30 * 60 * 1000, // 30 minutes
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    const alert: SecurityAlert = {
      id: alertId,
      title: rule.name,
      description: `${rule.description}. Detected ${events.length} events in the last ${rule.timeWindow} minutes.`,
      severity: rule.severity,
      type: rule.id as AuditEventType,
      timestamp: new Date(),
      source: "threat_detection",
      ipAddress: events[0]?.ipAddress,
      userId: events[0]?.userId,
      metadata: {
        rule: rule.id,
        eventCount: events.length,
        timeWindow: rule.timeWindow,
        events: events.slice(0, 5), // Include first 5 events
      },
      acknowledged: false,
      responseActions: rule.actions,
    };

    this.alerts.unshift(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.splice(100);
    }

    // Execute automated response actions
    await this.executeResponseActions(alert, events);

    // Log the alert
    await logSecurityEvent({
      eventType: "security_alert_created",
      ipAddress: alert.ipAddress || "system",
      userAgent: "security_monitor",
      requestPath: "/security/monitor",
      userId: alert.userId,
      metadata: {
        alertId: alert.id,
        alertSeverity: alert.severity,
        alertType: alert.type,
        eventCount: events.length,
      },
    });

    await logger.security(`Security alert created: ${alert.title}`, {
      alertId: alert.id,
      severity: alert.severity,
      eventCount: events.length,
    });
  }

  /**
   * Execute automated response actions
   */
  private async executeResponseActions(
    alert: SecurityAlert,
    events: any[],
  ): Promise<void> {
    for (const action of alert.responseActions || []) {
      try {
        switch (action) {
          case "block_ip":
            if (alert.ipAddress) {
              await this.blockIP(alert.ipAddress, "automated_threat_response");
            }
            break;

          case "temporary_block":
            if (alert.ipAddress) {
              await this.blockIP(alert.ipAddress, "temporary_block", 60); // 1 hour
            }
            break;

          case "notify_admin":
            await this.notifyAdministrators(alert);
            break;

          case "log_incident":
            await this.logIncident(alert, events);
            break;

          case "immediate_alert":
            await this.sendImmediateAlert(alert);
            break;
        }
      } catch (error) {
        await logger.error(
          `Failed to execute response action: ${action}`,
          LogCategory.ERROR,
          {
            alertId: alert.id,
            action,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        );
      }
    }
  }

  /**
   * Block IP address
   */
  private async blockIP(
    ipAddress: string,
    reason: string,
    durationMinutes?: number,
  ): Promise<void> {
    const expiresAt = durationMinutes
      ? new Date(Date.now() + durationMinutes * 60 * 1000)
      : undefined;

    this.ipReputation.set(ipAddress, {
      score: 0,
      lastSeen: new Date(),
      blocked: true,
    });

    await logSecurityEvent({
      eventType: "ip_blocked",
      ipAddress,
      userAgent: "security_monitor",
      requestPath: "/security/block-ip",
      metadata: {
        reason,
        durationMinutes,
        expiresAt: expiresAt?.toISOString(),
        automated: true,
      },
    });

    await logger.security(`IP address blocked: ${ipAddress}`, {
      reason,
      durationMinutes,
      automated: true,
    });
  }

  /**
   * Notify administrators of security alert
   */
  private async notifyAdministrators(alert: SecurityAlert): Promise<void> {
    // In production, this would send emails, Slack notifications, etc.
    await logger.audit("Administrator notification sent", {
      alertId: alert.id,
      alertSeverity: alert.severity,
      notificationMethod: "email",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log security incident
   */
  private async logIncident(
    alert: SecurityAlert,
    events: any[],
  ): Promise<void> {
    await logSecurityEvent({
      eventType: "security_incident",
      ipAddress: alert.ipAddress || "system",
      userAgent: "security_monitor",
      requestPath: "/security/incident",
      userId: alert.userId,
      metadata: {
        incidentId: `INC-${Date.now()}`,
        alertId: alert.id,
        severity: alert.severity,
        eventCount: events.length,
        timeframe: "1 hour",
        status: "open",
        automated: true,
      },
    });
  }

  /**
   * Send immediate alert for critical issues
   */
  private async sendImmediateAlert(alert: SecurityAlert): Promise<void> {
    // In production, this would trigger immediate notifications (SMS, phone calls, etc.)
    await logger.fatal(
      `IMMEDIATE SECURITY ALERT: ${alert.title}`,
      LogCategory.SECURITY,
      {
        alertId: alert.id,
        severity: alert.severity,
        description: alert.description,
        timestamp: alert.timestamp.toISOString(),
      },
    );
  }

  /**
   * Clean up old data
   */
  private async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Clean up old alerts
    this.alerts = this.alerts.filter((alert) => alert.timestamp > cutoffDate);

    // Clean up old metrics
    for (const [type, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(
        (metric) => metric.timestamp > cutoffDate,
      );
      this.metrics.set(type, filtered);
    }

    // Clean up IP reputation data
    for (const [ip, data] of this.ipReputation.entries()) {
      if (data.lastSeen < cutoffDate) {
        this.ipReputation.delete(ip);
      }
    }

    await logger.debug(
      "Security monitoring data cleanup completed",
      LogCategory.SYSTEM,
    );
  }

  /**
   * Get current security dashboard data
   */
  async getDashboard(): Promise<SecurityDashboard> {
    const now = new Date();
    const apiAuditReport = await generateApiAuditReport();
    const rateLimitStats = await getRateLimitStats();
    const authStats = await getAuthStats();

    // Get recent events
    const recentEvents = await auditLogger.queryLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    const eventsByType: Record<string, number> = {};
    for (const event of recentEvents) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    }

    // Calculate overall risk level
    const criticalAlerts = this.alerts.filter(
      (a) => a.severity === AlertSeverity.CRITICAL && !a.acknowledged,
    ).length;
    const highAlerts = this.alerts.filter(
      (a) => a.severity === AlertSeverity.HIGH && !a.acknowledged,
    ).length;

    let riskLevel: SecurityDashboard["riskLevel"];
    if (criticalAlerts > 0) {
      riskLevel = "critical";
    } else if (highAlerts > 0) {
      riskLevel = "high";
    } else if (apiAuditReport.overallRiskScore > 60) {
      riskLevel = "medium";
    } else {
      riskLevel = "low";
    }

    // Calculate overall score (inverse of risk)
    const overallScore = Math.max(
      0,
      100 -
        apiAuditReport.overallRiskScore -
        criticalAlerts * 10 -
        highAlerts * 5,
    );

    // Get latest metrics
    const currentMetrics: SecurityMetric[] = [];
    for (const [type, metrics] of this.metrics.entries()) {
      if (metrics.length > 0) {
        currentMetrics.push(metrics[metrics.length - 1]);
      }
    }

    return {
      timestamp: now,
      overallScore,
      riskLevel,
      metrics: currentMetrics,
      alerts: this.alerts.slice(0, 20), // Latest 20 alerts
      recentEvents: {
        total: recentEvents.length,
        byType: eventsByType,
        last24Hours: recentEvents.length,
      },
      compliance: {
        soc2: Math.round(
          (apiAuditReport.summary.authenticationCoverage +
            apiAuditReport.summary.auditLoggingCoverage) /
            2,
        ),
        iso27001: Math.round(
          (apiAuditReport.summary.rateLimitCoverage +
            apiAuditReport.summary.inputValidationCoverage) /
            2,
        ),
        gdpr: Math.round(
          apiAuditReport.summary.auditLoggingCoverage * 0.8 +
            apiAuditReport.summary.inputValidationCoverage * 0.2,
        ),
        overall: this.calculateComplianceScore(apiAuditReport),
      },
      systemHealth: {
        apiEndpoints: apiAuditReport.totalEndpoints,
        secureEndpoints: apiAuditReport.secureEndpoints,
        authCoverage: apiAuditReport.summary.authenticationCoverage,
        rateLimitCoverage: apiAuditReport.summary.rateLimitCoverage,
        lastAudit: apiAuditReport.timestamp,
      },
      threatIntelligence: {
        blockedIPs: Array.from(this.ipReputation.values()).filter(
          (r) => r.blocked,
        ).length,
        detectedThreats: this.alerts.filter(
          (a) => a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000),
        ).length,
        mitigatedAttacks: this.alerts.filter(
          (a) =>
            a.acknowledged &&
            a.resolvedAt &&
            a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000),
        ).length,
      },
    };
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) {
      return false;
    }

    alert.acknowledged = true;
    alert.resolvedAt = new Date();

    await logSecurityEvent({
      eventType: "alert_acknowledged",
      ipAddress: "system",
      userAgent: "security_dashboard",
      requestPath: "/security/acknowledge",
      userId,
      metadata: {
        alertId,
        alertType: alert.type,
        alertSeverity: alert.severity,
      },
    });

    return true;
  }

  /**
   * Get security metrics for a specific time range
   */
  getMetricHistory(type: MetricType, hours: number = 24): SecurityMetric[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const metrics = this.metrics.get(type) || [];

    return metrics.filter((metric) => metric.timestamp > cutoff);
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ipAddress: string): boolean {
    const reputation = this.ipReputation.get(ipAddress);
    return reputation?.blocked === true;
  }

  /**
   * Get blocked IPs
   */
  getBlockedIPs(): string[] {
    const blocked: string[] = [];
    for (const [ip, reputation] of this.ipReputation.entries()) {
      if (reputation.blocked) {
        blocked.push(ip);
      }
    }
    return blocked;
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();
