import { NextRequest, NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { type, to, ...data } = await request.json();

    let emailOptions;

    // Handle different email types
    switch (type) {
      case "welcome-student":
        emailOptions = {
          to,
          ...emailTemplates.welcomeStudent(
            data.studentName,
            data.email,
            data.password,
          ),
        };
        break;

      case "assignment":
        emailOptions = {
          to,
          ...emailTemplates.assignmentNotification(
            data.studentName,
            data.assignment,
            data.dueDate,
          ),
        };
        break;

      case "parent-update":
        emailOptions = {
          to,
          ...emailTemplates.parentUpdate(
            data.parentName,
            data.studentName,
            data.message,
          ),
        };
        break;

      default:
        // Custom email
        emailOptions = {
          to,
          subject: data.subject,
          html: data.html,
          text: data.text,
          from: data.from,
        };
    }

    const result = await sendEmail(emailOptions);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 },
    );
  }
}

// Example usage from your app:
// await fetch('/api/send-email', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     to: 'student001@learn-academy.co.uk',
//     subject: 'Welcome to Learn Academy',
//     text: 'Welcome message...',
//     html: '<h1>Welcome!</h1><p>Your account is ready...</p>'
//   })
// })
