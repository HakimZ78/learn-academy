import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ComposeMessage from "@/components/portal/ComposeMessage";

export const dynamic = 'force-dynamic';

export default async function ComposeMessagePage() {
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

  // Get message templates
  const { data: templates } = await supabase
    .from("message_templates")
    .select("*")
    .eq("active", true)
    .order("name");

  // Get all students for recipient selection
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("active", true)
    .order("full_name");

  return (
    <ComposeMessage templates={templates || []} students={students || []} />
  );
}
