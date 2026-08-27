"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getProjectById } from "@/lib/firebase/firestore";
import { ProjectStatusBadge } from "@/components/portal/ProjectCard";
import type { Project } from "@/lib/types";

function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  const { client } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId || !client) return;

    async function loadProject() {
      const data = await getProjectById(projectId!);
      if (!data || data.clientId !== client!.id) {
        setError("Projeto não encontrado.");
      } else {
        setProject(data);
      }
      setLoading(false);
    }

    loadProject();
  }, [projectId, client]);

  if (!projectId) {
    return (
      <p className="text-sm text-slate-500">
        ID do projeto não informado.{" "}
        <Link href="/portal" className="text-indigo-600">
          Voltar
        </Link>
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Carregando projeto...</p>;
  }

  if (error || !project) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">{error || "Projeto não encontrado."}</p>
        <Link
          href="/portal"
          className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-500"
        >
          ← Voltar aos projetos
        </Link>
      </div>
    );
  }

  const importantNotes = project.notes?.filter((n) => n.important) ?? [];
  const regularNotes = project.notes?.filter((n) => !n.important) ?? [];

  return (
    <div>
      <Link
        href="/portal"
        className="mb-6 inline-flex text-sm text-slate-500 hover:text-slate-900"
      >
        ← Voltar aos projetos
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {project.name}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">{project.description}</p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {importantNotes.length > 0 && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-amber-800">
                Notas importantes
              </h2>
              <ul className="mt-4 space-y-3">
                {importantNotes.map((note) => (
                  <li key={note.id} className="text-sm text-amber-900">
                    <p>{note.content}</p>
                    <p className="mt-1 text-xs text-amber-700">
                      {note.authorName} ·{" "}
                      {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {regularNotes.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
                Atualizações
              </h2>
              <ul className="mt-4 space-y-4">
                {regularNotes.map((note) => (
                  <li
                    key={note.id}
                    className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                  >
                    <p className="text-sm text-slate-700">{note.content}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {note.authorName} ·{" "}
                      {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(!project.notes || project.notes.length === 0) && (
            <section className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">
                Nenhuma atualização publicada ainda.
              </p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
              Responsável
            </h2>
            <p className="mt-2 font-medium text-slate-900">
              {project.leadDeveloperName}
            </p>
          </section>

          {project.links && project.links.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
                Links
              </h2>
              <ul className="mt-3 space-y-2">
                {project.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      {link.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
              Informações
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Criado em</dt>
                <dd className="text-slate-900">
                  {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Atualizado em</dt>
                <dd className="text-slate-900">
                  {new Date(project.updatedAt).toLocaleDateString("pt-BR")}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Carregando...</p>}>
      <ProjectDetailContent />
    </Suspense>
  );
}
