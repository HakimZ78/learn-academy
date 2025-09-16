"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Home,
  LogOut,
  Send,
  Save,
  Clock,
  Users,
  User,
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: any;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  program_type: string;
  parent_email?: string;
  parent_name?: string;
}

interface ComposeMessageProps {
  templates: Template[];
  students: Student[];
}

export default function ComposeMessage({
  templates,
  students,
}: ComposeMessageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    subject: "",
    content: "",
    messageType: "individual" as "individual" | "group" | "program" | "all",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    recipients: [] as string[],
    scheduledFor: "",
    templateId: "",
  });
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [recipientType, setRecipientType] = useState<
    "student" | "parent" | "both"
  >("student");
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load template if specified in URL
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setMessage((prev) => ({
          ...prev,
          subject: template.subject,
          content: template.content,
          templateId: template.id,
        }));
      }
    }
  }, [searchParams, templates]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/portal/login");
  };

  const handleStudentSelect = (student: Student) => {
    if (!selectedStudents.find((s) => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student]);
      setMessage((prev) => ({
        ...prev,
        recipients: [...prev.recipients, student.id],
      }));
    }
    setShowStudentSelector(false);
  };

  const handleStudentRemove = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter((s) => s.id !== studentId));
    setMessage((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((id) => id !== studentId),
    }));
  };

  const handleMessageTypeChange = (
    type: "individual" | "group" | "program" | "all",
  ) => {
    setMessage((prev) => ({ ...prev, messageType: type }));

    if (type === "all") {
      setSelectedStudents(students);
      setMessage((prev) => ({
        ...prev,
        recipients: students.map((s) => s.id),
      }));
    } else if (type === "program") {
      setSelectedStudents([]);
      setMessage((prev) => ({ ...prev, recipients: [] }));
    } else {
      setSelectedStudents([]);
      setMessage((prev) => ({ ...prev, recipients: [] }));
    }
  };

  const handleProgramSelect = (program: string) => {
    const programStudents = students.filter((s) => s.program_type === program);
    setSelectedStudents(programStudents);
    setMessage((prev) => ({
      ...prev,
      recipients: programStudents.map((s) => s.id),
    }));
  };

  const sendMessage = async (isDraft = false) => {
    setLoading(true);

    try {
      // Create the message
      const { data: messageData, error: messageError } = await (supabase as any)
        .from("admin_messages")
        .insert({
          subject: message.subject,
          content: message.content,
          message_type: message.messageType,
          priority: message.priority,
          status: isDraft ? "draft" : "sent",
          scheduled_for: message.scheduledFor || null,
          sent_at: isDraft ? null : new Date().toISOString(),
          template_id: message.templateId || null,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Create recipients
      const recipients = [];
      for (const studentId of message.recipients) {
        const student = students.find((s) => s.id === studentId);
        if (!student) continue;

        if (recipientType === "student" || recipientType === "both") {
          recipients.push({
            message_id: messageData.id,
            recipient_type: "student",
            student_id: studentId,
            email_address: student.email,
            recipient_name: student.full_name,
            delivery_status: isDraft ? "pending" : "sent",
          });
        }

        if (
          (recipientType === "parent" || recipientType === "both") &&
          student.parent_email
        ) {
          recipients.push({
            message_id: messageData.id,
            recipient_type: "parent",
            student_id: studentId,
            email_address: student.parent_email,
            recipient_name:
              student.parent_name || `Parent of ${student.full_name}`,
            delivery_status: isDraft ? "pending" : "sent",
          });
        }
      }

      if (recipients.length > 0) {
        const { error: recipientError } = await (supabase as any)
          .from("message_recipients")
          .insert(recipients);

        if (recipientError) throw recipientError;
      }

      // If not draft, send emails
      if (!isDraft) {
        await sendEmails(messageData.id, recipients);
      }

      setNotification({
        type: "success",
        message: isDraft
          ? "Message saved as draft"
          : "Message sent successfully",
      });

      setTimeout(() => {
        router.push("/portal/admin/messages");
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
      setNotification({
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEmails = async (messageId: string, recipients: any[]) => {
    try {
      // Send emails via the API
      await fetch("/api/admin/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          subject: message.subject,
          content: message.content,
          recipients: recipients.map((r) => ({
            email: r.email_address,
            name: r.recipient_name,
          })),
        }),
      });
    } catch (error) {
      console.error("Error sending emails:", error);
    }
  };

  const programTypes = ["foundation", "elevate", "gcse", "a-level"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-academy-primary to-academy-accent rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">
                  Learn Academy
                </span>
              </Link>
              <span className="text-gray-400">/</span>
              <Link
                href="/portal/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                Admin Portal
              </Link>
              <span className="text-gray-400">/</span>
              <Link
                href="/portal/admin/messages"
                className="text-gray-600 hover:text-gray-900"
              >
                Messages
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Compose</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/portal/admin/messages"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Messages
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {notification.message}
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compose Message
          </h1>
          <p className="text-gray-600">
            Send a message to students and parents
          </p>
        </div>

        <form className="space-y-6">
          {/* Message Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Message Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: "individual", label: "Individual", icon: User },
                { key: "group", label: "Group", icon: Users },
                { key: "program", label: "By Program", icon: BookOpen },
                { key: "all", label: "All Students", icon: Users },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleMessageTypeChange(key as any)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    message.messageType === key
                      ? "border-academy-primary bg-academy-light text-academy-primary"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recipients
            </h3>

            {/* Recipient Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send to:
              </label>
              <div className="flex gap-3">
                {["student", "parent", "both"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRecipientType(type as any)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      recipientType === type
                        ? "border-academy-primary bg-academy-light text-academy-primary"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {type === "both"
                      ? "Student & Parent"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Program Selection for program type */}
            {message.messageType === "program" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Program:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {programTypes.map((program) => (
                    <button
                      key={program}
                      type="button"
                      onClick={() => handleProgramSelect(program)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-academy-primary hover:bg-academy-light transition-colors"
                    >
                      {program.charAt(0).toUpperCase() + program.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Student Selection for individual/group */}
            {(message.messageType === "individual" ||
              message.messageType === "group") && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowStudentSelector(!showStudentSelector)}
                  className="flex items-center gap-2 px-4 py-2 border border-academy-primary text-academy-primary rounded-lg hover:bg-academy-light transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Students
                </button>

                {showStudentSelector && (
                  <div className="mt-3 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleStudentSelect(student)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {student.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email} • {student.program_type}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected Recipients */}
            {selectedStudents.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Recipients ({selectedStudents.length} students):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-2 px-3 py-1 bg-academy-light text-academy-primary rounded-full text-sm"
                    >
                      <span>{student.full_name}</span>
                      <button
                        type="button"
                        onClick={() => handleStudentRemove(student.id)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Message Content
            </h3>

            <div className="space-y-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={message.priority}
                  onChange={(e) =>
                    setMessage((prev) => ({
                      ...prev,
                      priority: e.target.value as any,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={message.subject}
                  onChange={(e) =>
                    setMessage((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                  placeholder="Enter message subject"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message.content}
                  onChange={(e) =>
                    setMessage((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={10}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                  placeholder="Enter your message content"
                  required
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Send (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={message.scheduledFor}
                  onChange={(e) =>
                    setMessage((prev) => ({
                      ...prev,
                      scheduledFor: e.target.value,
                    }))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to send immediately
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Link
              href="/portal/admin/messages"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => sendMessage(true)}
                disabled={
                  loading ||
                  !message.subject ||
                  !message.content ||
                  selectedStudents.length === 0
                }
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => sendMessage(false)}
                disabled={
                  loading ||
                  !message.subject ||
                  !message.content ||
                  selectedStudents.length === 0
                }
                className="flex items-center gap-2 px-6 py-2 bg-academy-primary text-white rounded-lg hover:bg-academy-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    {message.scheduledFor ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {message.scheduledFor ? "Schedule" : "Send Now"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
