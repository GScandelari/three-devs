"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Wordmark } from "@/components/ui/Wordmark";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true, icon: GridIcon },
  { href: "/admin/clients", label: "Clientes", icon: UsersIcon },
  { href: "/admin/projects", label: "Projetos", icon: FolderIcon },
  { href: "/admin/contracts", label: "Contratos", icon: FileIcon },
];

export function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { developer } = useAuth();
  // Menu do celular. Fecha ao escolher uma página.
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href || pathname === `${href}/`;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Barra do celular */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink-line bg-ink px-4 text-paper lg:hidden">
        <Link
          href="/admin"
          className="text-xl"
          aria-label="Serifa Labs, painel admin"
        >
          <Wordmark tone="dark" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-nav"
          className="grid h-10 w-10 place-items-center rounded-lg text-mist hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-signal-light"
        >
          <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <aside
        id="admin-nav"
        className={`${
          open ? "flex" : "hidden"
        } fixed inset-x-0 top-14 bottom-0 z-30 flex-col bg-ink text-paper lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0`}
      >
        <div className="hidden px-6 pt-7 pb-6 lg:block">
          <Link
            href="/admin"
            className="text-[1.6rem]"
            aria-label="Serifa Labs, painel admin"
          >
            <Wordmark tone="dark" />
          </Link>
          <p className="mt-2 font-mono text-[0.7rem] text-mist">painel admin</p>
        </div>

        <nav
          aria-label="Painel admin"
          className="flex-1 space-y-1 px-3 py-4 lg:py-2"
        >
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-mist hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-signal-light"
                  />
                )}
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-2xl bg-ink-soft p-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-signal text-xs font-semibold text-ink"
            >
              {initials(developer?.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {developer?.name}
              </p>
              <p className="truncate text-xs text-mist">{developer?.email}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/portal"
              className="rounded-lg bg-white/5 px-3 py-2 text-center text-xs font-medium text-paper transition-colors hover:bg-white/10"
            >
              Ver portal
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-paper transition-colors hover:bg-white/10"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-[18px] w-[18px] shrink-0",
};

function GridIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 20a6.5 6.5 0 0 0-3-5.5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
