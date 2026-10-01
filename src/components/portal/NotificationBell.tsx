"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteNotifications,
  getNotificationsByClientId,
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
  const [clearing, setClearing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Avisos já excluídos nesta tela: uma consulta iniciada antes da exclusão não
  // pode trazê-los de volta.
  const deletedIds = useRef(new Set<string>());

  // Recarrega ao entrar no portal, ao trocar de página e ao abrir a lista.
  useEffect(() => {
    if (!clientId) return;
    const id = clientId;
    let cancelled = false;

    async function load() {
      try {
        const data = await getNotificationsByClientId(id);
        if (cancelled) return;
        setNotifications(data.filter((n) => !deletedIds.current.has(n.id)));
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

  // Todo aviso na lista ainda não foi visualizado: ao ser clicado, é excluído.
  const count = notifications?.length ?? 0;
  const visible = (notifications ?? []).slice(0, MAX_VISIBLE);

  // Mensagem exibida no lugar da lista: erro, carregando ou nenhum aviso.
  let statusMessage: ReactNode = null;
  if (loadError) {
    statusMessage = (
      <p role="alert" className="px-4 py-6 text-sm text-red-600">
        Não foi possível carregar os avisos.
      </p>
    );
  } else if (notifications === null) {
    statusMessage = (
      <p className="px-4 py-6 text-sm text-slate-500">Carregando...</p>
    );
  } else if (visible.length === 0) {
    statusMessage = (
      <p className="px-4 py-6 text-sm text-slate-500">Nenhum aviso novo.</p>
    );
  }

  function handleToggle() {
    if (!open) {
      setActionError("");
      setReloadKey((k) => k + 1);
    }
    setOpen(!open);
  }

  // Exclui no servidor e já tira da tela. Se falhar, os avisos voltam a poder
  // aparecer e a lista é recarregada com o estado real.
  async function removeNotifications(ids: string[]) {
    ids.forEach((id) => deletedIds.current.add(id));
    setNotifications((prev) => prev?.filter((n) => !ids.includes(n.id)) ?? prev);

    try {
      await deleteNotifications(ids);
    } catch (err) {
      ids.forEach((id) => deletedIds.current.delete(id));
      setReloadKey((k) => k + 1);
      throw err;
    }
  }

  async function handleOpenNotification(notification: ClientNotification) {
    setOpen(false);
    router.push(notificationHref(notification));

    try {
      await removeNotifications([notification.id]);
    } catch (err) {
      console.error("Erro ao excluir aviso visualizado:", err);
    }
  }

  async function handleClearAll() {
    if (clearing || count === 0) return;
    setActionError("");
    setClearing(true);

    try {
      await removeNotifications((notifications ?? []).map((n) => n.id));
    } catch (err) {
      console.error("Erro ao limpar avisos:", err);
      setActionError("Não foi possível limpar os avisos.");
    } finally {
      setClearing(false);
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
        aria-label={count > 0 ? `Avisos: ${count} novos` : "Avisos"}
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
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-medium text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-medium uppercase tracking-wider text-slate-400">
            Avisos
          </h2>

          {statusMessage ?? (
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
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-900">
                        {notification.title}
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

          {count > 0 && !loadError && (
            <div className="border-t border-slate-100 px-4 py-2">
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearing}
                className="text-sm text-indigo-600 transition-colors hover:text-indigo-500 disabled:cursor-not-allowed disabled:text-indigo-300"
              >
                {clearing ? "Limpando..." : "Limpar avisos"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
