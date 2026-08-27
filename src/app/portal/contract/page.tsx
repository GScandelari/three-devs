"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getContractById } from "@/lib/firebase/firestore";
import { EMPTY_CONTRACT_TEMPLATE } from "@/lib/contracts/template";
import { ContractDocument } from "@/components/contracts/ContractDocument";
import {
  contractStatusColors,
  contractStatusLabels,
} from "@/lib/labels";
import type { Contract } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

function PortalContractContent() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("id");
  const { client } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!contractId || !client) return;
    const id = contractId;

    async function load() {
      const data = await getContractById(id);
      if (!data || data.clientId !== client!.id) {
        setError("Contrato não encontrado.");
      } else {
        setContract(data);
      }
      setLoading(false);
    }

    void load();
  }, [contractId, client]);

  if (!contractId) {
    return (
      <p className="text-sm text-slate-500">
        Contrato não informado.{" "}
        <Link href="/portal" className="text-indigo-600">
          Voltar
        </Link>
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Carregando contrato...</p>;
  }

  if (error || !contract) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">{error || "Contrato não encontrado."}</p>
        <Link
          href="/portal"
          className="mt-4 inline-block text-sm text-indigo-600"
        >
          ← Voltar
        </Link>
      </div>
    );
  }

  const template = {
    ...EMPTY_CONTRACT_TEMPLATE,
    ...(contract.template ?? {}),
  };

  return (
    <div>
      <Link
        href="/portal"
        className="mb-6 inline-flex text-sm text-slate-500 hover:text-slate-900"
      >
        ← Voltar ao portal
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {contract.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {contract.signedAt
              ? `Assinado em ${new Date(contract.signedAt).toLocaleDateString("pt-BR")}`
              : contract.sentAt
                ? `Enviado em ${new Date(contract.sentAt).toLocaleDateString("pt-BR")}`
                : "Documento do contrato"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${contractStatusColors[contract.status]}`}
        >
          {contractStatusLabels[contract.status]}
        </span>
      </div>

      {contract.template ? (
        <ContractDocument data={template} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          O template deste contrato ainda está sendo preenchido pela equipe.
        </div>
      )}
    </div>
  );
}

export default function PortalContractPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Carregando...</p>}>
      <PortalContractContent />
    </Suspense>
  );
}
