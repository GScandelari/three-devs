"use client";

import { useEffect, useState } from "react";
import {
  createClient,
  getAllClients,
} from "@/lib/firebase/firestore";
import { setClientPassword } from "@/lib/firebase/admin-api";
import { Button } from "@/components/ui/Button";
import type { Client } from "@/lib/types";

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordClient, setPasswordClient] = useState<Client | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  async function loadClients() {
    setClients(await getAllClients());
    setLoading(false);
  }

  useEffect(() => {
    async function loadClientsOnMount() {
      setClients(await getAllClients());
      setLoading(false);
    }

    void loadClientsOnMount();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await createClient({
        name: form.name,
        email: form.email,
        company: form.company,
      });

      if (form.password) {
        await setClientPassword(form.email, form.password);
      }

      setSuccess(
        form.password
          ? "Cliente e conta de acesso criados com sucesso."
          : "Cliente criado. Defina a senha depois com 'Editar senha'.",
      );
      setForm({ name: "", email: "", company: "", password: "" });
      setShowForm(false);
      await loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar cliente.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordClient) return;

    setPasswordError("");
    setPasswordSuccess("");
    setPasswordSaving(true);

    try {
      const result = await setClientPassword(
        passwordClient.email,
        newPassword,
      );
      setPasswordSuccess(
        result.created
          ? "Conta criada e senha definida."
          : "Senha atualizada com sucesso.",
      );
      setNewPassword("");
      setTimeout(() => {
        setPasswordClient(null);
        setPasswordSuccess("");
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar senha.";
      setPasswordError(
        message.includes("functions/") || message.includes("not-found")
          ? "Cloud Function indisponível. Faça o deploy das functions ou use o Firebase Console."
          : message,
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Clientes
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Gerencie clientes e contas de acesso ao portal.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Novo cliente"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="font-medium text-slate-900 dark:text-slate-100">
            Cadastrar cliente
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Nome"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
            <Field
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
            <Field
              label="Empresa"
              value={form.company}
              onChange={(v) => setForm({ ...form, company: v })}
            />
            <Field
              label="Senha inicial (portal)"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="Opcional — cria conta Firebase Auth"
            />
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          )}
          <Button type="submit" disabled={saving} className="mt-4">
            {saving ? "Salvando..." : "Criar cliente"}
          </Button>
        </form>
      )}

      {passwordClient && (
        <form
          onSubmit={handlePasswordSubmit}
          className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-500/30 dark:bg-indigo-500/10"
        >
          <h2 className="font-medium text-slate-900 dark:text-slate-100">
            Editar senha — {passwordClient.name}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {passwordClient.email}
          </p>
          <div className="mt-4 max-w-sm">
            <Field
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              required
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          {passwordError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
              {passwordSuccess}
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <Button type="submit" disabled={passwordSaving || newPassword.length < 6}>
              {passwordSaving ? "Salvando..." : "Salvar senha"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPasswordClient(null);
                setNewPassword("");
                setPasswordError("");
                setPasswordSuccess("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          Carregando...
        </p>
      ) : clients.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Nenhum cliente cadastrado.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Onboarding</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {client.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {client.email}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {client.company || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        client.onboardingComplete
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"
                      }`}
                    >
                      {client.onboardingComplete ? "Completo" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordClient(client);
                        setNewPassword("");
                        setPasswordError("");
                        setPasswordSuccess("");
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Editar senha
                    </button>
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/25"
      />
    </div>
  );
}
