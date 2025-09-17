import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, subject, content, recipients } = body;

    // Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = (await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()) as { data: { role: string } | null };

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create nodemailer transporter using port 25
    const nodemailer = require("nodemailer");

    // Port 25 typically doesn't require authentication when sending from localhost
    const transportConfig: any = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "25"),
      secure: false, // Port 25 is not secure
      tls: {
        rejectUnauthorized: false, // For development with self-signed certificates
      },
    };

    // Only add auth if password is provided (port 25 usually doesn't need it)
    if (process.env.EMAIL_PASSWORD) {
      transportConfig.auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Enhanced email content with academy branding
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); color: white; padding: 30px 40px; text-align: center;">
            <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px; margin-bottom: 15px;">
                <div style="width: 24px; height: 24px; background-color: white; border-radius: 6px; display: inline-block;"></div>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Learn Academy</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Learning for a Changing World</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
            <div style="white-space: pre-wrap; line-height: 1.6; color: #374151; font-size: 16px;">
${content}
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 18px;">Contact Information</h3>
                <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 5px 0;">📱 WhatsApp: <a href="https://wa.me/447779602503" style="color: #1e3a8a; text-decoration: none;">+44 7779 602503</a></p>
                    <p style="margin: 5px 0;">📧 Email: <a href="mailto:admin@learn-academy.co.uk" style="color: #1e3a8a; text-decoration: none;">admin@learn-academy.co.uk</a></p>
                    <p style="margin: 5px 0;">🌐 Website: <a href="https://learn-academy.co.uk" style="color: #1e3a8a; text-decoration: none;">learn-academy.co.uk</a></p>
                    <p style="margin: 5px 0;">👨‍💼 Student Portal: <a href="https://learn-academy.co.uk/portal" style="color: #1e3a8a; text-decoration: none;">learn-academy.co.uk/portal</a></p>
                </div>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    This message was sent from Learn Academy's Admin Portal.<br>
                    If you have any questions, please contact us using the information above.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Send emails to all recipients
    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: {
            name: "Learn Academy",
            address: process.env.EMAIL_USER || "admin@learn-academy.co.uk",
          },
          to: recipient.email,
          subject: subject,
          html: emailContent,
          text: content, // Fallback text version
        });

        // Update delivery status in database
        await (supabase as any)
          .from("message_recipients")
          .update({
            delivery_status: "delivered",
            delivered_at: new Date().toISOString(),
          })
          .eq("message_id", messageId)
          .eq("email_address", recipient.email);

        results.push({
          email: recipient.email,
          status: "sent",
          error: null,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);

        // Update delivery status as failed in database
        await (supabase as any)
          .from("message_recipients")
          .update({
            delivery_status: "failed",
            error_message:
              error instanceof Error ? error.message : "Unknown error",
          })
          .eq("message_id", messageId)
          .eq("email_address", recipient.email);

        results.push({
          email: recipient.email,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        errorCount++;
      }
    }

    // Update message status
    const finalStatus =
      errorCount === 0 ? "sent" : successCount === 0 ? "failed" : "sent";
    await (supabase as any)
      .from("admin_messages")
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    return NextResponse.json({
      success: true,
      results,
      stats: {
        total: recipients.length,
        sent: successCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error("Error in send-message API:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
