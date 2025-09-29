import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if ((profile as any)?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the request body
    const { studentId, userId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Delete student assignments
    const { error: assignmentsError } = await supabase
      .from("student_assignments")
      .delete()
      .eq("student_id", studentId);

    if (assignmentsError) {
      console.error("Error deleting student assignments:", assignmentsError);
    }

    // Delete student materials
    const { error: materialsError } = await supabase
      .from("student_materials")
      .delete()
      .eq("student_id", studentId);

    if (materialsError) {
      console.error("Error deleting student materials:", materialsError);
    }

    // Delete the student record
    const { error: studentError } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (studentError) {
      console.error("Error deleting student:", studentError);
      return NextResponse.json(
        { error: "Failed to delete student" },
        { status: 500 }
      );
    }

    // Delete auth user if userId is provided
    if (userId) {
      // Use admin API to delete the user from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        userId
      );

      if (authError) {
        console.error("Error deleting auth user:", authError);
        return NextResponse.json(
          {
            success: true,
            warning: "Student deleted but auth user could not be removed",
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in delete-student API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}