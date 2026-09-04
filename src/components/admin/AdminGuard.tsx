"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, developer, isDeveloper, loading, firebaseConfigured } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseConfigured) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isDeveloper) {
      router.replace("/portal");
      return;
    }
    if (developer?.mustChangePassword) {
      router.replace("/change-password");
    }
  }, [
    user,
    developer,
    isDeveloper,
    loading,
    firebaseConfigured,
    router,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    );
  }

  if (
    !firebaseConfigured ||
    !user ||
    !isDeveloper ||
    developer?.mustChangePassword
  ) {
    return null;
  }

  return <>{children}</>;
}
