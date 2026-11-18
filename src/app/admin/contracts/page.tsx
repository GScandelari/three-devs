"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createContract,
  getAllClients,
  getAllContracts,
  getAllProjects,
  updateContractStatus,
} from "@/lib/firebase/firestore";
import {
  EMPTY_CONTRACT_TEMPLATE,
  applySystemFields,
} from "@/lib/contracts/template";
import {
  canMarkSigned,
  getAdminNextStep,
  hasSignatureToReview,
} from "@/lib/contracts/signature";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  contractStatusLabels,
  contractStatusColors,
} from "@/lib/labels";
import type { Client, Contract, ContractStatus, Project } from "@/lib/types";

type ContractFilter = "all" | "pending" | ContractStatus;

const FILTERS: { value: ContractFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "draft", label: "Rascunho" },
  { value: "sent", label: "Enviados" },
  { value: "signed", label: "Assinados" },
  { value: "cancelled", label: "Cancelados" },
];

const nextStepColors = {
  action: "text-indigo-700 font-medium",
  waiting: "text-slate-600",
  done: "text-slate-400",
};

function AdminContractsContent() {
  const router = useRouter();
  const initialFilter = useSearchParams().get("status");
  const [filter, setFilter] = useState<ContractFilter>(
    FILTERS.some((f) => f.value === initialFilter)
      ? (initialFilter as ContractFilter)
      : "all",
  );
  const [query, setQuery] = useState("");
  const { developer } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    projectId: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  async function loadData() {
    const [c, cl, p] = await Promise.all([
      getAllContracts(),
      getAllClients(),
      getAllProjects(),
    ]);
    setContracts(c);
    setClients(cl);
    setProjects(p);
    setLoading(false);
  }

  useEffect(() => {
    async function loadOnMount() {
      try {
        const [c, cl, p] = await Promise.all([
          getAllContracts(),
          getAllClients(),
          getAllProjects(),
        ]);
        setContracts(c);
        setClients(cl);
        setProjects(p);
      } catch (caught) {
        console.error("Erro ao carregar contratos:", caught);
        setStatusError("Não foi possível carregar os contratos. Atualize a página.");
      } finally {
        setLoading(false);
      }
    }

    void loadOnMount();
  }, []);

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const visibleContracts = contracts.filter((c) => {
    if (filter === "pending") {
      if (c.status !== "draft" && c.status !== "sent") return false;
    } else if (filter !== "all" && c.status !== filter) return false;
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return [c.title, clientMap[c.clientId], projectMap[c.projectId]]
      .filter(Boolean)
      .some((text) => text.toLowerCase().includes(term));
  });
  const clientProjects = projects.filter((p) => p.clientId === form.clientId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const client = clients.find((c) => c.id === form.clientId);
      const project = projects.find((p) => p.id === form.projectId);

      const id = await createContract({
        clientId: form.clientId,
        projectId: form.projectId,
        // leadDeveloperName vazio: applySystemFields grava quem está criando.
        template: applySystemFields(
          {
            ...EMPTY_CONTRACT_TEMPLATE,
            clientName: client?.name ?? "",
            clientDocument: client?.document ?? "",
            clientEmail: client?.email ?? "",
            clientCompany: client?.company ?? "",
            projectName: project?.name ?? "",
            servicesDescription:
              project?.description ||
              EMPTY_CONTRACT_TEMPLATE.servicesDescription,
          },
          developer?.name ?? "",
        ),
      });

      setShowForm(false);
      setForm({ clientId: "", projectId: "" });
      router.push(`/admin/contract?id=${id}`);
    } catch {
      setError("Erro ao criar contrato.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(contractId: string, status: ContractStatus) {
    setStatusError("");

    try {
      await updateContractStatus(contractId, status);
    } catch (err) {
      console.error("Erro ao atualizar status do contrato:", err);
      setStatusError("Não foi possível atualizar o status do contrato.");
      return;
    }

    try {
      await loadData();
    } catch (err) {
      console.error("Erro ao recarregar contratos:", err);
      setStatusError(
        "O status foi atualizado, mas não foi possível recarregar a lista. Atualize a página.",
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Contratos</h1>
          <p className="mt-1 text-slate-600">
            Preencha o template e envie ao cliente. Ele assina pelo gov.br e
            envia o PDF pelo portal; a equipe confere, contra-assina e marca o
            contrato como assinado, o que libera o projeto no portal.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Novo contrato"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h2 className="font-medium text-slate-900">Criar contrato</h2>
          <p className="mt-1 text-sm text-slate-500">
            Após criar, você será direcionado para preencher o template completo.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Cliente
              </label>
              <select
                required
                value={form.clientId}
                onChange={(e) =>
                  setForm({ ...form, clientId: e.target.value, projectId: "" })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-signal"
              >
                <option value="">Selecione...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Projeto
              </label>
              <select
                required
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-signal"
              >
                <option value="">Selecione...</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving} className="mt-4">
            {saving ? "Criando..." : "Criar e preencher template"}
          </Button>
        </form>
      )}

      {statusError && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {statusError}
        </p>
      )}

      {!loading && contracts.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Filtrar por status" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar contrato, cliente ou projeto"
            aria-label="Buscar contratos"
            className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Carregando...</p>
      ) : contracts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Nenhum contrato cadastrado.
        </div>
      ) : visibleContracts.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Nenhum contrato corresponde aos filtros.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Contrato</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Projeto</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Próximo passo</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleContracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {contract.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {clientMap[contract.clientId] ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {projectMap[contract.projectId] ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${contractStatusColors[contract.status]}`}
                    >
                      {contractStatusLabels[contract.status]}
                    </span>
                    {hasSignatureToReview(contract) && (
                      <span className="ml-2 rounded-full bg-signal-soft px-2 py-0.5 text-xs font-medium text-signal-deep">
                        Assinatura recebida
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 ${nextStepColors[getAdminNextStep(contract).tone]}`}
                  >
                    {getAdminNextStep(contract).label}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/contract?id=${contract.id}`}
                        className="rounded-md px-2 py-1 text-xs font-medium text-signal-deep hover:bg-signal-soft/60"
                      >
                        {contract.status === "draft" ? "Preencher / enviar" : "Ver contrato"}
                      </Link>
                      {/* Só com o PDF final anexado (seção Assinatura do contrato). */}
                      {canMarkSigned(contract) && (
                        <ActionBtn
                          onClick={() =>
                            handleStatusChange(contract.id, "signed")
                          }
                        >
                          Marcar assinado
                        </ActionBtn>
                      )}
                      {contract.status !== "cancelled" && (
                        <ActionBtn
                          variant="danger"
                          onClick={() =>
                            handleStatusChange(contract.id, "cancelled")
                          }
                        >
                          Cancelar
                        </ActionBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminContractsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Carregando...</p>}>
      <AdminContractsContent />
    </Suspense>
  );
}

function ActionBtn({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        variant === "danger"
          ? "text-red-600 hover:bg-red-50"
          : "text-signal-deep hover:bg-signal-soft/60"
      }`}
    >
      {children}
    </button>
  );
}
