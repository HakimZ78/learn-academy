import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // First handle Supabase session update for protected routes
  if (request.nextUrl.pathname.startsWith("/portal")) {
    return await updateSession(request);
  }

  // Apply security headers to all routes
  const response = NextResponse.next();

  // Force HTTPS in production (will activate when deployed to VPS)
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get("host")}${request.nextUrl.pathname}`,
      301,
    );
  }

  // ========================================================================
  // ENHANCED SECURITY HEADERS - SOC2/ISO27001 Compliance
  // ========================================================================

  // HTTP Strict Transport Security (HSTS) - Force HTTPS connections
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // Prevent MIME type sniffing attacks
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking attacks
  response.headers.set("X-Frame-Options", "DENY");

  // XSS Protection (legacy, but still useful for older browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Control referrer information leakage
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Cross-Origin Isolation for enhanced security
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Feature Policy - Disable unnecessary browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=(), interest-cohort=()",
  );

  // Server identification removal (security by obscurity)
  response.headers.set("Server", "Learn-Academy");

  // Cache control for sensitive routes
  if (
    request.nextUrl.pathname.startsWith("/portal") ||
    request.nextUrl.pathname.startsWith("/api/")
  ) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
  }

  // Content Security Policy - Comprehensive XSS and injection protection
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 
      https://images.unsplash.com 
      https://js.stripe.com 
      ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' 
      https://fonts.googleapis.com;
    img-src 'self' data: https: blob: 
      https://images.unsplash.com 
      https://*.unsplash.com;
    font-src 'self' data: 
      https://fonts.gstatic.com;
    connect-src 'self' 
      https://*.supabase.co 
      https://api.stripe.com
      ${process.env.NODE_ENV === "development" ? "ws://localhost:* http://localhost:*" : ""};
    frame-src 'self' 
      https://js.stripe.com 
      https://hooks.stripe.com;
    media-src 'self' data: blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  // Report-Only CSP for monitoring (in development)
  if (process.env.NODE_ENV === "development") {
    const cspReportOnlyHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      report-uri /api/csp-report;
    `
      .replace(/\s{2,}/g, " ")
      .trim();

    response.headers.set(
      "Content-Security-Policy-Report-Only",
      cspReportOnlyHeader,
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
