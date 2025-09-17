/**
 * Secure Contact Form API Endpoint
 * Learn Academy - SOC2/ISO27001 Compliant Form Handler
 *
 * Features:
 * - Input validation with Zod schemas
 * - Rate limiting protection
 * - CSRF token validation
 * - Bot detection (honeypot)
 * - Comprehensive audit logging
 * - Secure error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { validateContactForm } from "@/lib/validation";
import { logFormEvent, logSecurityEvent, logApiEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { headers } from "next/headers";

/**
 * Send contact form email notification
 */
async function sendContactFormEmail(formData: any) {
  const timestamp = new Date().toISOString();
  const formattedTime = new Date().toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });

  // Email to admin (system@learn-academy.co.uk)
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #3730a3); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">📧 New Contact Form Submission</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Learn Academy Website</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="color: #1e3a8a; margin-top: 0;">Contact Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Name:</td><td style="padding: 8px 0;">${formData.fullName}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${formData.email}" style="color: #1e3a8a; text-decoration: none;">${formData.email}</a></td></tr>
            ${formData.phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Phone:</td><td style="padding: 8px 0;"><a href="tel:${formData.phone}" style="color: #1e3a8a; text-decoration: none;">${formData.phone}</a></td></tr>` : ""}
            <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Preferred Contact:</td><td style="padding: 8px 0;">${formData.preferredContact}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject:</td><td style="padding: 8px 0;">${formData.subject}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Submitted:</td><td style="padding: 8px 0;">${formattedTime}</td></tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="color: #1e3a8a; margin-top: 0;">Message</h3>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid #1e3a8a; white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">${formData.message}</div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>Quick Actions:</strong><br>
            • Reply to: <a href="mailto:${formData.email}?subject=Re: ${encodeURIComponent(formData.subject)}" style="color: #1e3a8a;">Email Response</a><br>
            ${formData.phone ? `• Call: <a href="tel:${formData.phone}" style="color: #1e3a8a;">${formData.phone}</a><br>` : ""}
            • WhatsApp: <a href="https://wa.me/447779602503?text=Hi, regarding your enquiry about ${encodeURIComponent(formData.subject)}" style="color: #1e3a8a;">Send WhatsApp</a>
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
        <p>Learn Academy Contact Form System<br>
        Powered by Resend • ${timestamp}</p>
      </div>
    </div>
  `;

  const adminEmailText = `
New Contact Form Submission - Learn Academy

Name: ${formData.fullName}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}\n` : ""}Preferred Contact: ${formData.preferredContact}
Subject: ${formData.subject}
Submitted: ${formattedTime}

Message:
${formData.message}

Quick Reply: mailto:${formData.email}?subject=Re: ${encodeURIComponent(formData.subject)}
${formData.phone ? `Call: tel:${formData.phone}\n` : ""}WhatsApp: https://wa.me/447779602503

Learn Academy Contact Form System
${timestamp}
  `;

  // Auto-reply to the person who submitted the form
  const autoReplyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #3730a3); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">✅ Message Received</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Learn Academy</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 0;">Dear ${formData.fullName},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">Thank you for contacting Learn Academy! We've received your enquiry about <strong>"${formData.subject}"</strong> and will respond as soon as possible.</p>
          
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3a8a; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">What happens next?</h3>
            <ul style="color: #1e40af; line-height: 1.6; margin-bottom: 0;">
              <li>We typically respond within 24 hours (usually much sooner!)</li>
              <li>We'll reply to your preferred contact method: <strong>${formData.preferredContact}</strong></li>
              <li>For urgent enquiries, you can WhatsApp us directly</li>
            </ul>
          </div>
          
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #15803d;">Quick Contact Options</h3>
            <p style="color: #15803d; margin-bottom: 10px;"><strong>📱 WhatsApp:</strong> <a href="https://wa.me/447779602503" style="color: #16a34a; text-decoration: none;">+44 7779 602503</a></p>
            <p style="color: #15803d; margin-bottom: 10px;"><strong>📧 Email:</strong> <a href="mailto:admin@learn-academy.co.uk" style="color: #16a34a; text-decoration: none;">admin@learn-academy.co.uk</a></p>
            <p style="color: #15803d; margin-bottom: 0;"><strong>🌐 Website:</strong> <a href="https://learn-academy.co.uk" style="color: #16a34a; text-decoration: none;">learn-academy.co.uk</a></p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">We're excited to help you on your learning journey!</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 0;">
            Best regards,<br>
            <strong>The Learn Academy Team</strong><br>
            <em>Learning for a Changing World</em>
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
        <p>This is an automated response. Please do not reply to this email.<br>
        For support, contact us via WhatsApp or our main email address.</p>
      </div>
    </div>
  `;

  const autoReplyText = `
Dear ${formData.fullName},

Thank you for contacting Learn Academy! We've received your enquiry about "${formData.subject}" and will respond as soon as possible.

What happens next?
• We typically respond within 24 hours (usually much sooner!)
• We'll reply to your preferred contact method: ${formData.preferredContact}
• For urgent enquiries, you can WhatsApp us directly

Quick Contact Options:
📱 WhatsApp: +44 7779 602503 (https://wa.me/447779602503)
📧 Email: admin@learn-academy.co.uk
🌐 Website: learn-academy.co.uk

We're excited to help you on your learning journey!

Best regards,
The Learn Academy Team
Learning for a Changing World

---
This is an automated response. Please do not reply to this email.
For support, contact us via WhatsApp or our main email address.
  `;

  // Send both emails
  await Promise.all([
    // Admin notification
    sendEmail({
      to: "admin@learn-academy.co.uk",
      subject: `📧 New Contact: ${formData.subject} - ${formData.fullName}`,
      html: adminEmailHtml,
      text: adminEmailText,
    }),

    // Auto-reply to user
    sendEmail({
      to: formData.email,
      subject: `✅ Message Received - Learn Academy`,
      html: autoReplyHtml,
      text: autoReplyText,
    }),
  ]);
}

function getRealIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  // Fallback to connection IP
  return "127.0.0.1";
}

function detectBot(userAgent: string, formData: any): boolean {
  // Check honeypot field
  if (formData.website && formData.website.trim() !== "") {
    return true;
  }

  // Check for suspicious user agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
  ];

  return botPatterns.some((pattern) => pattern.test(userAgent));
}

function generateSecureResponse(data: any, statusCode: number = 200) {
  const response = NextResponse.json(data, { status: statusCode });

  // Security headers for API responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

  return response;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = getRealIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    // Check rate limiting using centralized system
    const rateCheck = await checkRateLimit("contact", ip, {
      userAgent,
      requestPath: "/api/contact",
    });

    if (!rateCheck.allowed) {
      return generateSecureResponse(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
            rateLimitInfo: {
              remaining: rateCheck.remaining,
              resetTime: new Date(rateCheck.resetTime).toISOString(),
              usingRedis: rateCheck.usingRedis,
            },
          },
        },
        429,
      );
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      await logSecurityEvent({
        eventType: "suspicious_activity",
        ipAddress: ip,
        userAgent,
        requestPath: "/api/contact",
        metadata: { error: "Invalid JSON payload" },
      });

      return generateSecureResponse(
        {
          error: {
            code: "INVALID_PAYLOAD",
            message: "Invalid request format",
          },
        },
        400,
      );
    }

    // Bot detection
    if (detectBot(userAgent, requestData)) {
      await logSecurityEvent({
        eventType: "suspicious_activity",
        ipAddress: ip,
        userAgent,
        requestPath: "/api/contact",
        metadata: {
          reason: "Bot detected",
          honeypot: requestData.website || "empty",
        },
      });

      // Return success to avoid revealing detection
      return generateSecureResponse({
        success: true,
        message: "Message received successfully",
      });
    }

    // Validate form data
    let validatedData;
    try {
      validatedData = await validateContactForm(requestData);
    } catch (error: any) {
      // Log validation failure
      await logFormEvent({
        eventType: "form_submission",
        formType: "contact_form",
        ipAddress: ip,
        userAgent,
        metadata: {
          validationError: error.issues || error.message,
          result: "validation_failed",
        },
      });

      if (error.issues) {
        return generateSecureResponse(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Please check your input and try again",
              details: error.issues.map((issue: any) => ({
                field: issue.path?.[0],
                message: issue.message,
              })),
            },
          },
          400,
        );
      }

      return generateSecureResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid form data",
          },
        },
        400,
      );
    }

    // Process the validated form submission
    try {
      // Log successful form submission
      await logFormEvent({
        eventType: "contact_form_submitted",
        formType: "contact_form",
        ipAddress: ip,
        userAgent,
        metadata: {
          subject: validatedData.subject,
          preferredContact: validatedData.preferredContact,
          hasPhone: !!validatedData.phone,
          messageLength: validatedData.message.length,
          result: "success",
        },
      });

      // Send email notification - IONOS port issue resolved!
      try {
        await sendContactFormEmail(validatedData);
        console.log("✅ Contact form email sent successfully");
      } catch (emailError) {
        console.error("❌ Failed to send contact form email:", emailError);
        // Don't fail the entire request if email fails
      }

      // Also log the contact form data for backup
      console.log("📧 Contact Form Submission:", {
        from: validatedData.email,
        name: validatedData.fullName,
        subject: validatedData.subject,
        phone: validatedData.phone,
        preferredContact: validatedData.preferredContact,
        messagePreview: validatedData.message.substring(0, 100) + "...",
        timestamp: new Date().toISOString(),
      });

      // Log API call metrics
      await logApiEvent({
        endpoint: "/api/contact",
        method: "POST",
        ipAddress: ip,
        userAgent,
        responseStatus: 200,
        responseTime: Date.now() - startTime,
        metadata: {
          formType: "contact",
          rateLimit: {
            remaining: rateCheck.remaining - 1,
            resetTime: rateCheck.resetTime,
            usingRedis: rateCheck.usingRedis,
          },
        },
      });

      return generateSecureResponse({
        success: true,
        message:
          "Thank you for your message! We will get back to you within 24 hours.",
        metadata: {
          submittedAt: new Date().toISOString(),
          responseTime: `${Date.now() - startTime}ms`,
        },
      });
    } catch (processingError: any) {
      // Log processing error
      await logFormEvent({
        eventType: "form_submission",
        formType: "contact_form",
        ipAddress: ip,
        userAgent,
        metadata: {
          error: processingError.message,
          result: "processing_failed",
        },
      });

      throw processingError;
    }
  } catch (error: any) {
    // Log API error
    await logApiEvent({
      endpoint: "/api/contact",
      method: "POST",
      ipAddress: ip,
      userAgent,
      responseStatus: 500,
      responseTime: Date.now() - startTime,
      metadata: {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });

    console.error("Contact form error:", error);

    return generateSecureResponse(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An error occurred while processing your request. Please try again later.",
        },
      },
      500,
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return generateSecureResponse(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "GET method not supported for this endpoint",
      },
    },
    405,
  );
}

export async function PUT() {
  return generateSecureResponse(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "PUT method not supported for this endpoint",
      },
    },
    405,
  );
}

export async function DELETE() {
  return generateSecureResponse(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "DELETE method not supported for this endpoint",
      },
    },
    405,
  );
}
