import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import type {
  Client,
  Contract,
  ContractStatus,
  ContractTemplateData,
  Developer,
  Project,
  ProjectLink,
  ProjectNote,
  ProjectStatus,
} from "@/lib/types";
import {
  EMPTY_CONTRACT_TEMPLATE,
  buildContractTitle,
} from "@/lib/contracts/template";
import { getFirebaseDb } from "./config";

function mapDoc<T>(snap: { id: string; data: () => Record<string, unknown> }): T {
  return { id: snap.id, ...snap.data() } as T;
}

function dbOrThrow() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase não configurado");
  return db;
}

export async function getDeveloperByUid(
  uid: string,
): Promise<Developer | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const snap = await getDoc(doc(db, "developers", uid));
    if (!snap.exists()) return null;
    return mapDoc<Developer>(snap);
  } catch {
    return null;
  }
}

export async function getClientByEmail(email: string): Promise<Client | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, "clients"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return mapDoc<Client>(snapshot.docs[0]);
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const snap = await getDoc(doc(db, "clients", clientId));
  if (!snap.exists()) return null;
  return mapDoc<Client>(snap);
}

export async function getProjectsByClientId(
  clientId: string,
): Promise<Project[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, "projects"),
    where("clientId", "==", clientId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => mapDoc<Project>(d))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export async function getProjectById(
  projectId: string,
): Promise<Project | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const snap = await getDoc(doc(db, "projects", projectId));
  if (!snap.exists()) return null;
  return mapDoc<Project>(snap);
}

export async function getContractsByClientId(
  clientId: string,
): Promise<Contract[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, "contracts"),
    where("clientId", "==", clientId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapDoc<Contract>(d));
}

export async function clientHasSignedContract(
  clientId: string,
): Promise<boolean> {
  const contracts = await getContractsByClientId(clientId);
  return contracts.some((c) => c.status === "signed");
}

export async function getAllClients(): Promise<Client[]> {
  const snapshot = await getDocs(collection(dbOrThrow(), "clients"));
  return snapshot.docs
    .map((d) => mapDoc<Client>(d))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllContracts(): Promise<Contract[]> {
  const snapshot = await getDocs(collection(dbOrThrow(), "contracts"));
  return snapshot.docs
    .map((d) => mapDoc<Contract>(d))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getAllProjects(): Promise<Project[]> {
  const snapshot = await getDocs(collection(dbOrThrow(), "projects"));
  return snapshot.docs
    .map((d) => mapDoc<Project>(d))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export async function createClient(data: {
  email: string;
  name: string;
  company?: string;
}): Promise<string> {
  const db = dbOrThrow();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await setDoc(doc(db, "clients", id), {
    email: data.email,
    name: data.name,
    company: data.company ?? "",
    createdAt: now,
    onboardingComplete: false,
  });

  return id;
}

export async function createAuthUser(email: string, password: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Firebase API key não configurada");

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  const body = await res.json();
  if (!res.ok) {
    const message =
      body?.error?.message === "EMAIL_EXISTS"
        ? "Este e-mail já possui conta de acesso."
        : "Não foi possível criar a conta de acesso.";
    throw new Error(message);
  }
}

export async function getContractById(
  contractId: string,
): Promise<Contract | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const snap = await getDoc(doc(db, "contracts", contractId));
  if (!snap.exists()) return null;
  return mapDoc<Contract>(snap);
}

export async function createContract(data: {
  clientId: string;
  projectId: string;
  title?: string;
  status?: ContractStatus;
  template?: ContractTemplateData;
}): Promise<string> {
  const db = dbOrThrow();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const status = data.status ?? "draft";
  const template = { ...EMPTY_CONTRACT_TEMPLATE, ...data.template };
  const title = data.title?.trim() || buildContractTitle(template);

  await setDoc(doc(db, "contracts", id), {
    clientId: data.clientId,
    projectId: data.projectId,
    title,
    template,
    status,
    createdAt: now,
    updatedAt: now,
    ...(status === "sent" ? { sentAt: now } : {}),
    ...(status === "signed" ? { sentAt: now, signedAt: now } : {}),
  });

  return id;
}

export async function updateContractTemplate(
  contractId: string,
  template: ContractTemplateData,
) {
  const db = dbOrThrow();
  const now = new Date().toISOString();

  await updateDoc(doc(db, "contracts", contractId), {
    template,
    title: buildContractTitle(template),
    updatedAt: now,
  });
}

export async function updateContractStatus(
  contractId: string,
  status: ContractStatus,
) {
  const db = dbOrThrow();
  const now = new Date().toISOString();
  const updates: Record<string, string> = { status };

  if (status === "sent") updates.sentAt = now;
  if (status === "signed") {
    updates.sentAt = updates.sentAt ?? now;
    updates.signedAt = now;
  }

  await updateDoc(doc(db, "contracts", contractId), updates);

  if (status === "signed") {
    const contract = await getDoc(doc(db, "contracts", contractId));
    if (contract.exists()) {
      const clientId = contract.data().clientId as string;
      await updateDoc(doc(db, "clients", clientId), {
        onboardingComplete: true,
      });
    }
  }
}

export async function createProject(data: {
  clientId: string;
  name: string;
  description: string;
  leadDeveloperId: string;
  leadDeveloperName: string;
}): Promise<string> {
  const db = dbOrThrow();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await setDoc(doc(db, "projects", id), {
    clientId: data.clientId,
    name: data.name,
    description: data.description,
    status: "pending_contract" as ProjectStatus,
    leadDeveloperId: data.leadDeveloperId,
    leadDeveloperName: data.leadDeveloperName,
    teamDeveloperIds: [data.leadDeveloperId],
    links: [],
    notes: [],
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
) {
  await updateDoc(doc(dbOrThrow(), "projects", projectId), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function addProjectNote(
  projectId: string,
  note: Omit<ProjectNote, "id" | "createdAt">,
) {
  const project = await getProjectById(projectId);
  if (!project) throw new Error("Projeto não encontrado");

  const newNote: ProjectNote = {
    ...note,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await updateDoc(doc(dbOrThrow(), "projects", projectId), {
    notes: [...(project.notes ?? []), newNote],
    updatedAt: new Date().toISOString(),
  });
}

export async function addProjectLink(
  projectId: string,
  link: Omit<ProjectLink, "id">,
) {
  const project = await getProjectById(projectId);
  if (!project) throw new Error("Projeto não encontrado");

  const newLink: ProjectLink = {
    ...link,
    id: crypto.randomUUID(),
  };

  await updateDoc(doc(dbOrThrow(), "projects", projectId), {
    links: [...(project.links ?? []), newLink],
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteClient(clientId: string) {
  await deleteDoc(doc(dbOrThrow(), "clients", clientId));
}
