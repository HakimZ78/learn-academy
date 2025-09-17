import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const fromEmail = options.from || process.env.RESEND_FROM_EMAIL || 'admin@learn-academy.co.uk';
    const fromName = process.env.RESEND_FROM_NAME || 'Learn Academy';

    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("✅ Email sent via Resend:", result.data?.id);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("❌ Resend email error:", error);
    throw new Error(`Failed to send email to ${options.to}: ${error}`);
  }
}

// Pre-built email templates
export const emailTemplates = {
  // Welcome email for new students
  welcomeStudent: (studentName: string, email: string, password: string) => ({
    subject: "Welcome to Learn Academy!",
    html: `
      <h1>Welcome ${studentName}!</h1>
      <p>Your Learn Academy account has been created.</p>
      <h3>Your Login Details:</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p><a href="https://learn-academy.co.uk/portal/login">Access your portal</a></p>
      <hr>
      <p>For technical support: <a href="https://wa.me/447779602503">WhatsApp Support</a></p>
    `,
    text: `Welcome ${studentName}! Your account: ${email} / ${password}. Access: https://learn-academy.co.uk/portal/login`,
  }),

  // Assignment notification
  assignmentNotification: (
    studentName: string,
    assignment: string,
    dueDate: string,
  ) => ({
    subject: `New Assignment: ${assignment}`,
    html: `
      <h2>New Assignment</h2>
      <p>Hi ${studentName},</p>
      <p>You have a new assignment: <strong>${assignment}</strong></p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
      <p><a href="https://learn-academy.co.uk/portal/dashboard">Check your portal for details</a></p>
    `,
    text: `Hi ${studentName}, new assignment: ${assignment}. Due: ${dueDate}. Check your portal.`,
  }),

  // Parent notification
  parentUpdate: (parentName: string, studentName: string, message: string) => ({
    subject: `Update about ${studentName}`,
    html: `
      <h2>Student Update</h2>
      <p>Dear ${parentName},</p>
      <p>${message}</p>
      <p><a href="https://learn-academy.co.uk/contact">Contact us for more information</a></p>
      <hr>
      <p>Learn Academy Team</p>
    `,
    text: `Dear ${parentName}, ${message}. Contact: https://learn-academy.co.uk/contact`,
  }),
};