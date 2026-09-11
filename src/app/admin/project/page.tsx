"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  addProjectLink,
  addProjectNote,
  getProjectById,
  updateProjectStatus,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  projectStatusLabels,
  projectStatusColors,
} from "@/lib/labels";
import type { Project, ProjectStatus } from "@/lib/types";

function ProjectAdminContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  const { developer } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [important, setImportant] = useState(false);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const id = projectId;

    async function load() {
      setProject(await getProjectById(id));
      setLoading(false);
    }

    void load();
  }, [projectId]);

  if (!projectId) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Projeto não informado.{" "}
        <Link
          href="/admin/projects"
          className="text-indigo-600 dark:text-indigo-400"
        >
          Voltar
        </Link>
      </p>
    );
  }

  if (loading || !project) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Carregando...
      </p>
    );
  }

  const currentProject = project;

  async function reload() {
    if (!projectId) return;
    setProject(await getProjectById(projectId));
  }

  async function handleStatusChange(status: ProjectStatus) {
    await updateProjectStatus(currentProject.id, status);
    await reload();
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!developer || !note.trim()) return;
    setSaving(true);
    await addProjectNote(currentProject.id, {
      content: note.trim(),
      authorId: developer.id,
      authorName: developer.name,
      important,
    });
    setNote("");
    setImportant(false);
    await reload();
    setSaving(false);
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkLabel.trim() || !linkUrl.trim()) return;
    setSaving(true);
    await addProjectLink(currentProject.id, {
      label: linkLabel.trim(),
      url: linkUrl.trim(),
    });
    setLinkLabel("");
    setLinkUrl("");
    await reload();
    setSaving(false);
  }

  return (
    <div>
      <Link
        href="/admin/projects"
        className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        ← Voltar aos projetos
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {project.name}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
            {project.description}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${projectStatusColors[project.status]}`}
        >
          {projectStatusLabels[project.status]}
        </span>
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400">
          Status do projeto
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(projectStatusLabels) as ProjectStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  project.status === status
                    ? "bg-indigo-600 text-white dark:bg-indigo-500"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {projectStatusLabels[status]}
              </button>
            ),
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-medium text-slate-900 dark:text-slate-100">
            Adicionar nota
          </h2>
          <form onSubmit={handleAddNote} className="mt-4 space-y-3">
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Atualização para o cliente..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={important}
                onChange={(e) => setImportant(e.target.checked)}
                className="accent-indigo-600 dark:accent-indigo-400"
              />
              Marcar como importante
            </label>
            <Button type="submit" disabled={saving || !note.trim()}>
              Publicar nota
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            {(project.notes ?? []).length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhuma nota ainda.
              </p>
            ) : (
              [...(project.notes ?? [])]
                .reverse()
                .map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-lg p-3 text-sm ${
                      n.important
                        ? "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
                        : "bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                    }`}
                  >
                    <p>{n.content}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {n.authorName} ·{" "}
                      {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-medium text-slate-900 dark:text-slate-100">
            Links do projeto
          </h2>
          <form onSubmit={handleAddLink} className="mt-4 space-y-3">
            <input
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Label (ex: Staging)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400"
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="URL"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400"
            />
            <Button type="submit" disabled={saving}>
              Adicionar link
            </Button>
          </form>

          <ul className="mt-6 space-y-2">
            {(project.links ?? []).length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhum link ainda.
              </p>
            ) : (
              project.links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {link.label} →
                  </a>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default function AdminProjectPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Carregando...
        </p>
      }
    >
      <ProjectAdminContent />
    </Suspense>
  );
}
