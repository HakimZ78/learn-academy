import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MaterialViewer from "@/components/portal/MaterialViewer";

export default async function MaterialPage({
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

  // Get student info
  const { data: student } = await (supabase as any)
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    redirect("/portal/dashboard");
  }

  // Check if student has access to this material
  const { data: assignment } = await (supabase as any)
    .from("student_assignments")
    .select(
      `
      *,
      material:materials(*)
    `,
    )
    .eq("student_id", (student as any).id)
    .eq("material_id", id)
    .single();

  if (!assignment || !assignment.material) {
    redirect("/portal/dashboard");
  }

  // Check access dates
  const now = new Date();
  const accessStart = new Date(assignment.access_start);
  const accessEnd = assignment.access_end
    ? new Date(assignment.access_end)
    : null;

  if (accessStart > now || (accessEnd && accessEnd < now)) {
    redirect("/portal/dashboard");
  }

  // Track view
  await (supabase as any).rpc("track_material_view", {
    p_student_id: student.id,
    p_material_id: id,
  });

  return (
    <MaterialViewer
      material={assignment.material}
      assignment={assignment}
      studentId={student.id}
    />
  );
}
