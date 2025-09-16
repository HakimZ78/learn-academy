"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/portal/login");
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className="fixed top-20 right-4 z-40 flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
    >
      <LogOut className="w-4 h-4" />
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
