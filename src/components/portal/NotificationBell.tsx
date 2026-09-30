"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotificationsByClientId,
  markNotificationsRead,
} from "@/lib/firebase/firestore";
import type { ClientNotification } from "@/lib/types";

const MAX_VISIBLE = 20;

function notificationHref(notification: ClientNotification): string {
  if (notification.projectId) {
    return `/portal/project?id=${encodeURIComponent(notification.projectId)}`;
  }
  if (notification.contractId) {
    return `/portal/contract?id=${encodeURIComponent(notification.contractId)}`;
  }
  return "/portal";
}

export function NotificationBell() {
  const { client } = useAuth();
  const clientId = client?.id;
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<
    ClientNotification[] | null
  >(null);
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState("");
  const [marking, setMarking] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Recarrega ao entrar no portal, ao trocar de página e ao abrir a lista.
  useEffect(() => {
    if (!clientId) return;
    const id = clientId;
    let cancelled = false;

    async function load() {
      try {
        const data = await getNotificationsByClientId(id);
        if (cancelled) return;
        setNotifications(data);
        setLoadError(false);
      } catch (err) {
        console.error("Erro ao carregar avisos:", err);
        if (!cancelled) setLoadError(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [clientId, pathname, reloadKey]);

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Desenvolvedores em "Ver portal" não têm registro de cliente.
  if (!clientId) return null;

  const unreadIds = (notifications ?? [])
    .filter((n) => !n.readAt)
    .map((n) => n.id);
  const unreadCount = unreadIds.length;
  const visible = (notifications ?? []).slice(0, MAX_VISIBLE);

  function handleToggle() {
    if (!open) {
      setActionError("");
      setReloadKey((k) => k + 1);
    }
    setOpen(!open);
  }

  async function handleOpenNotification(notification: ClientNotification) {
    setOpen(false);
    router.push(notificationHref(notification));
    if (notification.readAt) return;

    const readAt = new Date().toISOString();
    setNotifications(
      (prev) =>
        prev?.map((n) => (n.id === notification.id ? { ...n, readAt } : n)) ??
        prev,
    );

    try {
      await markNotificationsRead([notification.id]);
    } catch (err) {
      console.error("Erro ao marcar aviso como lido:", err);
      // Volta ao estado real do servidor: o aviso continua como não lido.
      setReloadKey((k) => k + 1);
    }
  }

  async function handleMarkAllRead() {
    if (marking || unreadCount === 0) return;
    setActionError("");
    setMarking(true);

    try {
      await markNotificationsRead(unreadIds);
    } catch (err) {
      console.error("Erro ao marcar avisos como lidos:", err);
      setActionError("Não foi possível marcar os avisos como lidos.");
    } finally {
      setMarking(false);
      setReloadKey((k) => k + 1);
    }
  }

  return (
    // Sem "relative" aqui de propósito: o painel usa como referência o grupo da
    // direita do PortalHeader. Alinhado ao sininho, ele sairia da tela no celular.
    <div ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={
          unreadCount > 0 ? `Avisos: ${unreadCount} não lidos` : "Avisos"
        }
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-medium uppercase tracking-wider text-slate-400">
            Avisos
          </h2>

          {loadError ? (
            <p role="alert" className="px-4 py-6 text-sm text-red-600">
              Não foi possível carregar os avisos.
            </p>
          ) : notifications === null ? (
            <p className="px-4 py-6 text-sm text-slate-500">Carregando...</p>
          ) : visible.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              Nenhum aviso ainda.
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {visible.map((notification) => (
                <li
                  key={notification.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => handleOpenNotification(notification)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.readAt ? "bg-transparent" : "bg-indigo-600"
                      }`}
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-sm ${
                          notification.readAt
                            ? "text-slate-500"
                            : "font-medium text-slate-900"
                        }`}
                      >
                        {notification.title}
                        {!notification.readAt && (
                          <span className="sr-only"> (não lido)</span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {actionError && (
            <p role="alert" className="px-4 pb-2 text-sm text-red-600">
              {actionError}
            </p>
          )}

          {unreadCount > 0 && !loadError && (
            <div className="border-t border-slate-100 px-4 py-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={marking}
                className="text-sm text-indigo-600 transition-colors hover:text-indigo-500 disabled:cursor-not-allowed disabled:text-indigo-300"
              >
                {marking ? "Marcando..." : "Marcar todos como lidos"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
