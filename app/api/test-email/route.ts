/**
 * Email Test API Endpoint
 * Learn Academy - Test email functionality with Resend
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";
import { logApiEvent } from "@/lib/audit";

/**
 * POST /api/test-email - Send test email
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ipAddress = "127.0.0.1";

  try {
    const body = await request.json();
    const { to, type = "simple", testData } = body;

    if (!to) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_RECIPIENT",
            message: "Email recipient required",
          },
        },
        { status: 400 },
      );
    }

    let emailContent;

    switch (type) {
      case "simple":
        emailContent = {
          subject: "Learn Academy Email Test",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1e3a8a;">✅ Email Test Successful!</h1>
              <p>This is a test email from Learn Academy to verify email functionality.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Test Details:</h3>
                <ul>
                  <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                  <li><strong>Email Provider:</strong> Resend</li>
                  <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
                  <li><strong>To:</strong> ${to}</li>
                </ul>
              </div>
              
              <p>If you received this email, your Learn Academy email configuration is working correctly!</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <div style="color: #6b7280; font-size: 14px;">
                <p><strong>Learn Academy</strong><br>
                Learning for a Changing World</p>
                <p>📧 contact@learnacademy.co.uk<br>
                📱 WhatsApp: <a href="https://wa.me/447958575757">+44 7958 575757</a><br>
                🌐 <a href="https://learnacademy.co.uk">learnacademy.co.uk</a></p>
              </div>
            </div>
          `,
          text: `Learn Academy Email Test\n\nThis is a test email to verify email functionality.\n\nTimestamp: ${new Date().toISOString()}\nFrom: ${process.env.EMAIL_FROM}\nTo: ${to}\n\nIf you received this email, your email configuration is working correctly!\n\nLearn Academy\ncontact@learnacademy.co.uk`,
        };
        break;

      case "welcome":
        if (!testData?.studentName) {
          return NextResponse.json(
            {
              error: {
                code: "MISSING_DATA",
                message: "Student name required for welcome email test",
              },
            },
            { status: 400 },
          );
        }
        emailContent = emailTemplates.welcomeStudent(
          testData.studentName,
          to,
          "test-password-123",
        );
        break;

      case "assignment":
        if (!testData?.studentName || !testData?.assignment) {
          return NextResponse.json(
            {
              error: {
                code: "MISSING_DATA",
                message:
                  "Student name and assignment required for assignment email test",
              },
            },
            { status: 400 },
          );
        }
        emailContent = emailTemplates.assignmentNotification(
          testData.studentName,
          testData.assignment,
          testData.dueDate ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        );
        break;

      case "parent":
        if (
          !testData?.parentName ||
          !testData?.studentName ||
          !testData?.message
        ) {
          return NextResponse.json(
            {
              error: {
                code: "MISSING_DATA",
                message:
                  "Parent name, student name, and message required for parent email test",
              },
            },
            { status: 400 },
          );
        }
        emailContent = emailTemplates.parentUpdate(
          testData.parentName,
          testData.studentName,
          testData.message,
        );
        break;

      default:
        return NextResponse.json(
          {
            error: {
              code: "INVALID_TYPE",
              message:
                "Invalid email type. Use: simple, welcome, assignment, parent",
            },
          },
          { status: 400 },
        );
    }

    // Send the email
    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Log successful email test
    await logApiEvent({
      endpoint: "/api/test-email",
      method: "POST",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 200,
      responseTime: Date.now() - startTime,
      metadata: {
        emailType: type,
        recipient: to,
        messageId: result.messageId,
        emailProvider: "Resend",
        testSuccessful: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      details: {
        type,
        recipient: to,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        emailProvider: "Resend",
      },
    });
  } catch (error) {
    console.error("Email test error:", error);

    // Log failed email test
    await logApiEvent({
      endpoint: "/api/test-email",
      method: "POST",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 500,
      responseTime: Date.now() - startTime,
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        emailProvider: "Resend",
        testSuccessful: false,
      },
    });

    return NextResponse.json(
      {
        error: {
          code: "EMAIL_TEST_FAILED",
          message: "Failed to send test email",
          details: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/test-email - Get email configuration status
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ipAddress = "127.0.0.1";

  try {
    const emailConfig = {
      configured: !!process.env.RESEND_API_KEY,
      provider: "Resend",
      fromAddress: process.env.RESEND_FROM_EMAIL || "Not configured",
      fromName: process.env.RESEND_FROM_NAME || "Learn Academy",
      lastUpdated: "September 17, 2025 - Switched to Resend API",
    };

    await logApiEvent({
      endpoint: "/api/test-email",
      method: "GET",
      ipAddress,
      userAgent: request.headers.get("user-agent") || "unknown",
      responseStatus: 200,
      responseTime: Date.now() - startTime,
      metadata: {
        configurationCheck: true,
        emailConfigured: emailConfig.configured,
      },
    });

    return NextResponse.json({
      emailConfiguration: emailConfig,
      testTypes: [
        {
          type: "simple",
          description: "Basic test email with system information",
          requiredFields: ["to"],
        },
        {
          type: "welcome",
          description: "Welcome email template for new students",
          requiredFields: ["to", "testData.studentName"],
        },
        {
          type: "assignment",
          description: "Assignment notification template",
          requiredFields: ["to", "testData.studentName", "testData.assignment"],
        },
        {
          type: "parent",
          description: "Parent update notification template",
          requiredFields: [
            "to",
            "testData.parentName",
            "testData.studentName",
            "testData.message",
          ],
        },
      ],
      usage: {
        endpoint: "/api/test-email",
        method: "POST",
        example: {
          to: "test@example.com",
          type: "simple",
        },
      },
    });
  } catch (error) {
    console.error("Email config check error:", error);

    return NextResponse.json(
      {
        error: {
          code: "CONFIG_CHECK_FAILED",
          message: "Failed to check email configuration",
        },
      },
      { status: 500 },
    );
  }
}
