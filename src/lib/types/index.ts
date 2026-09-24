export type DeveloperId = string;

export type ContractStatus = "draft" | "sent" | "signed" | "cancelled";

export type ProjectStatus =
  | "pending_contract"
  | "onboarding"
  | "in_progress"
  | "review"
  | "delivered"
  | "paused";

export interface Client {
  id: string;
  email: string;
  name: string;
  company?: string;
  createdAt: string;
  onboardingComplete: boolean;
}

export interface ContractTemplateData {
  agencyName: string;
  agencyDocument: string;
  agencyEmail: string;
  clientName: string;
  clientDocument: string;
  clientEmail: string;
  clientCompany: string;
  commencementDate: string;
  conclusionDate: string;
  projectName: string;
  servicesDescription: string;
  packageName: string;
  deliverable1: string;
  deliverable2: string;
  deliverable3: string;
  monthlyHours: string;
  revisionRounds: string;
  totalValue: string;
  paymentMethod: string;
  paymentInstallments: string;
  retainerValue: string;
  termMonths: string;
  noticeDays: string;
  jurisdiction: string;
  leadDeveloperName: string;
}

export interface Contract {
  id: string;
  clientId: string;
  projectId: string;
  status: ContractStatus;
  title: string;
  template?: ContractTemplateData;
  documentUrl?: string;
  documentFileName?: string;
  sentAt?: string;
  lastEmailSentAt?: string;
  sentTo?: string;
  emailMessageId?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectLink {
  id: string;
  label: string;
  url: string;
}

export interface ProjectNote {
  id: string;
  content: string;
  authorId: DeveloperId;
  authorName: string;
  createdAt: string;
  important: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  leadDeveloperId: DeveloperId;
  leadDeveloperName: string;
  teamDeveloperIds: DeveloperId[];
  contractId?: string;
  links: ProjectLink[];
  notes: ProjectNote[];
  createdAt: string;
  updatedAt: string;
}

export interface Developer {
  id: string;
  email: string;
  name: string;
  role: "developer" | "admin";
  mustChangePassword?: boolean;
  createdAt?: string;
}
