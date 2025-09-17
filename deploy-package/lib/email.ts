import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: options.from || process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    throw new Error(`Failed to send email: ${error}`);
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
      <p><a href="http://217.154.33.169/">Access your email</a></p>
      <hr>
      <p>For technical support: <a href="https://wa.me/447958575757">WhatsApp Support</a></p>
    `,
    text: `Welcome ${studentName}! Your account: ${email} / ${password}. Access: http://217.154.33.169/`,
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
      <p><a href="http://217.154.33.169/">Check your academy email for details</a></p>
    `,
    text: `Hi ${studentName}, new assignment: ${assignment}. Due: ${dueDate}. Check your academy email.`,
  }),

  // Parent notification
  parentUpdate: (parentName: string, studentName: string, message: string) => ({
    subject: `Update about ${studentName}`,
    html: `
      <h2>Student Update</h2>
      <p>Dear ${parentName},</p>
      <p>${message}</p>
      <p><a href="http://217.154.33.169/">Access your parent portal</a></p>
      <hr>
      <p>Learn Academy Team</p>
    `,
    text: `Dear ${parentName}, ${message}. Access portal: http://217.154.33.169/`,
  }),
};
