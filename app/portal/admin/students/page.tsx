import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StudentManagement from "@/components/portal/StudentManagement";
import { UserPlus } from "lucide-react";

export default async function ManageStudentsPage() {
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

  // Get all students with assignment counts
  const { data: students } = await (supabase as any)
    .from("students")
    .select(
      `
      *,
      student_assignments(count)
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 pt-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Students
                </h1>
                <p className="mt-2 text-gray-600">
                  View and manage all enrolled students
                </p>
              </div>
              <Link
                href="/portal/admin/students/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative z-20"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add New Student
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentManagement students={students || []} />

        <div className="mt-8">
          <Link
            href="/portal/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
