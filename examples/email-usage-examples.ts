// EMAIL WORKFLOW EXAMPLES
// How to use the email system in your Learn Academy app

// 1. WELCOME EMAIL - When creating a new student account
export async function sendWelcomeEmail(
  studentName: string,
  email: string,
  password: string,
) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "welcome-student",
      to: email, // Send to their academy email
      studentName,
      email,
      password,
    }),
  });

  return response.json();
}

// 2. ASSIGNMENT NOTIFICATION - When posting new homework
export async function notifyAssignment(
  studentEmail: string,
  studentName: string,
  assignment: string,
  dueDate: string,
) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "assignment",
      to: studentEmail,
      studentName,
      assignment,
      dueDate,
    }),
  });

  return response.json();
}

// 3. PARENT UPDATE - Progress reports, meeting requests
export async function updateParent(
  parentEmail: string,
  parentName: string,
  studentName: string,
  message: string,
) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "parent-update",
      to: parentEmail,
      parentName,
      studentName,
      message,
    }),
  });

  return response.json();
}

// 4. CUSTOM EMAIL - For anything else
export async function sendCustomEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      subject,
      html,
      text,
    }),
  });

  return response.json();
}

// 5. COMPLETE WORKFLOW - Creating student account + sending welcome email
export async function createStudentWithWelcome(
  username: string,
  password: string,
  studentName: string,
  personalEmail?: string, // Their Gmail/Yahoo for notifications
) {
  try {
    // 1. Create email account on server (you'd call this via API)
    // This would exec: sudo /usr/local/bin/create_academy_email.sh username password

    // 2. Send welcome to academy email
    const academyEmail = `${username}@learn-academy.co.uk`;
    await sendWelcomeEmail(studentName, academyEmail, password);

    // 3. Optionally notify their personal email too
    if (personalEmail) {
      await sendCustomEmail(
        personalEmail,
        "Your Learn Academy account is ready!",
        `
          <h2>Welcome ${studentName}!</h2>
          <p>Your Learn Academy email account has been created.</p>
          <p><strong>Academy Email:</strong> ${academyEmail}</p>
          <p><a href="http://217.154.33.169/">Access your academy email</a></p>
          <p>Use your academy email for all course communications.</p>
        `,
      );
    }

    return { success: true, academyEmail };
  } catch (error) {
    console.error("Account creation failed:", error);
    return { success: false, error };
  }
}

// 6. BULK NOTIFICATIONS - Send to multiple students
export async function notifyAllStudents(
  studentEmails: string[],
  subject: string,
  message: string,
) {
  const results = [];

  for (const email of studentEmails) {
    try {
      const result = await sendCustomEmail(email, subject, message);
      results.push({ email, success: true });
    } catch (error) {
      results.push({ email, success: false, error });
    }
  }

  return results;
}
