"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/projects", label: "Projetos" },
  { href: "/admin/contracts", label: "Contratos" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { developer } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <Link href="/admin" className="text-lg font-semibold text-slate-900">
          Three<span className="text-indigo-600">Devs</span>
        </Link>
        <p className="mt-1 text-xs text-slate-400">Painel admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(item.href, item.exact)
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        <p className="truncate text-sm font-medium text-slate-900">
          {developer?.name}
        </p>
        <p className="truncate text-xs text-slate-400">{developer?.email}</p>
        <div className="mt-3 flex gap-3">
          <Link
            href="/portal"
            className="text-xs text-indigo-600 hover:text-indigo-500"
          >
            Ver portal
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
