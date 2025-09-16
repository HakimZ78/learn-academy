import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/portal/AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Check if user is admin
  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (profile?.role !== "admin") {
    redirect("/portal/dashboard");
  }

  // Get stats
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("active", true);

  const { count: materialCount } = await supabase
    .from("materials")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: assignmentCount } = await supabase
    .from("student_assignments")
    .select("*", { count: "exact", head: true });

  // Get recent students
  const { data: recentStudents } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get recent materials
  const { data: recentMaterials } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <AdminDashboard
      stats={{
        students: studentCount || 0,
        materials: materialCount || 0,
        assignments: assignmentCount || 0,
      }}
      recentStudents={recentStudents || []}
      recentMaterials={recentMaterials || []}
    />
  );
}
