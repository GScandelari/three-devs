"use client";

import { useEffect, useState } from "react";
import {
  createClient,
  getAllClients,
  updateClientProfile,
} from "@/lib/firebase/firestore";
import { sendClientWelcome, setClientPassword } from "@/lib/firebase/admin-api";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import type { Client } from "@/lib/types";

const EMPTY_EDIT_FORM = {
  name: "",
  company: "",
  password: "",
  mustChangePassword: true,
};

function functionErrorMessage(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : fallback;
  return message.includes("functions/") || message.includes("not-found")
    ? "Cloud Function indisponível. Faça o deploy das functions ou use o Firebase Console."
    : message;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [welcomeSending, setWelcomeSending] = useState(false);

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

  function openEdit(client: Client) {
    setEditClient(client);
    setEditForm({
      ...EMPTY_EDIT_FORM,
      name: client.name,
      company: client.company ?? "",
    });
    setEditError("");
    setEditSuccess("");
  }

  function closeEdit() {
    setEditClient(null);
    setEditForm(EMPTY_EDIT_FORM);
    setEditError("");
    setEditSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    let clientId: string;
    try {
      clientId = await createClient({
        name: form.name,
        email: form.email,
        company: form.company,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar cliente.");
      setSaving(false);
      return;
    }

    try {
      await sendClientWelcome(clientId);
      setSuccess(
        "Cliente criado. O e-mail de boas-vindas com o link para definir a senha foi enviado.",
      );
    } catch (err) {
      setSuccess(
        `Cliente criado, mas o e-mail de boas-vindas não foi enviado (${functionErrorMessage(err, "erro desconhecido")}). Use "Editar" → "Reenviar boas-vindas".`,
      );
    }

    setForm({ name: "", email: "", company: "" });
    setShowForm(false);
    await loadClients();
    setSaving(false);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editClient) return;

    setEditError("");
    setEditSuccess("");
    setEditSaving(true);

    try {
      const name = editForm.name.trim();
      const company = editForm.company.trim();
      if (name !== editClient.name || company !== (editClient.company ?? "")) {
        await updateClientProfile(editClient.id, { name, company });
      }

      let message = "Perfil atualizado.";
      if (editForm.password) {
        const result = await setClientPassword(
          editClient.id,
          editForm.password,
          editForm.mustChangePassword,
        );
        message = [
          result.created ? "Conta criada e senha definida." : "Senha atualizada.",
          editForm.mustChangePassword
            ? "O cliente precisará trocá-la no próximo acesso."
            : "",
        ]
          .filter(Boolean)
          .join(" ");
      }

      setEditSuccess(message);
      setEditForm((current) => ({ ...current, password: "" }));
      await loadClients();
      setTimeout(closeEdit, 1500);
    } catch (err) {
      setEditError(functionErrorMessage(err, "Erro ao salvar o cliente."));
    } finally {
      setEditSaving(false);
    }
  }

  async function handleResendWelcome() {
    if (!editClient) return;

    setEditError("");
    setEditSuccess("");
    setWelcomeSending(true);

    try {
      await sendClientWelcome(editClient.id);
      setEditSuccess(
        "E-mail de boas-vindas reenviado. O link anterior deixou de funcionar.",
      );
      await loadClients();
    } catch (err) {
      setEditError(
        functionErrorMessage(err, "Erro ao enviar o e-mail de boas-vindas."),
      );
    } finally {
      setWelcomeSending(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="mt-1 text-slate-600">
            Gerencie clientes e contas de acesso ao portal.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Novo cliente"}
        </Button>
      </div>

      {success && !showForm && (
        <p className="mt-4 text-sm text-emerald-600">{success}</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h2 className="font-medium text-slate-900">Cadastrar cliente</h2>
          <p className="mt-1 text-sm text-slate-500">
            O cliente recebe um e-mail de boas-vindas com um link para definir
            a própria senha (válido por 72 horas).
          </p>
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
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving} className="mt-4">
            {saving ? "Salvando..." : "Criar cliente e enviar boas-vindas"}
          </Button>
        </form>
      )}

      {editClient && (
        <form
          onSubmit={handleEditSubmit}
          className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/50 p-6"
        >
          <h2 className="font-medium text-slate-900">
            Editar cliente — {editClient.name}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {editClient.email}
            {editClient.welcomeEmailSentAt && (
              <>
                {" "}
                · boas-vindas enviadas em{" "}
                {new Date(editClient.welcomeEmailSentAt).toLocaleString("pt-BR")}
              </>
            )}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Nome"
              value={editForm.name}
              onChange={(v) => setEditForm({ ...editForm, name: v })}
              required
            />
            <Field
              label="Empresa"
              value={editForm.company}
              onChange={(v) => setEditForm({ ...editForm, company: v })}
            />
          </div>

          <div className="mt-6 border-t border-indigo-100 pt-4">
            <h3 className="text-sm font-medium text-slate-900">
              Senha temporária
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Opcional. Deixe em branco para manter a senha atual. Definir uma
              senha encerra as sessões abertas do cliente e invalida links de
              senha pendentes.
            </p>
            <div className="mt-3 max-w-sm">
              <Field
                label="Nova senha"
                type="password"
                value={editForm.password}
                onChange={(v) => setEditForm({ ...editForm, password: v })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={editForm.mustChangePassword}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    mustChangePassword: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Exigir que o cliente troque a senha no próximo acesso
            </label>
          </div>

          {editError && (
            <p className="mt-3 text-sm text-red-600">{editError}</p>
          )}
          {editSuccess && (
            <p className="mt-3 text-sm text-emerald-600">{editSuccess}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={
                editSaving ||
                !editForm.name.trim() ||
                (editForm.password.length > 0 && editForm.password.length < 6)
              }
            >
              {editSaving ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={welcomeSending}
              onClick={handleResendWelcome}
            >
              {welcomeSending ? "Enviando..." : "Reenviar boas-vindas"}
            </Button>
            <Button type="button" variant="ghost" onClick={closeEdit}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Carregando...</p>
      ) : clients.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Nenhum cliente cadastrado.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
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
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {client.name}
                    {client.mustChangePassword && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Troca de senha pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{client.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {client.company || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        client.onboardingComplete
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {client.onboardingComplete ? "Completo" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEdit(client)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Editar
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
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {type === "password" ? (
        <PasswordInput
          required={required}
          value={value}
          placeholder={placeholder}
          autoComplete="new-password"
          onChange={(e) => onChange(e.target.value)}
          wrapperClassName="mt-1"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      )}
    </div>
  );
}
