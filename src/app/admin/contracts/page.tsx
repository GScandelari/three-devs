"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContract,
  getAllClients,
  getAllContracts,
  getAllProjects,
  updateContractStatus,
} from "@/lib/firebase/firestore";
import { EMPTY_CONTRACT_TEMPLATE } from "@/lib/contracts/template";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  contractStatusLabels,
  contractStatusColors,
} from "@/lib/labels";
import type { Client, Contract, ContractStatus, Project } from "@/lib/types";

export default function AdminContractsPage() {
  const router = useRouter();
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

    void loadOnMount();
  }, []);

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));
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
        template: {
          ...EMPTY_CONTRACT_TEMPLATE,
          clientName: client?.name ?? "",
          clientEmail: client?.email ?? "",
          clientCompany: client?.company ?? "",
          projectName: project?.name ?? "",
          leadDeveloperName:
            project?.leadDeveloperName || developer?.name || "",
          servicesDescription:
            project?.description ||
            EMPTY_CONTRACT_TEMPLATE.servicesDescription,
        },
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
    await updateContractStatus(contractId, status);
    await loadData();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Contratos</h1>
          <p className="mt-1 text-slate-600">
            Preencha o template, envie ao cliente e controle a assinatura. Sem
            contrato assinado, o portal permanece bloqueado.
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
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
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
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
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

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Carregando...</p>
      ) : contracts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Nenhum contrato cadastrado.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Contrato</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Projeto</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
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
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/contract?id=${contract.id}`}
                        className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                      >
                        Preencher / ver
                      </Link>
                      {contract.status === "draft" && (
                        <ActionBtn
                          onClick={() =>
                            handleStatusChange(contract.id, "sent")
                          }
                        >
                          Enviar
                        </ActionBtn>
                      )}
                      {(contract.status === "draft" ||
                        contract.status === "sent") && (
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
          : "text-indigo-600 hover:bg-indigo-50"
      }`}
    >
      {children}
    </button>
  );
}
