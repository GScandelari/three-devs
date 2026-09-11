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

// Dark variants apply only inside ThemeProvider; portal badges stay unchanged.
export const projectStatusColors: Record<ProjectStatus, string> = {
  pending_contract:
    "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  onboarding: "bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-300",
  in_progress:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/15 dark:text-indigo-300",
  review:
    "bg-purple-100 text-purple-800 dark:bg-purple-400/15 dark:text-purple-300",
  delivered:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  paused: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
};

export const contractStatusColors: Record<ContractStatus, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
  sent: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  signed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300",
};
