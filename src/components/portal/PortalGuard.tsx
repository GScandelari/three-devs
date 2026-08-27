"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function PortalGuard({ children }: { children: React.ReactNode }) {
  const { user, hasPortalAccess, loading, firebaseConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!firebaseConfigured) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!hasPortalAccess) {
      router.replace("/login?pending=contract");
    }
  }, [user, hasPortalAccess, loading, firebaseConfigured, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    );
  }

  if (!firebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h2 className="font-semibold text-amber-900">Firebase não configurado</h2>
          <p className="mt-2 text-sm text-amber-800">
            Configure as variáveis de ambiente do Firebase para habilitar o portal.
          </p>
        </div>
      </div>
    );
  }

  if (!user || !hasPortalAccess) {
    return null;
  }

  return <>{children}</>;
}
