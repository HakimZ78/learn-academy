import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentName,
      studentAge,
      parentName,
      email,
      phone,
      program,
      subjects,
      startDate,
      additionalInfo,
    } = body;

    // Format program name
    const programNames: Record<string, string> = {
      foundation: "Foundation Program (Ages 8-11)",
      elevate: "Elevate Program (Ages 11-14)",
      gcse: "GCSE Program (Ages 14-16)",
      "a-level": "A-Level Program (Ages 16-18)",
    };

    const selectedProgram = programNames[program] || program;
    const selectedSubjects = subjects && subjects.length > 0
      ? subjects.join(", ")
      : "Not specified";

    // Format date
    const formattedDate = startDate
      ? new Date(startDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Not specified";

    // Email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3730a3); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 24px;">📚 New Enrolment Request</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Learn Academy</p>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="color: #1e3a8a; margin-top: 0;">Student Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Name:</td><td style="padding: 8px 0;">${studentName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Age:</td><td style="padding: 8px 0;">${studentAge}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Program:</td><td style="padding: 8px 0;">${selectedProgram}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Subjects:</td><td style="padding: 8px 0;">${selectedSubjects}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Start Date:</td><td style="padding: 8px 0;">${formattedDate}</td></tr>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="color: #1e3a8a; margin-top: 0;">Parent/Guardian Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Name:</td><td style="padding: 8px 0;">${parentName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #1e3a8a;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Phone:</td><td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #1e3a8a;">${phone}</a></td></tr>
            </table>
          </div>

          ${additionalInfo ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="color: #1e3a8a; margin-top: 0;">Additional Information</h3>
            <p style="color: #374151; line-height: 1.6;">${additionalInfo}</p>
          </div>
          ` : ''}

          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>Quick Actions:</strong><br>
              • Reply: <a href="mailto:${email}?subject=Re: Enrolment at Learn Academy - ${studentName}" style="color: #1e3a8a;">Send Email</a><br>
              • Call: <a href="tel:${phone}" style="color: #1e3a8a;">${phone}</a><br>
              • WhatsApp: <a href="https://wa.me/${phone.replace(/\s/g, '').replace(/^0/, '44')}" style="color: #1e3a8a;">Send Message</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const adminEmailText = `
New Enrolment Request - Learn Academy

STUDENT INFORMATION
Name: ${studentName}
Age: ${studentAge}
Program: ${selectedProgram}
Subjects: ${selectedSubjects}
Start Date: ${formattedDate}

PARENT/GUARDIAN INFORMATION
Name: ${parentName}
Email: ${email}
Phone: ${phone}

${additionalInfo ? `ADDITIONAL INFORMATION\n${additionalInfo}\n` : ''}

Reply to: ${email}
Call: ${phone}
    `;

    // Auto-reply to parent
    const parentEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3730a3); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 24px;">✅ Enrolment Request Received</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Learn Academy</p>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 0;">Dear ${parentName},</p>

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Thank you for your interest in enrolling <strong>${studentName}</strong> at Learn Academy!
            </p>

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              We've received your enrolment request for the <strong>${selectedProgram}</strong> and will review it carefully.
            </p>

            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3a8a; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">What happens next?</h3>
              <ol style="color: #1e40af; line-height: 1.8;">
                <li><strong>Review:</strong> We'll review your enrolment request within 24 hours</li>
                <li><strong>Consultation:</strong> We'll contact you to schedule a consultation call</li>
                <li><strong>Personalised Plan:</strong> We'll create a tailored learning plan for ${studentName}</li>
                <li><strong>Start Learning:</strong> Begin the personalised education journey</li>
              </ol>
            </div>

            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #15803d;">Your Enrolment Summary</h3>
              <p style="color: #15803d; margin: 8px 0;"><strong>Student:</strong> ${studentName} (Age ${studentAge})</p>
              <p style="color: #15803d; margin: 8px 0;"><strong>Program:</strong> ${selectedProgram}</p>
              ${subjects && subjects.length > 0 ? `<p style="color: #15803d; margin: 8px 0;"><strong>Subjects of Interest:</strong> ${selectedSubjects}</p>` : ''}
              ${startDate ? `<p style="color: #15803d; margin: 8px 0;"><strong>Preferred Start Date:</strong> ${formattedDate}</p>` : ''}
            </div>

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              If you have any urgent questions, please don't hesitate to contact us:
            </p>

            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #374151; margin: 5px 0;">📱 WhatsApp: <a href="https://wa.me/447779602503" style="color: #1e3a8a;">+44 7779 602503</a></p>
              <p style="color: #374151; margin: 5px 0;">📧 Email: <a href="mailto:admin@learn-academy.co.uk" style="color: #1e3a8a;">admin@learn-academy.co.uk</a></p>
              <p style="color: #374151; margin: 5px 0;">🌐 Website: <a href="https://learn-academy.co.uk" style="color: #1e3a8a;">learn-academy.co.uk</a></p>
            </div>

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              We look forward to welcoming ${studentName} to our learning community!
            </p>

            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 0;">
              Best regards,<br>
              <strong>The Learn Academy Team</strong><br>
              <em>Learning for a Changing World</em>
            </p>
          </div>
        </div>
      </div>
    `;

    const parentEmailText = `
Dear ${parentName},

Thank you for your interest in enrolling ${studentName} at Learn Academy!

We've received your enrolment request for the ${selectedProgram} and will review it carefully.

WHAT HAPPENS NEXT?
1. Review: We'll review your enrolment request within 24 hours
2. Consultation: We'll contact you to schedule a consultation call
3. Personalised Plan: We'll create a tailored learning plan for ${studentName}
4. Start Learning: Begin the personalised education journey

YOUR ENROLMENT SUMMARY
Student: ${studentName} (Age ${studentAge})
Program: ${selectedProgram}
${subjects && subjects.length > 0 ? `Subjects of Interest: ${selectedSubjects}` : ''}
${startDate ? `Preferred Start Date: ${formattedDate}` : ''}

If you have any urgent questions, please contact us:
📱 WhatsApp: +44 7779 602503 (https://wa.me/447779602503)
📧 Email: admin@learn-academy.co.uk
🌐 Website: learn-academy.co.uk

We look forward to welcoming ${studentName} to our learning community!

Best regards,
The Learn Academy Team
Learning for a Changing World
    `;

    // Send both emails
    await Promise.all([
      // Admin notification
      sendEmail({
        to: "admin@learn-academy.co.uk",
        subject: `📚 New Enrolment: ${studentName} - ${selectedProgram}`,
        html: adminEmailHtml,
        text: adminEmailText,
      }),

      // Parent confirmation
      sendEmail({
        to: email,
        subject: `✅ Enrolment Request Received - Learn Academy`,
        html: parentEmailHtml,
        text: parentEmailText,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Enrolment request submitted successfully",
    });
  } catch (error) {
    console.error("Enrolment submission error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit enrolment request",
      },
      { status: 500 }
    );
  }
}