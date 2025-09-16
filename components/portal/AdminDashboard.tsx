"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Users,
  FileText,
  Upload,
  UserPlus,
  Settings,
  LogOut,
  Home,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Mail,
  ExternalLink,
  BarChart3,
  Clock,
} from "lucide-react";

interface AdminDashboardProps {
  stats: {
    students: number;
    materials: number;
    assignments: number;
  };
  recentStudents: Array<{
    id: string;
    full_name: string;
    email: string;
    program_type: string;
    created_at: string;
  }>;
  recentMaterials: Array<{
    id: string;
    title: string;
    subject: string;
    program_level: string;
    created_at: string;
  }>;
}

export default function AdminDashboard({
  stats,
  recentStudents,
  recentMaterials,
}: AdminDashboardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "materials" | "assignments" | "messages"
  >("overview");

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/portal/login");
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      biology: "bg-green-100 text-green-800",
      chemistry: "bg-blue-100 text-blue-800",
      physics: "bg-purple-100 text-purple-800",
      mathematics: "bg-yellow-100 text-yellow-800",
      english: "bg-pink-100 text-pink-800",
    };
    return colors[subject] || "bg-gray-100 text-gray-800";
  };

  const getProgramColor = (program: string) => {
    const colors: Record<string, string> = {
      foundation: "bg-blue-100 text-blue-800",
      elevate: "bg-purple-100 text-purple-800",
      gcse: "bg-green-100 text-green-800",
      "a-level": "bg-red-100 text-red-800",
    };
    return colors[program] || "bg-gray-100 text-gray-800";
  };

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
              <span className="text-gray-600">Admin Portal</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                Main Site
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
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage students, materials, and assignments
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.students}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Active Students</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.materials}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Materials</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.assignments}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Assignments</h3>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/portal/admin/students/new"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-academy-primary transition-colors"
          >
            <UserPlus className="w-5 h-5 text-academy-primary" />
            <span className="font-medium text-gray-900">Add New Student</span>
          </Link>

          <Link
            href="/portal/admin/materials/upload"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-academy-primary transition-colors"
          >
            <Upload className="w-5 h-5 text-academy-primary" />
            <span className="font-medium text-gray-900">Upload Material</span>
          </Link>

          <Link
            href="/portal/admin/assignments/new"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-academy-primary transition-colors"
          >
            <Plus className="w-5 h-5 text-academy-primary" />
            <span className="font-medium text-gray-900">Create Assignment</span>
          </Link>

          <Link
            href="/portal/admin/messages/compose"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-academy-primary transition-colors"
          >
            <Mail className="w-5 h-5 text-academy-primary" />
            <span className="font-medium text-gray-900">Send Message</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                "overview",
                "students",
                "materials",
                "assignments",
                "messages",
              ].map((tab) => (
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
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Students */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Students
                  </h3>
                  <div className="space-y-3">
                    {recentStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getProgramColor(student.program_type)}`}
                        >
                          {student.program_type}
                        </span>
                      </div>
                    ))}
                    {recentStudents.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No students yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Materials */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Materials
                  </h3>
                  <div className="space-y-3">
                    {recentMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {material.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSubjectColor(material.subject)}`}
                            >
                              {material.subject}
                            </span>
                            <span className="text-xs text-gray-500">
                              {material.program_level}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/portal/admin/materials/${material.id}`}
                          className="text-sm text-academy-primary hover:text-academy-accent"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                    {recentMaterials.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No materials yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                  <Link
                    href="/portal/admin/students"
                    className="px-4 py-2 bg-academy-primary text-white rounded-lg hover:bg-academy-secondary transition-colors"
                  >
                    Manage Students
                  </Link>
                </div>
                <p className="text-gray-500">
                  Full student management available in dedicated page
                </p>
              </div>
            )}

            {activeTab === "materials" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search materials..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                  <Link
                    href="/portal/admin/materials"
                    className="px-4 py-2 bg-academy-primary text-white rounded-lg hover:bg-academy-secondary transition-colors"
                  >
                    Manage Materials
                  </Link>
                </div>
                <p className="text-gray-500">
                  Full material management available in dedicated page
                </p>
              </div>
            )}

            {activeTab === "assignments" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Assignment Management
                  </h3>
                  <Link
                    href="/portal/admin/assignments"
                    className="px-4 py-2 bg-academy-primary text-white rounded-lg hover:bg-academy-secondary transition-colors"
                  >
                    Manage Assignments
                  </Link>
                </div>
                <p className="text-gray-500">
                  Create and manage student assignments in the dedicated page
                </p>
              </div>
            )}

            {activeTab === "messages" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Message Center
                  </h3>
                  <div className="flex gap-3">
                    <Link
                      href="/portal/admin/messages/compose"
                      className="px-4 py-2 bg-academy-primary text-white rounded-lg hover:bg-academy-secondary transition-colors"
                    >
                      Compose Message
                    </Link>
                    <Link
                      href="/portal/admin/messages"
                      className="px-4 py-2 border border-academy-primary text-academy-primary rounded-lg hover:bg-academy-light transition-colors"
                    >
                      View All Messages
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Individual Messages
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Send personalized messages to individual students or
                      parents
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        Group Messages
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Send messages to entire programs or custom groups
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900">
                        Templates
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Use pre-made templates for common communications
                    </p>
                  </div>
                </div>

                {/* Resend Email Service */}
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-emerald-600" />
                      Resend Email Service
                    </h4>
                    <span className="text-xs text-gray-500">
                      Developer-Focused Email
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
                      <span className="text-sm font-medium">Docs</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                    </a>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    📧 Resend provides 100 emails/day free forever with
                    excellent deliverability and developer-friendly API.
                  </p>
                </div>

                <p className="text-gray-500 mt-4">
                  Communicate effectively with students and parents through the
                  messaging system
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
