"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProjectsByClientId,
  getContractsByClientId,
  getSignedProjectIds,
} from "@/lib/firebase/firestore";
import { needsClientSignature } from "@/lib/contracts/signature";
import { contractStatusColors, contractStatusLabels } from "@/lib/labels";
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

  const signedProjectIds = getSignedProjectIds(contracts);
  const contractHrefFor = (projectId: string) => {
    const linked = contracts.find(
      (c) => c.projectId === projectId && c.status !== "cancelled",
    );
    return linked ? `/portal/contract?id=${linked.id}` : undefined;
  };
  const pendingContract = contracts.find(needsClientSignature);

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

      {pendingContract && (
        <section className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
          <div>
            <h2 className="font-medium text-slate-900">
              Você tem um contrato para assinar
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {pendingContract.title}. Seus projetos são liberados assim que o
              contrato for assinado.
            </p>
          </div>
          <Link
            href={`/portal/contract?id=${pendingContract.id}`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Assinar agora
          </Link>
        </section>
      )}

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
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${contractStatusColors[contract.status]}`}
                >
                  {needsClientSignature(contract)
                    ? "Aguardando sua assinatura"
                    : contractStatusLabels[contract.status]}
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
              <ProjectCard
                key={project.id}
                project={project}
                locked={!signedProjectIds.has(project.id)}
                contractHref={contractHrefFor(project.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
