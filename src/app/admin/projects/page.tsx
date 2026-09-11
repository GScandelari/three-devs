"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createProject,
  getAllClients,
  getAllProjects,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  projectStatusLabels,
  projectStatusColors,
} from "@/lib/labels";
import type { Client, Project } from "@/lib/types";

export default function AdminProjectsPage() {
  const router = useRouter();
  const { developer } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    clientId: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const [p, c] = await Promise.all([getAllProjects(), getAllClients()]);
    setProjects(p);
    setClients(c);
    setLoading(false);
  }

  useEffect(() => {
    async function loadOnMount() {
      const [p, c] = await Promise.all([getAllProjects(), getAllClients()]);
      setProjects(p);
      setClients(c);
      setLoading(false);
    }

    void loadOnMount();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!developer) return;
    setError("");
    setSaving(true);

    try {
      const id = await createProject({
        name: form.name,
        description: form.description,
        clientId: form.clientId,
        leadDeveloperId: developer.id,
        leadDeveloperName: developer.name,
      });
      setShowForm(false);
      setForm({ name: "", description: "", clientId: "" });
      await loadData();
      router.push(`/admin/project?id=${id}`);
    } catch {
      setError("Erro ao criar projeto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Projetos
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Gerencie projetos, status, links e notas.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Novo projeto"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="font-medium text-slate-900 dark:text-slate-100">
            Criar projeto
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Cliente
              </label>
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
              >
                <option value="">Selecione...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nome do projeto
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Descrição
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400"
              />
            </div>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" disabled={saving} className="mt-4">
            {saving ? "Criando..." : "Criar projeto"}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          Carregando...
        </p>
      ) : projects.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Nenhum projeto cadastrado.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Projeto</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Responsável</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {project.name}
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
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/project?id=${project.id}`}
                      className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Gerenciar →
                    </Link>
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
