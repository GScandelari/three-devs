"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllClients,
  getAllContracts,
  getAllProjects,
} from "@/lib/firebase/firestore";
import {
  projectStatusLabels,
  projectStatusColors,
} from "@/lib/labels";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    clients: 0,
    projects: 0,
    contracts: 0,
    pendingContracts: 0,
  });
  const [recentProjects, setRecentProjects] = useState<
    Awaited<ReturnType<typeof getAllProjects>>
  >([]);

  useEffect(() => {
    async function load() {
      const [clients, projects, contracts] = await Promise.all([
        getAllClients(),
        getAllProjects(),
        getAllContracts(),
      ]);

      setStats({
        clients: clients.length,
        projects: projects.length,
        contracts: contracts.length,
        pendingContracts: contracts.filter(
          (c) => c.status === "sent" || c.status === "draft",
        ).length,
      });
      setRecentProjects(projects.slice(0, 5));
    }
    load();
  }, []);

  const cards = [
    { label: "Clientes", value: stats.clients, href: "/admin/clients" },
    { label: "Projetos", value: stats.projects, href: "/admin/projects" },
    { label: "Contratos", value: stats.contracts, href: "/admin/contracts" },
    {
      label: "Contratos pendentes",
      value: stats.pendingContracts,
      href: "/admin/contracts",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Dashboard
      </h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Visão geral da operação Three Devs.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-slate-950/60"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Projetos recentes
          </h2>
          <Link
            href="/admin/projects"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Ver todos
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Nenhum projeto cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Projeto</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/project?id=${project.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusColors[project.status]}`}
                      >
                        {projectStatusLabels[project.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {project.leadDeveloperName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
