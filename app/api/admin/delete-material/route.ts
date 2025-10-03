import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createServiceClient();

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
    const { materialId } = await request.json();

    if (!materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Use service client to bypass RLS and delete related records

    // Delete access logs
    const { error: logsError } = await adminClient
      .from("access_logs")
      .delete()
      .eq("material_id", materialId);

    if (logsError) {
      console.error("Error deleting access logs:", logsError);
    }

    // Delete student assignments
    const { error: assignmentsError } = await adminClient
      .from("student_assignments")
      .delete()
      .eq("material_id", materialId);

    if (assignmentsError) {
      console.error("Error deleting student assignments:", assignmentsError);
    }

    // Delete the material record
    const { error: materialError } = await adminClient
      .from("materials")
      .delete()
      .eq("id", materialId);

    if (materialError) {
      console.error("Error deleting material:", materialError);
      return NextResponse.json(
        { error: `Failed to delete material: ${materialError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error in delete-material API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
