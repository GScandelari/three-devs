"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getProjectsByClientId, getContractsByClientId } from "@/lib/firebase/firestore";
import { ProjectCard } from "@/components/portal/ProjectCard";
import type { Contract, Project } from "@/lib/types";

export default function PortalPage() {
  const { client } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    async function loadData() {
      const [projectData, contractData] = await Promise.all([
        getProjectsByClientId(client!.id),
        getContractsByClientId(client!.id),
      ]);
      setProjects(projectData);
      setContracts(contractData);
      setLoading(false);
    }

    loadData();
  }, [client]);

  if (loading) {
    return <p className="text-sm text-slate-500">Carregando projetos...</p>;
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-slate-900">
          Olá, {client?.name?.split(" ")[0] ?? "cliente"}
        </h1>
        <p className="mt-1 text-slate-600">
          Acompanhe seus projetos, contratos e atualizações.
        </p>
      </div>

      {contracts.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-400">
            Contratos
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {contracts.map((contract) => (
              <Link
                key={contract.id}
                href={`/portal/contract?id=${contract.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {contract.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {contract.signedAt
                      ? `Assinado em ${new Date(contract.signedAt).toLocaleDateString("pt-BR")}`
                      : contract.sentAt
                        ? `Enviado em ${new Date(contract.sentAt).toLocaleDateString("pt-BR")}`
                        : "Rascunho"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    contract.status === "signed"
                      ? "bg-emerald-100 text-emerald-800"
                      : contract.status === "sent"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {contract.status === "signed"
                    ? "Assinado"
                    : contract.status === "sent"
                      ? "Aguardando assinatura"
                      : contract.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-400">
          Projetos
        </h2>
        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">
              Nenhum projeto disponível ainda. Em breve a equipe irá adicionar
              seu projeto aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
