import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  Eye,
  Download,
} from "lucide-react";
import type { Database, MaterialWithAssignments } from "@/types/database";

type Material = Database["public"]["Tables"]["materials"]["Row"];
type AssignmentWithStudent =
  Database["public"]["Tables"]["student_assignments"]["Row"] & {
    student: {
      full_name: string;
      email: string;
      program_type: string;
    } | null;
  };

export default async function AdminMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Check if user is admin
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as any)?.role !== "admin") {
    redirect("/portal/dashboard");
  }

  // Get material details
  const { data: material } = await (supabase as any)
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  const typedMaterial = material as Material | null;

  if (!typedMaterial) {
    redirect("/portal/admin");
  }

  // Get assignments for this material
  const { data: assignments } = await (supabase as any)
    .from("student_assignments")
    .select(
      `
      *,
      student:students(full_name, email, program_type)
    `,
    )
    .eq("material_id", id)
    .order("assigned_date", { ascending: false });

  const typedAssignments = assignments as AssignmentWithStudent[] | null;

  // Get view stats
  const { count: totalViews } = await (supabase as any)
    .from("access_logs")
    .select("*", { count: "exact", head: true })
    .eq("material_id", id)
    .eq("action", "view");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <Link
                href="/portal/admin"
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {typedMaterial.title}
                </h1>
                <p className="mt-2 text-gray-600">
                  Material Details & Analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Material Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Material Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Material Information</h2>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typedMaterial.title}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Subject</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {typedMaterial.subject}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Program Level
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {typedMaterial.program_level}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Week Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typedMaterial.week_number || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(typedMaterial.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        typedMaterial.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {typedMaterial.is_active ? "Active" : "Inactive"}
                    </span>
                  </dd>
                </div>
              </dl>

              {typedMaterial.description && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typedMaterial.description}
                  </dd>
                </div>
              )}
            </div>

            {/* Material Content Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Content Preview
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      typedMaterial.content_html ||
                      "<p>No content preview available</p>",
                  }}
                />
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">To test student view:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Create student login credentials in Supabase</li>
                    <li>Assign this material to the student</li>
                    <li>Login as the student to see copy-protected view</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Assignments */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Analytics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Views</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {totalViews || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students Assigned</span>
                  <span className="text-2xl font-bold text-green-600">
                    {assignments?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {typedAssignments?.filter((a) => a.completed).length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Students */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Assigned Students
              </h3>

              <div className="space-y-3 max-h-64 overflow-auto">
                {typedAssignments?.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {assignment.student?.full_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {assignment.student?.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-semibold ${
                          assignment.completed
                            ? "text-green-600"
                            : assignment.viewed
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {assignment.completed
                          ? "Completed"
                          : assignment.viewed
                            ? "Viewed"
                            : "Not Started"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due:{" "}
                        {assignment.due_date
                          ? new Date(assignment.due_date).toLocaleDateString()
                          : "No due date"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(!assignments || assignments.length === 0) && (
                <div className="text-center text-gray-500 py-4">
                  No students assigned yet
                </div>
              )}

              <div className="mt-4">
                <Link
                  href={`/portal/admin/assignments/new?material=${typedMaterial.id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Assign to Students
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
