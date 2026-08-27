"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
