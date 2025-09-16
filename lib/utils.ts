/**
 * Utility functions for Learn Academy
 */

import { NextRequest } from "next/server";

/**
 * Get client IP address from NextRequest
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfIP) {
    return cfIP;
  }

  // Fallback for localhost
  return "127.0.0.1";
}

/**
 * Convert string | null to string | undefined
 */
export function nullToUndefined(value: string | null): string | undefined {
  return value === null ? undefined : value;
}
