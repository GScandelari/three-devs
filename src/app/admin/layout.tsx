import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider>
        <AdminGuard>
          <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 md:flex-row">
            <AdminSidebar />
            <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-8">{children}</main>
          </div>
        </AdminGuard>
      </ThemeProvider>
    </>
  );
}
