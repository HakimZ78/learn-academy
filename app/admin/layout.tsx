"use client";

import { AdminProvider } from "@/contexts/AdminContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <div className="admin-layout">
        <style jsx global>{`
          .admin-layout nav[class*="fixed top-0"] {
            display: none !important;
          }
        `}</style>
        {children}
      </div>
    </AdminProvider>
  );
}
