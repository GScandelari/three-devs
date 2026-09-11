"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAllClients,
  getAllProjects,
  getContractById,
  updateContractStatus,
  updateContractTemplate,
} from "@/lib/firebase/firestore";
import { EMPTY_CONTRACT_TEMPLATE } from "@/lib/contracts/template";
import { ContractTemplateForm } from "@/components/contracts/ContractTemplateForm";
import { ContractDocument } from "@/components/contracts/ContractDocument";
import { Button } from "@/components/ui/Button";
import {
  contractStatusColors,
  contractStatusLabels,
} from "@/lib/labels";
import type {
  Client,
  Contract,
  ContractStatus,
  ContractTemplateData,
  Project,
} from "@/lib/types";

function ContractEditorContent() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("id");
  const router = useRouter();

  const [contract, setContract] = useState<Contract | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [template, setTemplate] = useState<ContractTemplateData>(
    EMPTY_CONTRACT_TEMPLATE,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState<"form" | "preview">("form");

  useEffect(() => {
    if (!contractId) return;
    const id = contractId;

    async function load() {
      const [c, cl, p] = await Promise.all([
        getContractById(id),
        getAllClients(),
        getAllProjects(),
      ]);
      setContract(c);
      setClients(cl);
      setProjects(p);
      if (c?.template) {
        setTemplate({ ...EMPTY_CONTRACT_TEMPLATE, ...c.template });
      }
      setLoading(false);
    }

    void load();
  }, [contractId]);

  const clientName = useMemo(
    () => clients.find((c) => c.id === contract?.clientId)?.name,
    [clients, contract],
  );
  const projectName = useMemo(
    () => projects.find((p) => p.id === contract?.projectId)?.name,
    [projects, contract],
  );

  if (!contractId) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Contrato não informado.{" "}
        <Link href="/admin/contracts" className="text-indigo-600 dark:text-indigo-400">
          Voltar
        </Link>
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Carregando contrato...</p>;
  }

  if (!contract) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Contrato não encontrado.{" "}
        <Link href="/admin/contracts" className="text-indigo-600 dark:text-indigo-400">
          Voltar
        </Link>
      </p>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await updateContractTemplate(contractId!, template);
      setSuccess("Template do contrato salvo.");
      const refreshed = await getContractById(contractId!);
      setContract(refreshed);
    } catch {
      setError("Não foi possível salvar o template.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(status: ContractStatus) {
    await updateContractStatus(contractId!, status);
    const refreshed = await getContractById(contractId!);
    setContract(refreshed);
  }

  return (
    <div>
      <Link
        href="/admin/contracts"
        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        ← Voltar aos contratos
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {contract.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {clientName ?? "Cliente"} · {projectName ?? "Projeto"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${contractStatusColors[contract.status]}`}
        >
          {contractStatusLabels[contract.status]}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {contract.status === "draft" && (
          <Button type="button" onClick={() => handleStatus("sent")}>
            Marcar como enviado
          </Button>
        )}
        {(contract.status === "draft" || contract.status === "sent") && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleStatus("signed")}
          >
            Marcar assinado
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/contracts")}
        >
          Lista de contratos
        </Button>
      </div>

      <div className="mt-8 flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <TabButton active={tab === "form"} onClick={() => setTab("form")}>
          Preencher template
        </TabButton>
        <TabButton active={tab === "preview"} onClick={() => setTab("preview")}>
          Visualizar contrato
        </TabButton>
      </div>

      {tab === "form" ? (
        <form
          onSubmit={handleSave}
          className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
        >
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            Preencha as informações do contrato. O documento é gerado
            automaticamente a partir deste template em português.
          </p>
          <ContractTemplateForm value={template} onChange={setTemplate} />
          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}
          <Button type="submit" disabled={saving} className="mt-6">
            {saving ? "Salvando..." : "Salvar template"}
          </Button>
        </form>
      ) : (
        <div className="mt-6">
          <ContractDocument data={template} />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300"
          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminContractPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>}>
      <ContractEditorContent />
    </Suspense>
  );
}
