import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentDashboard from "@/components/portal/StudentDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Get student data
  const { data: student } = await (supabase as any)
    .from("students")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Account Setup Required
          </h1>
          <p className="text-gray-600">
            Please contact your administrator to complete your account setup.
          </p>
        </div>
      </div>
    );
  }

  // Get assignments with materials
  const { data: assignments } = await (supabase as any)
    .from("student_assignments")
    .select(
      `
      *,
      material:materials(*)
    `,
    )
    .eq("student_id", (student as any).id)
    .order("assigned_date", { ascending: false });

  // Get dashboard stats
  const totalAssignments = assignments?.length || 0;
  const completedAssignments =
    assignments?.filter((a: any) => a.completed).length || 0;
  const pendingAssignments =
    assignments?.filter(
      (a: any) =>
        !a.completed && (!a.due_date || new Date(a.due_date) > new Date()),
    ).length || 0;

  return (
    <StudentDashboard
      student={student}
      assignments={assignments || []}
      stats={{
        total: totalAssignments,
        completed: completedAssignments,
        pending: pendingAssignments,
      }}
    />
  );
}
