"use client";

import { useState } from "react";

export default function TestEmailPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to send a welcome email to student001
  const sendWelcomeToStudent001 = async () => {
    setLoading(true);
    setStatus("Sending email...");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "welcome-student",
          to: "student001@learn-academy.co.uk",
          studentName: "Student One",
          email: "student001@learn-academy.co.uk",
          password: "StudentPass123",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("✅ Email sent successfully! Check student001 webmail.");
      } else {
        setStatus("❌ Failed to send email: " + result.error);
      }
    } catch (error) {
      setStatus("❌ Error: " + error);
    }

    setLoading(false);
  };

  // Function to send an assignment notification
  const sendAssignmentNotification = async () => {
    setLoading(true);
    setStatus("Sending assignment notification...");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "assignment",
          to: "student001@learn-academy.co.uk",
          studentName: "Student One",
          assignment: "Math Homework Chapter 5",
          dueDate: "Friday, Sept 20th",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("✅ Assignment notification sent!");
      } else {
        setStatus("❌ Failed: " + result.error);
      }
    } catch (error) {
      setStatus("❌ Error: " + error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Test Email System
        </h1>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              Step 1: Send Welcome Email
            </h2>
            <p className="text-gray-600 mb-4">
              This will send a welcome email to student001@learn-academy.co.uk
            </p>
            <button
              onClick={sendWelcomeToStudent001}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Welcome Email"}
            </button>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              Step 2: Send Assignment
            </h2>
            <p className="text-gray-600 mb-4">
              This will send a homework assignment to student001
            </p>
            <button
              onClick={sendAssignmentNotification}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Assignment"}
            </button>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Step 3: Check Email</h2>
            <p className="text-gray-600 mb-4">
              After sending, go to webmail to see the emails
            </p>
            <a
              href="http://217.154.33.169/"
              target="_blank"
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 inline-block"
            >
              Open Webmail
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Login: student001@learn-academy.co.uk / StudentPass123
            </p>
          </div>

          {status && (
            <div
              className={`p-4 rounded-lg ${
                status.includes("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {status}
            </div>
          )}
        </div>

        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How This Works:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>You click "Send Welcome Email" above</li>
            <li>Your Next.js app sends an email via nodemailer</li>
            <li>The email goes to student001's academy mailbox</li>
            <li>Student001 can read it at the webmail link</li>
            <li>This is how your app communicates with students!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
