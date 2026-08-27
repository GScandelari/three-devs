import Link from "next/link";
import type { Project, ProjectStatus } from "@/lib/types";

const statusLabels: Record<ProjectStatus, string> = {
  pending_contract: "Aguardando contrato",
  onboarding: "Onboarding",
  in_progress: "Em andamento",
  review: "Em revisão",
  delivered: "Entregue",
  paused: "Pausado",
};

const statusColors: Record<ProjectStatus, string> = {
  pending_contract: "bg-amber-100 text-amber-800",
  onboarding: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  review: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  paused: "bg-slate-100 text-slate-600",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/portal/project?id=${project.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
            {project.description}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Responsável: {project.leadDeveloperName}
      </p>
    </Link>
  );
}
