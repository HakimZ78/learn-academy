/**
 * Centralized Logging System
 * Learn Academy - SOC2/ISO27001 Compliant Logging
 *
 * Features:
 * - Structured JSON logging with correlation IDs
 * - Multiple log levels and output formats
 * - Security event logging with PII masking
 * - Performance metrics and request tracing
 * - Log rotation and retention policies
 * - Integration with external logging services
 * - Compliance audit trails
 * - Real-time log streaming support
 */

import * as fs from "fs/promises";
import * as path from "path";

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  AUDIT = 5, // Special level for audit trails
}

/**
 * Log categories for filtering and routing
 */
export enum LogCategory {
  SYSTEM = "system",
  SECURITY = "security",
  API = "api",
  AUTH = "auth",
  PERFORMANCE = "performance",
  AUDIT = "audit",
  ERROR = "error",
  BUSINESS = "business",
  COMPLIANCE = "compliance",
}

/**
 * Log output destinations
 */
export enum LogOutput {
  CONSOLE = "console",
  FILE = "file",
  DATABASE = "database",
  EXTERNAL = "external",
  STREAM = "stream",
}

/**
 * Structured log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  correlationId?: string;
  sessionId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  traceId?: string;
  component?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  compliance?: {
    sox?: boolean;
    gdpr?: boolean;
    iso27001?: boolean;
    hipaa?: boolean;
  };
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  outputs: LogOutput[];
  format: "json" | "text" | "structured";
  enableColors: boolean;
  enableTimestamps: boolean;
  enableCorrelationIds: boolean;
  logDirectory?: string;
  maxFileSize: number; // bytes
  maxFiles: number;
  rotateOnStartup: boolean;
  maskPII: boolean;
  retentionDays: number;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  enableMetrics: boolean;
  enableTracing: boolean;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG,
  outputs: [LogOutput.CONSOLE, LogOutput.FILE],
  format: "json",
  enableColors: process.env.NODE_ENV !== "production",
  enableTimestamps: true,
  enableCorrelationIds: true,
  logDirectory: path.join(process.cwd(), "logs"),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  rotateOnStartup: true,
  maskPII: true,
  retentionDays: 90,
  enableRemoteLogging: process.env.NODE_ENV === "production",
  remoteEndpoint: process.env.LOG_ENDPOINT,
  enableMetrics: true,
  enableTracing: true,
};

/**
 * PII patterns for masking sensitive information
 */
const PII_PATTERNS = [
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "***@***.***",
  },
  {
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    replacement: "****-****-****-****",
  },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "***-**-****" },
  { pattern: /\b\d{10,12}\b/g, replacement: "***********" },
  {
    pattern: /(password|passwd|pwd|secret|key|token)["\s:=]+[^\s"]+/gi,
    replacement: "$1: [REDACTED]",
  },
  {
    pattern: /(authorization|auth)["\s:=]+(bearer\s+)?[^\s"]+/gi,
    replacement: "$1: [REDACTED]",
  },
];

/**
 * Centralized Logger class
 */
export class Logger {
  private config: LoggerConfig;
  private correlationIdStore = new Map<string, string>();
  private logMetrics = {
    totalLogs: 0,
    errorLogs: 0,
    securityLogs: 0,
    performanceLogs: 0,
    lastLogTime: new Date(),
    averageLogSize: 0,
  };

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeLogger();
  }

  /**
   * Initialize logger (create directories, setup rotation, etc.)
   */
  private async initializeLogger(): Promise<void> {
    try {
      if (
        this.config.outputs.includes(LogOutput.FILE) &&
        this.config.logDirectory
      ) {
        await fs.mkdir(this.config.logDirectory, { recursive: true });

        if (this.config.rotateOnStartup) {
          await this.rotateLogsIfNeeded();
        }
      }

      // Log system startup
      await this.info("Logger initialized", LogCategory.SYSTEM, {
        config: {
          level: LogLevel[this.config.level],
          outputs: this.config.outputs,
          format: this.config.format,
          logDirectory: this.config.logDirectory,
        },
      });
    } catch (error) {
      console.error("Failed to initialize logger:", error);
    }
  }

  /**
   * Generate correlation ID for request tracing
   */
  public generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Mask PII in log messages and metadata
   */
  private maskPII(data: any): any {
    if (!this.config.maskPII) {
      return data;
    }

    if (typeof data === "string") {
      let masked = data;
      for (const { pattern, replacement } of PII_PATTERNS) {
        masked = masked.replace(pattern, replacement);
      }
      return masked;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskPII(item));
    }

    if (data && typeof data === "object") {
      const masked: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Completely redact sensitive keys
        if (
          ["password", "secret", "token", "key", "authorization"].includes(
            key.toLowerCase(),
          )
        ) {
          masked[key] = "[REDACTED]";
        } else {
          masked[key] = this.maskPII(value);
        }
      }
      return masked;
    }

    return data;
  }

  /**
   * Format log entry based on configuration
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.format === "json") {
      return JSON.stringify(entry);
    }

    if (this.config.format === "text") {
      const level = LogLevel[entry.level].padEnd(5);
      const category = `[${entry.category}]`.padEnd(12);
      const correlation = entry.correlationId
        ? ` (${entry.correlationId})`
        : "";
      const user = entry.userId ? ` user:${entry.userId}` : "";
      const ip = entry.ipAddress ? ` ip:${entry.ipAddress}` : "";

      return `${entry.timestamp} ${level} ${category} ${entry.message}${correlation}${user}${ip}`;
    }

    // Structured format
    const parts = [
      entry.timestamp,
      LogLevel[entry.level],
      entry.category,
      entry.message,
    ];

    if (entry.correlationId) parts.push(`correlation:${entry.correlationId}`);
    if (entry.userId) parts.push(`user:${entry.userId}`);
    if (entry.ipAddress) parts.push(`ip:${entry.ipAddress}`);
    if (entry.duration) parts.push(`duration:${entry.duration}ms`);

    return parts.join(" | ");
  }

  /**
   * Get appropriate log file path for category and level
   */
  private getLogFilePath(category: LogCategory, level: LogLevel): string {
    if (!this.config.logDirectory) {
      return path.join(process.cwd(), "logs", "app.log");
    }

    const date = new Date().toISOString().split("T")[0];

    if (category === LogCategory.SECURITY || level >= LogLevel.ERROR) {
      return path.join(this.config.logDirectory, `${category}-${date}.log`);
    }

    if (category === LogCategory.AUDIT) {
      return path.join(this.config.logDirectory, `audit-${date}.log`);
    }

    return path.join(this.config.logDirectory, `app-${date}.log`);
  }

  /**
   * Rotate logs if they exceed size limit
   */
  private async rotateLogsIfNeeded(): Promise<void> {
    if (!this.config.logDirectory) return;

    try {
      const files = await fs.readdir(this.config.logDirectory);

      for (const file of files) {
        if (!file.endsWith(".log")) continue;

        const filePath = path.join(this.config.logDirectory, file);
        const stats = await fs.stat(filePath);

        if (stats.size > this.config.maxFileSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const rotatedPath = path.join(
            this.config.logDirectory,
            `${file.replace(".log", "")}-${timestamp}.log`,
          );

          await fs.rename(filePath, rotatedPath);

          // Clean up old rotated files
          await this.cleanupOldLogs();
        }
      }
    } catch (error) {
      console.error("Log rotation failed:", error);
    }
  }

  /**
   * Clean up old log files based on retention policy
   */
  private async cleanupOldLogs(): Promise<void> {
    if (!this.config.logDirectory) return;

    try {
      const files = await fs.readdir(this.config.logDirectory);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      for (const file of files) {
        if (!file.endsWith(".log")) continue;

        const filePath = path.join(this.config.logDirectory, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error("Log cleanup failed:", error);
    }
  }

  /**
   * Write log entry to configured outputs
   */
  private async writeLogEntry(entry: LogEntry): Promise<void> {
    // Update metrics
    this.logMetrics.totalLogs++;
    this.logMetrics.lastLogTime = new Date();

    if (entry.level >= LogLevel.ERROR) {
      this.logMetrics.errorLogs++;
    }

    if (entry.category === LogCategory.SECURITY) {
      this.logMetrics.securityLogs++;
    }

    if (entry.category === LogCategory.PERFORMANCE) {
      this.logMetrics.performanceLogs++;
    }

    // Skip if log level is below configured threshold
    if (entry.level < this.config.level) {
      return;
    }

    const formattedEntry = this.formatLogEntry(entry);
    const entrySize = Buffer.byteLength(formattedEntry, "utf8");

    // Update average log size (simple moving average)
    this.logMetrics.averageLogSize =
      (this.logMetrics.averageLogSize + entrySize) / 2;

    // Output to console
    if (this.config.outputs.includes(LogOutput.CONSOLE)) {
      if (this.config.enableColors && entry.level >= LogLevel.WARN) {
        const color = entry.level >= LogLevel.ERROR ? "\x1b[31m" : "\x1b[33m"; // Red or yellow
        console.log(`${color}${formattedEntry}\x1b[0m`);
      } else {
        console.log(formattedEntry);
      }
    }

    // Output to file
    if (this.config.outputs.includes(LogOutput.FILE)) {
      try {
        const logFile = this.getLogFilePath(entry.category, entry.level);
        await fs.appendFile(logFile, formattedEntry + "\n");

        // Check if rotation is needed
        const stats = await fs.stat(logFile);
        if (stats.size > this.config.maxFileSize) {
          await this.rotateLogsIfNeeded();
        }
      } catch (error) {
        console.error("Failed to write log to file:", error);
      }
    }

    // Output to external service
    if (
      this.config.outputs.includes(LogOutput.EXTERNAL) &&
      this.config.remoteEndpoint
    ) {
      try {
        await this.sendToRemoteEndpoint(entry);
      } catch (error) {
        console.error("Failed to send log to remote endpoint:", error);
      }
    }
  }

  /**
   * Send log entry to remote logging service
   */
  private async sendToRemoteEndpoint(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LOG_API_TOKEN || ""}`,
        },
        body: JSON.stringify({
          timestamp: entry.timestamp,
          level: LogLevel[entry.level],
          category: entry.category,
          message: entry.message,
          metadata: entry.metadata,
          source: "learn-academy-api",
        }),
      });

      if (!response.ok) {
        throw new Error(`Remote logging failed: ${response.status}`);
      }
    } catch (error) {
      // Don't log this error to prevent infinite loops
      console.error("Remote logging error:", error);
    }
  }

  /**
   * Core logging method
   */
  private async log(
    level: LogLevel,
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    metadata?: Record<string, any>,
    options?: {
      correlationId?: string;
      sessionId?: string;
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
      traceId?: string;
      component?: string;
      tags?: string[];
      duration?: number;
      error?: Error;
      compliance?: LogEntry["compliance"];
    },
  ): Promise<void> {
    const correlationId =
      options?.correlationId ||
      (this.config.enableCorrelationIds
        ? this.generateCorrelationId()
        : undefined);

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message: this.maskPII(message),
      correlationId,
      sessionId: options?.sessionId,
      userId: options?.userId,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      requestId: options?.requestId,
      traceId: options?.traceId,
      component: options?.component,
      metadata: metadata ? this.maskPII(metadata) : undefined,
      tags: options?.tags,
      duration: options?.duration,
      compliance: options?.compliance,
    };

    if (options?.error) {
      entry.error = {
        name: options.error.name,
        message: this.maskPII(options.error.message),
        stack:
          process.env.NODE_ENV === "development"
            ? options.error.stack
            : undefined,
        code: (options.error as any).code,
      };
    }

    await this.writeLogEntry(entry);
  }

  /**
   * Debug level logging
   */
  async debug(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    metadata?: Record<string, any>,
    options?: Parameters<typeof Logger.prototype.log>[4],
  ): Promise<void> {
    await this.log(LogLevel.DEBUG, message, category, metadata, options);
  }

  /**
   * Info level logging
   */
  async info(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    metadata?: Record<string, any>,
    options?: Parameters<typeof Logger.prototype.log>[4],
  ): Promise<void> {
    await this.log(LogLevel.INFO, message, category, metadata, options);
  }

  /**
   * Warning level logging
   */
  async warn(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    metadata?: Record<string, any>,
    options?: Parameters<typeof Logger.prototype.log>[4],
  ): Promise<void> {
    await this.log(LogLevel.WARN, message, category, metadata, options);
  }

  /**
   * Error level logging
   */
  async error(
    message: string,
    category: LogCategory = LogCategory.ERROR,
    metadata?: Record<string, any>,
    options?: Parameters<typeof Logger.prototype.log>[4],
  ): Promise<void> {
    await this.log(LogLevel.ERROR, message, category, metadata, options);
  }

  /**
   * Fatal level logging
   */
  async fatal(
    message: string,
    category: LogCategory = LogCategory.ERROR,
    metadata?: Record<string, any>,
    options?: Parameters<typeof Logger.prototype.log>[4],
  ): Promise<void> {
    await this.log(LogLevel.FATAL, message, category, metadata, options);
  }

  /**
   * Audit level logging (for compliance)
   */
  async audit(
    message: string,
    metadata?: Record<string, any>,
    options?: Parameters<typeof Logger.prototype.log>[4] & {
      compliance?: {
        sox?: boolean;
        gdpr?: boolean;
        iso27001?: boolean;
        hipaa?: boolean;
      };
    },
  ): Promise<void> {
    await this.log(LogLevel.AUDIT, message, LogCategory.AUDIT, metadata, {
      ...options,
      compliance: options?.compliance,
    });
  }

  /**
   * Log performance metrics
   */
  async performance(
    message: string,
    duration: number,
    metadata?: Record<string, any>,
    options?: Parameters<typeof Logger.prototype.log>[4],
  ): Promise<void> {
    await this.log(
      LogLevel.INFO,
      message,
      LogCategory.PERFORMANCE,
      {
        ...metadata,
        performanceMetrics: {
          duration,
          timestamp: new Date().toISOString(),
        },
      },
      { ...options, duration },
    );
  }

  /**
   * Log security events
   */
  async security(
    message: string,
    metadata?: Record<string, any>,
    options?: Parameters<typeof Logger.prototype.log>[4],
  ): Promise<void> {
    await this.log(LogLevel.WARN, message, LogCategory.SECURITY, metadata, {
      ...options,
      compliance: { iso27001: true, sox: true },
    });
  }

  /**
   * Get logging metrics
   */
  getMetrics(): typeof Logger.prototype.logMetrics {
    return { ...this.logMetrics };
  }

  /**
   * Set correlation ID for current context
   */
  setCorrelationId(contextId: string, correlationId: string): void {
    this.correlationIdStore.set(contextId, correlationId);
  }

  /**
   * Get correlation ID for context
   */
  getCorrelationId(contextId: string): string | undefined {
    return this.correlationIdStore.get(contextId);
  }

  /**
   * Clear correlation ID
   */
  clearCorrelationId(contextId: string): void {
    this.correlationIdStore.delete(contextId);
  }
}

// Global logger instance
export const logger = new Logger();

/**
 * Express.js middleware for request logging
 */
export function requestLoggingMiddleware() {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const correlationId = logger.generateCorrelationId();
    const requestId = req.headers["x-request-id"] || correlationId;

    // Add correlation ID to request
    req.correlationId = correlationId;
    req.requestId = requestId;

    // Set response header
    res.setHeader("X-Correlation-ID", correlationId);
    res.setHeader("X-Request-ID", requestId);

    // Log request start
    await logger.info(
      "Request started",
      LogCategory.API,
      {
        method: req.method,
        url: req.url,
        userAgent: req.headers["user-agent"],
        ip: req.ip || req.connection.remoteAddress,
        contentLength: req.headers["content-length"],
      },
      {
        correlationId,
        requestId,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        component: "http-middleware",
      },
    );

    // Intercept response
    const originalSend = res.send;
    res.send = function (body: any) {
      const duration = Date.now() - startTime;

      // Log response
      logger.info(
        "Request completed",
        LogCategory.API,
        {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          responseSize: body ? Buffer.byteLength(body) : 0,
        },
        {
          correlationId,
          requestId,
          duration,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          component: "http-middleware",
        },
      );

      return originalSend.call(this, body);
    };

    next();
  };
}

/**
 * Create child logger with preset context
 */
export function createChildLogger(context: {
  component?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
}): Omit<Logger, "config"> {
  return {
    debug: (
      message: string,
      category?: LogCategory,
      metadata?: Record<string, any>,
    ) => logger.debug(message, category, metadata, context),

    info: (
      message: string,
      category?: LogCategory,
      metadata?: Record<string, any>,
    ) => logger.info(message, category, metadata, context),

    warn: (
      message: string,
      category?: LogCategory,
      metadata?: Record<string, any>,
    ) => logger.warn(message, category, metadata, context),

    error: (
      message: string,
      category?: LogCategory,
      metadata?: Record<string, any>,
    ) => logger.error(message, category, metadata, context),

    fatal: (
      message: string,
      category?: LogCategory,
      metadata?: Record<string, any>,
    ) => logger.fatal(message, category, metadata, context),

    audit: (message: string, metadata?: Record<string, any>, options?: any) =>
      logger.audit(message, metadata, { ...options, ...context }),

    performance: (
      message: string,
      duration: number,
      metadata?: Record<string, any>,
    ) => logger.performance(message, duration, metadata, context),

    security: (message: string, metadata?: Record<string, any>) =>
      logger.security(message, metadata, context),

    getMetrics: () => logger.getMetrics(),

    setCorrelationId: logger.setCorrelationId.bind(logger),
    getCorrelationId: logger.getCorrelationId.bind(logger),
    generateCorrelationId: logger.generateCorrelationId.bind(logger),
    clearCorrelationId: logger.clearCorrelationId.bind(logger),
  };
}
