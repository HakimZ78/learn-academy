"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Home,
  LogOut,
  TrendingUp,
  User,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string | null;
  week_number: number | null;
  subject: string;
  program_level: string;
}

interface Assignment {
  id: string;
  material_id: string;
  assigned_date: string;
  due_date: string | null;
  access_start: string;
  access_end: string | null;
  viewed: boolean;
  completed: boolean;
  completed_date: string | null;
  material: Material;
}

interface StudentDashboardProps {
  student: {
    id: string;
    full_name: string;
    email: string;
    program_type: string;
  };
  assignments: Assignment[];
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
}

export default function StudentDashboard({
  student,
  assignments,
  stats,
}: StudentDashboardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/portal/login");
  };

  const currentAssignments = assignments.filter((a) => {
    const now = new Date();
    const accessStart = new Date(a.access_start);
    const accessEnd = a.access_end ? new Date(a.access_end) : null;
    return (
      accessStart <= now && (!accessEnd || accessEnd > now) && !a.completed
    );
  });

  const upcomingAssignments = assignments.filter((a) => {
    const now = new Date();
    const accessStart = new Date(a.access_start);
    return accessStart > now;
  });

  const completedAssignments = assignments.filter((a) => a.completed);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return days;
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
              <span className="text-gray-600">Student Portal</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {student.full_name}
                </span>
              </div>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {student.full_name.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            Program:{" "}
            <span className="font-medium capitalize">
              {student.program_type}
            </span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.total}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Materials</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Completed</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Pending</h3>
          </div>
        </div>

        {/* Current Assignments */}
        {currentAssignments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-academy-primary" />
              Current Assignments
            </h2>
            <div className="grid gap-4">
              {currentAssignments.map((assignment) => {
                const daysUntil = getDaysUntilDue(assignment.due_date);
                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(assignment.material.subject)}`}
                          >
                            {assignment.material.subject}
                          </span>
                          {assignment.material.week_number && (
                            <span className="text-sm text-gray-500">
                              Week {assignment.material.week_number}
                            </span>
                          )}
                          {!assignment.viewed && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {assignment.material.title}
                        </h3>
                        {assignment.material.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {assignment.material.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Assigned: {formatDate(assignment.assigned_date)}
                          </span>
                          {assignment.due_date && (
                            <span
                              className={`flex items-center gap-1 ${daysUntil && daysUntil <= 3 ? "text-red-600 font-medium" : ""}`}
                            >
                              <Clock className="w-4 h-4" />
                              Due: {formatDate(assignment.due_date)}
                              {daysUntil !== null &&
                                daysUntil >= 0 &&
                                ` (${daysUntil} days)`}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/portal/material/${assignment.material.id}`}
                        className="ml-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-academy-primary to-academy-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        View Material
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Upcoming Assignments */}
        {upcomingAssignments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Upcoming Materials
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(assignment.material.subject)}`}
                        >
                          {assignment.material.subject}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {assignment.material.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-500">
                        Available from: {formatDate(assignment.access_start)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Completed Assignments */}
        {completedAssignments.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Completed Materials
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {completedAssignments.slice(0, 5).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(assignment.material.subject)}`}
                          >
                            {assignment.material.subject}
                          </span>
                          <h4 className="font-medium text-gray-900">
                            {assignment.material.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-500">
                          Completed on:{" "}
                          {assignment.completed_date
                            ? formatDate(assignment.completed_date)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/portal/material/${assignment.material.id}`}
                      className="text-sm text-academy-primary hover:text-academy-accent transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {assignments.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Materials Assigned Yet
            </h3>
            <p className="text-gray-600">
              Your teacher will assign materials for you to review before your
              sessions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
