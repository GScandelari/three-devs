"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

export function PortalHeader() {
  const { client } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/portal" className="text-lg font-semibold text-slate-900">
          Three<span className="text-indigo-600">Devs</span>
          <span className="ml-2 text-sm font-normal text-slate-400">Portal</span>
        </Link>

        <div className="flex items-center gap-4">
          {client?.name && (
            <span className="hidden text-sm text-slate-600 sm:block">
              {client.name}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
