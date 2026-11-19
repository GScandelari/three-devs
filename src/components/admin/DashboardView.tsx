"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  contractStatusColors,
  contractStatusLabels,
  projectStatusLabels,
  projectStatusColors,
} from "@/lib/labels";
import { hasSignatureToReview } from "@/lib/contracts/signature";
import { initials } from "@/components/admin/AdminSidebar";
import type { Client, Contract, Project } from "@/lib/types";

export type DashboardData = {
  clients: Client[];
  projects: Project[];
  contracts: Contract[];
};

// A saudação depende do relógio do navegador: no build (servidor) fica neutra.
const subscribeNoop = () => () => {};
function greetingNow() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
function todayLabel() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function DashboardView({
  data,
  failed,
  developerName,
}: {
  data: DashboardData | null;
  failed: boolean;
  developerName?: string;
}) {
  const greeting = useSyncExternalStore(
    subscribeNoop,
    greetingNow,
    () => "Olá",
  );
  const today = useSyncExternalStore(subscribeNoop, todayLabel, () => "");

  const pendingContracts =
    data?.contracts.filter(
      (c) => c.status === "sent" || c.status === "draft",
    ) ?? [];
  const toReview = pendingContracts.filter(hasSignatureToReview).length;
  const activeProjects =
    data?.projects.filter(
      (p) => p.status !== "delivered" && p.status !== "paused",
    ).length ?? 0;
  const clientName = new Map(data?.clients.map((c) => [c.id, c.name]) ?? []);
  const firstName = developerName?.split(" ")[0];

  const cards = [
    {
      label: "Clientes",
      value: data?.clients.length,
      hint: "cadastrados no portal",
      href: "/admin/clients",
      icon: UsersIcon,
    },
    {
      label: "Projetos",
      value: data?.projects.length,
      hint: `${activeProjects} em andamento`,
      href: "/admin/projects",
      icon: FolderIcon,
    },
    {
      label: "Contratos",
      value: data?.contracts.length,
      hint: "no total",
      href: "/admin/contracts",
      icon: FileIcon,
    },
    {
      label: "Contratos pendentes",
      value: pendingContracts.length,
      hint:
        toReview > 0
          ? `${toReview} com assinatura para conferir`
          : "rascunhos e enviados",
      href: "/admin/contracts?status=pending",
      icon: ClockIcon,
      attention: pendingContracts.length > 0,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="min-h-4 font-mono text-xs text-muted first-letter:uppercase">
            {today}
          </p>
          <h1 className="mt-2 text-[2.4rem] font-semibold leading-tight tracking-[-0.04em]">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-muted">
            Visão geral da operação Serifa Labs.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/projects"
            className="rounded-xl border border-[#dedbd2] bg-white px-4 py-2.5 text-sm font-medium text-graphite transition-colors hover:border-signal/40 hover:text-signal-deep"
          >
            Projetos
          </Link>
          <Link
            href="/admin/contracts"
            className="rounded-xl bg-signal px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-signal-hover"
          >
            Contratos
          </Link>
        </div>
      </header>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          Não foi possível carregar os dados agora. Recarregue a página para
          tentar de novo.
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const attention = data && card.attention;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`group rounded-2xl border bg-white p-4 sm:p-5 transition-[border-color,box-shadow] duration-200 hover:shadow-[0_12px_32px_-18px_rgba(23,19,59,0.35)] ${
                attention
                  ? "border-amber-300 hover:border-amber-400"
                  : "border-[#e6e3db] hover:border-signal/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${
                    attention
                      ? "bg-amber-100 text-amber-800"
                      : "bg-signal-soft text-signal-deep"
                  }`}
                >
                  <Icon />
                </span>
                <span
                  aria-hidden="true"
                  className="text-muted/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-signal-deep"
                >
                  →
                </span>
              </div>
              <p className="mt-4 text-sm text-muted sm:mt-5">{card.label}</p>
              {data ? (
                <p className="mt-1 text-[2rem] leading-none font-semibold tabular-nums tracking-tight text-ink">
                  {card.value}
                </p>
              ) : (
                <span className="mt-2 block h-8 w-14 animate-pulse rounded-lg bg-paper-deep" />
              )}
              <p className="mt-2 min-h-4 text-xs text-muted">
                {data ? card.hint : ""}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <SectionTitle title="Projetos recentes" href="/admin/projects" />
          <div className="overflow-hidden rounded-2xl border border-[#e6e3db] bg-white">
            {!data ? (
              <RowsSkeleton />
            ) : data.projects.length === 0 ? (
              <Empty text="Nenhum projeto cadastrado ainda." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="border-b border-[#efece5] text-left text-xs text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium">Projeto</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projects.slice(0, 6).map((project) => (
                      <tr
                        key={project.id}
                        className="border-b border-[#f5f3ee] transition-colors last:border-0 hover:bg-paper"
                      >
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/admin/project?id=${project.id}`}
                            className="font-medium text-ink hover:text-signal-deep"
                          >
                            {project.name}
                          </Link>
                          {clientName.get(project.clientId) && (
                            <p className="mt-0.5 text-xs text-muted">
                              {clientName.get(project.clientId)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${projectStatusColors[project.status]}`}
                          >
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
                            />
                            {projectStatusLabels[project.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-2 text-graphite">
                            <span
                              aria-hidden="true"
                              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[0.65rem] font-semibold text-paper"
                            >
                              {initials(project.leadDeveloperName)}
                            </span>
                            {project.leadDeveloperName}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section>
          <SectionTitle title="Contratos pendentes" href="/admin/contracts" />
          <div className="rounded-2xl border border-[#e6e3db] bg-white">
            {!data ? (
              <RowsSkeleton />
            ) : pendingContracts.length === 0 ? (
              <Empty text="Nenhum contrato pendente. Tudo assinado." />
            ) : (
              <ul className="divide-y divide-[#f5f3ee]">
                {pendingContracts.slice(0, 5).map((contract) => {
                  const review = hasSignatureToReview(contract);
                  return (
                    <li key={contract.id}>
                      <Link
                        href={`/admin/contract?id=${contract.id}`}
                        className="flex items-start justify-between gap-3 px-5 py-4 transition-colors hover:bg-paper"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">
                            {contract.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {clientName.get(contract.clientId) ?? "Cliente"}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            review
                              ? "bg-signal-soft text-signal-deep"
                              : contractStatusColors[contract.status]
                          }`}
                        >
                          {review
                            ? "Conferir assinatura"
                            : contractStatusLabels[contract.status]}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xl font-semibold tracking-[-0.02em]">{title}</h2>
      <Link
        href={href}
        className="text-sm font-medium text-signal-deep hover:text-ink"
      >
        Ver todos
      </Link>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="p-8 text-center text-sm text-muted">{text}</p>;
}

function RowsSkeleton() {
  return (
    <div className="space-y-3 p-5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="block h-9 animate-pulse rounded-lg bg-paper" />
      ))}
    </div>
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
  className: "h-5 w-5",
};

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

function ClockIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
