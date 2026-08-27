"use client";

import { PortalGuard } from "@/components/portal/PortalGuard";
import { PortalHeader } from "@/components/portal/PortalHeader";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalGuard>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </div>
    </PortalGuard>
  );
}
