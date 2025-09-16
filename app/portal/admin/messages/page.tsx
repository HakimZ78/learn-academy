import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminMessaging from "@/components/portal/AdminMessaging";

export default async function MessagesPage() {
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

  // Get message statistics
  const { data: messages } = await supabase
    .from("admin_messages")
    .select("*")
    .order("created_at", { ascending: false });

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

  // Get message stats
  const { count: totalMessages } = await supabase
    .from("admin_messages")
    .select("*", { count: "exact", head: true });

  const { count: sentMessages } = await supabase
    .from("admin_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent");

  const { count: pendingMessages } = await supabase
    .from("admin_messages")
    .select("*", { count: "exact", head: true })
    .in("status", ["draft", "scheduled"]);

  return (
    <AdminMessaging
      messages={messages || []}
      templates={templates || []}
      students={students || []}
      stats={{
        total: totalMessages || 0,
        sent: sentMessages || 0,
        pending: pendingMessages || 0,
      }}
    />
  );
}
