"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { updateClientProfile } from "@/lib/firebase/firestore";
import { getMissingClientFields } from "@/lib/clients";
import { formatCpfCnpj, isValidCpfCnpj } from "@/lib/documents";
import { Button } from "@/components/ui/Button";
import type { Client } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export default function PortalProfilePage() {
  const { client } = useAuth();

  // Desenvolvedores em "Ver portal" não têm cadastro de cliente.
  if (!client) {
    return (
      <p className="text-sm text-slate-500">
        Não há cadastro de cliente para esta conta.{" "}
        <Link href="/portal" className="text-indigo-600">
          Voltar
        </Link>
      </p>
    );
  }

  // O formulário guarda o que foi digitado; depois de salvar, ele já é igual
  // ao cadastro relido.
  return <ProfileForm key={client.id} client={client} />;
}

function ProfileForm({ client }: { client: Client }) {
  const { refreshClient } = useAuth();
  const [form, setForm] = useState({
    name: client.name ?? "",
    company: client.company ?? "",
    document: client.document ?? "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const missing = getMissingClientFields(client);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const document = form.document.trim();
    if (!name) {
      setError("Informe seu nome.");
      return;
    }
    if (!isValidCpfCnpj(document)) {
      setError("Informe um CPF ou CNPJ válido.");
      return;
    }

    setSaving(true);
    try {
      await updateClientProfile(client.id, {
        name,
        company: form.company.trim(),
        document,
      });
      await refreshClient();
      setSuccess("Dados salvos.");
    } catch (err) {
      console.error("Erro ao salvar dados do cliente:", err);
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/portal"
        className="mb-6 inline-flex text-sm text-slate-500 hover:text-slate-900"
      >
        ← Voltar ao portal
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900">Meus dados</h1>
      <p className="mt-1 text-slate-600">
        Esses dados são usados na confecção dos seus contratos.
      </p>

      {missing.length > 0 && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          Falta informar: <strong>{missing.join(", ")}</strong>. Esses dados são
          necessários para a confecção do contrato.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Nome completo
            </label>
            <input
              id="name"
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-slate-700">
              CPF ou CNPJ
            </label>
            <input
              id="document"
              required
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={form.document}
              onChange={(e) =>
                setForm({ ...form, document: formatCpfCnpj(e.target.value) })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-slate-700">
              Empresa
            </label>
            <input
              id="company"
              maxLength={120}
              placeholder="Opcional"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="email"
              readOnly
              aria-readonly
              value={client.email}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">
              É o seu login. Para alterar, fale com a equipe.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="mt-4 text-sm text-emerald-600">
            {success}
          </p>
        )}

        <Button type="submit" disabled={saving} className="mt-6">
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </div>
  );
}
