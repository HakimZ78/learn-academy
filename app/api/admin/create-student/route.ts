import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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
    const {
      fullName,
      email,
      programType,
      dateOfBirth,
      parentName,
      parentEmail,
      notes,
      createLogin,
      password,
    } = await request.json();

    // Validate required fields
    if (!fullName || !email || !programType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let userId = null;

    // Create auth user if requested
    if (createLogin) {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required to create login" },
          { status: 400 }
        );
      }

      // Use admin API to create the user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: fullName,
          },
        });

      if (authError) {
        console.error("Auth error:", authError);
        return NextResponse.json(
          { error: `Failed to create login: ${authError.message}` },
          { status: 400 }
        );
      }

      userId = authData.user?.id;

      // Create profile for the new user
      if (userId) {
        const { error: profileError } = await (supabase as any)
          .from("profiles")
          .insert({
            id: userId,
            role: "student",
            full_name: fullName,
          });

        if (profileError) {
          console.error("Profile error:", profileError);
          // Continue even if profile creation fails
        }
      }
    }

    // Create student record
    const { data: studentData, error: studentError } = await (supabase as any)
      .from("students")
      .insert({
        user_id: userId,
        email: email,
        full_name: fullName,
        program_type: programType,
        date_of_birth: dateOfBirth || null,
        parent_name: parentName || null,
        parent_email: parentEmail || null,
        notes: notes || null,
        active: true,
      })
      .select()
      .single();

    if (studentError) {
      console.error("Student error:", studentError);

      // If we created an auth user but student failed, try to clean up
      if (userId) {
        await supabase.auth.admin.deleteUser(userId);
      }

      return NextResponse.json(
        { error: `Failed to create student: ${studentError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created student: ${fullName}`,
      student: studentData,
    });
  } catch (error: any) {
    console.error("Error in create-student API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}