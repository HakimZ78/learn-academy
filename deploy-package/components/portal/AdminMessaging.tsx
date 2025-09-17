"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Home,
  LogOut,
  Mail,
  Send,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash,
  ExternalLink,
  BarChart3,
  TrendingUp,
  FileText,
} from "lucide-react";

interface Message {
  id: string;
  subject: string;
  content: string;
  message_type: string;
  priority: string;
  status: string;
  created_at: string;
  scheduled_for?: string;
  sent_at?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  subject: string;
  category: string;
  active: boolean;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  program_type: string;
  parent_email?: string;
  parent_name?: string;
}

interface AdminMessagingProps {
  messages: Message[];
  templates: Template[];
  students: Student[];
  stats: {
    total: number;
    sent: number;
    pending: number;
  };
}

export default function AdminMessaging({
  messages,
  templates,
  students,
  stats,
}: AdminMessagingProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"messages" | "templates">(
    "messages",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/portal/login");
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      scheduled: "secondary",
      sent: "default",
      failed: "destructive",
    };
    return variants[status] || "outline";
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "outline",
      normal: "secondary",
      high: "default",
      urgent: "destructive",
    };
    return variants[priority] || "secondary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredMessages = messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
              <span className="text-gray-600">Messages</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/portal/admin"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                Dashboard
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Message Center
            </h1>
            <p className="text-gray-600">
              Send messages to students and parents
            </p>
          </div>
          <Link
            href="/portal/admin/messages/compose"
            className="flex items-center gap-2 px-4 py-2 bg-academy-primary text-white rounded-lg hover:bg-academy-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Compose Message
          </Link>
        </div>

        {/* Resend Email Service */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              Resend Email Service
            </h4>
            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              100 emails/day free
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <a
              href="https://resend.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-white rounded border border-gray-200 hover:border-emerald-400 hover:shadow-sm transition-all"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium">Dashboard</span>
              <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
            </a>
            <a
              href="https://resend.com/dashboard/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-white rounded border border-gray-200 hover:border-emerald-400 hover:shadow-sm transition-all"
            >
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Analytics</span>
              <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
            </a>
            <a
              href="https://resend.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-white rounded border border-gray-200 hover:border-emerald-400 hover:shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">API Docs</span>
              <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.total}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Messages</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.sent}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Messages Sent</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.pending}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Pending</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {students.length}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Active Students</h3>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {["messages", "templates"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? "border-academy-primary text-academy-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Search and Filter Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {activeTab === "messages" && (
              <div className="space-y-4">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No messages found</p>
                    <p className="text-gray-400 mb-6">
                      Get started by composing your first message
                    </p>
                    <Link
                      href="/portal/admin/messages/compose"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-academy-primary text-white rounded-lg hover:bg-academy-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Compose Message
                    </Link>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {message.subject}
                            </h3>
                            <Badge variant={getStatusVariant(message.status)}>
                              {message.status}
                            </Badge>
                            <Badge variant={getPriorityVariant(message.priority)}>
                              {message.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {message.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Type: {message.message_type}</span>
                            <span>
                              Created: {formatDate(message.created_at)}
                            </span>
                            {message.sent_at && (
                              <span>Sent: {formatDate(message.sent_at)}</span>
                            )}
                            {message.scheduled_for && (
                              <span>
                                Scheduled: {formatDate(message.scheduled_for)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "templates" && (
              <div className="space-y-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No templates found</p>
                    <p className="text-gray-400">
                      Templates will help you send consistent messages
                    </p>
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {template.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}
                            >
                              {template.category}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {template.description}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Subject: {template.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/portal/admin/messages/compose?template=${template.id}`}
                            className="px-3 py-1.5 text-sm bg-academy-primary text-white rounded hover:bg-academy-secondary transition-colors"
                          >
                            Use Template
                          </Link>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
