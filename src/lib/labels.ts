import type { ContractStatus, ProjectStatus } from "@/lib/types";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  pending_contract: "Aguardando contrato",
  onboarding: "Onboarding",
  in_progress: "Em andamento",
  review: "Em revisão",
  delivered: "Entregue",
  paused: "Pausado",
};

export const contractStatusLabels: Record<ContractStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  signed: "Assinado",
  cancelled: "Cancelado",
};

export const projectStatusColors: Record<ProjectStatus, string> = {
  pending_contract: "bg-amber-100 text-amber-800",
  onboarding: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  review: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  paused: "bg-slate-100 text-slate-600",
};

export const contractStatusColors: Record<ContractStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-amber-100 text-amber-800",
  signed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};
