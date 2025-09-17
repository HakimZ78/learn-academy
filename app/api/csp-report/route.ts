import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();

    // Log CSP violations for security monitoring
    console.log("🔒 CSP Violation Report:", {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
      report: report,
    });

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error("CSP Report Error:", error);
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}