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
  runTransaction,
  Timestamp,
  type Firestore,
  type Transaction,
} from "firebase/firestore";
import type {
  Client,
  ClientNotification,
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
import { projectStatusLabels } from "@/lib/labels";
import { getFirebaseDb } from "./config";

// firestore.rules rejeita títulos acima de 300 caracteres; cortamos antes, com folga.
const NOTIFICATION_TITLE_MAX = 200;
// Avisos não visualizados expiram 3 dias após a criação (TTL em expiresAt).
const NOTIFICATION_TTL_MS = 3 * 24 * 60 * 60 * 1000;

function mapDoc<T>(snap: { id: string; data: () => Record<string, unknown> }): T {
  return { id: snap.id, ...snap.data() } as T;
}

function dbOrThrow() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase não configurado");
  return db;
}

// Inclui o aviso na mesma transação da alteração que o originou: ou os dois são
// gravados, ou nenhum. A transação também relê o documento antes de gravar, então
// duas gravações simultâneas não se sobrescrevem nem geram aviso repetido.
function queueNotification(
  tx: Transaction,
  db: Firestore,
  notification: Pick<ClientNotification, "clientId" | "type" | "title"> &
    ({ projectId: string } | { contractId: string }),
  createdAt: string,
) {
  // Registro sem cliente vinculado (ex.: criado à mão no console): a alteração
  // é gravada normalmente, só não há a quem avisar.
  if (!notification.clientId) {
    console.warn("Aviso não gerado: registro sem clientId.", notification);
    return;
  }

  tx.set(doc(db, "notifications", crypto.randomUUID()), {
    ...notification,
    title: notification.title.slice(0, NOTIFICATION_TITLE_MAX),
    createdAt,
    expiresAt: Timestamp.fromMillis(Date.parse(createdAt) + NOTIFICATION_TTL_MS),
  });
}

async function getProjectInTransaction(
  tx: Transaction,
  db: Firestore,
  projectId: string,
) {
  const ref = doc(db, "projects", projectId);
  const snap = await tx.get(ref);
  if (!snap.exists()) throw new Error("Projeto não encontrado");
  return { ref, project: mapDoc<Project>(snap) };
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

export async function clearMustChangePassword(uid: string) {
  await updateDoc(doc(dbOrThrow(), "developers", uid), {
    mustChangePassword: false,
  });
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
  const contractRef = doc(db, "contracts", contractId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(contractRef);
    if (!snap.exists()) throw new Error("Contrato não encontrado");
    const contract = mapDoc<Contract>(snap);

    // Numa transação, todas as leituras vêm antes das escritas. Contrato sem
    // cliente válido (criado à mão, cliente removido) continua podendo ser
    // assinado; só não há portal a liberar nem cliente a avisar.
    const clientRef =
      status === "signed" && contract.clientId
        ? doc(db, "clients", contract.clientId)
        : null;
    const clientExists = clientRef ? (await tx.get(clientRef)).exists() : false;
    if (status === "signed" && !clientExists) {
      console.warn(
        "Contrato assinado sem cliente válido: portal e aviso não aplicados.",
        contractId,
      );
    }

    const updates: Record<string, string> = { status };
    // sentAt é a data do primeiro envio: preenchida ao enviar (ou ao assinar um
    // contrato que nunca foi enviado) e nunca sobrescrita depois.
    if ((status === "sent" || status === "signed") && !contract.sentAt) {
      updates.sentAt = now;
    }
    // signedAt é a data da assinatura: regravar "signed" não a altera.
    if (
      status === "signed" &&
      (contract.status !== "signed" || !contract.signedAt)
    ) {
      updates.signedAt = now;
    }

    tx.update(contractRef, updates);

    if (clientRef && clientExists) {
      tx.update(clientRef, { onboardingComplete: true });

      // Só avisa na transição para assinado; regravar "signed" não repete o aviso.
      if (contract.status !== "signed") {
        queueNotification(
          tx,
          db,
          {
            clientId: contract.clientId,
            type: "contract_signed",
            title: `Contrato assinado: ${contract.title}`,
            contractId,
          },
          now,
        );
      }
    }
  });
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
  options: { notifyClient?: boolean } = {},
) {
  const db = dbOrThrow();
  const now = new Date().toISOString();

  await runTransaction(db, async (tx) => {
    const { ref, project } = await getProjectInTransaction(tx, db, projectId);
    // Regravar o status atual não é uma mudança: não grava nem avisa.
    if (project.status === status) return;

    tx.update(ref, { status, updatedAt: now });

    if (options.notifyClient) {
      queueNotification(
        tx,
        db,
        {
          clientId: project.clientId,
          type: "project_status",
          title: `${project.name}: status alterado para ${projectStatusLabels[status]}`,
          projectId,
        },
        now,
      );
    }
  });
}

export async function addProjectNote(
  projectId: string,
  note: Omit<ProjectNote, "id" | "createdAt">,
  options: { notifyClient?: boolean } = {},
) {
  const db = dbOrThrow();
  const now = new Date().toISOString();
  const newNote: ProjectNote = {
    ...note,
    id: crypto.randomUUID(),
    createdAt: now,
  };

  await runTransaction(db, async (tx) => {
    const { ref, project } = await getProjectInTransaction(tx, db, projectId);

    tx.update(ref, {
      notes: [...(project.notes ?? []), newNote],
      updatedAt: now,
    });

    if (options.notifyClient) {
      queueNotification(
        tx,
        db,
        {
          clientId: project.clientId,
          type: "project_note",
          title: note.important
            ? `${project.name}: atualização importante`
            : `${project.name}: nova atualização`,
          projectId,
        },
        now,
      );
    }
  });
}

export async function addProjectLink(
  projectId: string,
  link: Omit<ProjectLink, "id">,
  options: { notifyClient?: boolean } = {},
) {
  const db = dbOrThrow();
  const now = new Date().toISOString();
  const newLink: ProjectLink = {
    ...link,
    id: crypto.randomUUID(),
  };

  await runTransaction(db, async (tx) => {
    const { ref, project } = await getProjectInTransaction(tx, db, projectId);

    tx.update(ref, {
      links: [...(project.links ?? []), newLink],
      updatedAt: now,
    });

    if (options.notifyClient) {
      queueNotification(
        tx,
        db,
        {
          clientId: project.clientId,
          type: "project_link",
          title: `${project.name}: novo link — ${link.label}`,
          projectId,
        },
        now,
      );
    }
  });
}

export async function getNotificationsByClientId(
  clientId: string,
): Promise<ClientNotification[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, "notifications"),
    where("clientId", "==", clientId),
  );
  const snapshot = await getDocs(q);
  const now = Date.now();
  return (
    snapshot.docs
      .map((d) => mapDoc<ClientNotification>(d))
      // O TTL do Firestore apaga um aviso vencido normalmente em até 24 horas e,
      // até lá, ele continua vindo nas consultas: o portal o esconde na hora.
      // Aviso sem expiresAt válido (ex.: criado à mão no console) não é apagado
      // pelo TTL; ele aparece para o cliente poder excluí-lo ao clicar.
      .filter(
        (n) => !(n.expiresAt instanceof Timestamp) || n.expiresAt.toMillis() > now,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  );
}

// Aviso visualizado (clicado) é excluído. Exclusões independentes: cada uma é
// validada sozinha pelas regras (sem o limite de leituras por batch).
export async function deleteNotifications(notificationIds: string[]) {
  const db = dbOrThrow();
  await Promise.all(
    notificationIds.map((id) => deleteDoc(doc(db, "notifications", id))),
  );
}

export async function deleteClient(clientId: string) {
  await deleteDoc(doc(dbOrThrow(), "clients", clientId));
}
