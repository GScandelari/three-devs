// Testes de firestore.rules contra o emulador local do Firestore.
// Rodar com `npm run test:rules` (precisa de Java 21+ instalado).
// Usa um projeto "demo-*", que só existe no emulador: nenhum dado real é tocado.
import { readFileSync } from "node:fs";
import { after, before, beforeEach, describe, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const NOW = "2026-09-30T12:00:00.000Z";

let env;
let dev;
let clientA;
let clientB;
let anon;

function validNotification(overrides = {}) {
  return {
    clientId: "cA",
    type: "project_note",
    title: "App XYZ: nova atualização",
    projectId: "p1",
    createdAt: NOW,
    readAt: null,
    ...overrides,
  };
}

function without(data, key) {
  const copy = { ...data };
  delete copy[key];
  return copy;
}

function contractNotification(overrides = {}) {
  return without(
    validNotification({
      type: "contract_signed",
      title: "Contrato assinado: Contrato App XYZ",
      contractId: "k1",
      ...overrides,
    }),
    "projectId",
  );
}

before(async () => {
  // Host e porta vêm de FIRESTORE_EMULATOR_HOST, definido pelo emulators:exec.
  env = await initializeTestEnvironment({
    projectId: "demo-three-devs",
    firestore: {
      rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8"),
    },
  });
  dev = env.authenticatedContext("dev1", { email: "dev@x.com" }).firestore();
  clientA = env.authenticatedContext("uA", { email: "a@x.com" }).firestore();
  clientB = env.authenticatedContext("uB", { email: "b@x.com" }).firestore();
  anon = env.unauthenticatedContext().firestore();
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "developers/dev1"), { email: "dev@x.com", name: "Dev" });
    await setDoc(doc(db, "clients/cA"), {
      email: "a@x.com",
      name: "Cliente A",
      onboardingComplete: false,
    });
    await setDoc(doc(db, "clients/cB"), {
      email: "b@x.com",
      name: "Cliente B",
      onboardingComplete: false,
    });
    await setDoc(doc(db, "projects/p1"), {
      clientId: "cA",
      name: "App XYZ",
      status: "in_progress",
      notes: [],
      links: [],
      updatedAt: NOW,
    });
    await setDoc(doc(db, "contracts/k1"), {
      clientId: "cA",
      projectId: "p1",
      status: "sent",
      title: "Contrato App XYZ",
    });
    await setDoc(doc(db, "notifications/nA1"), validNotification());
    await setDoc(
      doc(db, "notifications/nB1"),
      validNotification({ clientId: "cB", projectId: "p2" }),
    );
  });
});

describe("criação de avisos", () => {
  test("desenvolvedor cria aviso de projeto válido", async () => {
    await assertSucceeds(
      setDoc(doc(dev, "notifications/new1"), validNotification()),
    );
  });

  test("desenvolvedor cria aviso de contrato (contractId, sem projectId)", async () => {
    await assertSucceeds(
      setDoc(doc(dev, "notifications/new2"), contractNotification()),
    );
  });

  test("rejeita aviso já criado como lido", async () => {
    await assertFails(
      setDoc(doc(dev, "notifications/x"), validNotification({ readAt: NOW })),
    );
  });

  test("rejeita tipo desconhecido", async () => {
    await assertFails(
      setDoc(doc(dev, "notifications/x"), validNotification({ type: "spam" })),
    );
  });

  test("rejeita campo extra", async () => {
    await assertFails(
      setDoc(doc(dev, "notifications/x"), validNotification({ body: "x" })),
    );
  });

  test("rejeita título vazio e título acima de 300 caracteres", async () => {
    await assertFails(
      setDoc(doc(dev, "notifications/x"), validNotification({ title: "" })),
    );
    await assertFails(
      setDoc(
        doc(dev, "notifications/x"),
        validNotification({ title: "a".repeat(301) }),
      ),
    );
  });

  test("aceita título com 200 caracteres acentuados (limite do app)", async () => {
    await assertSucceeds(
      setDoc(
        doc(dev, "notifications/x"),
        validNotification({ title: "ç".repeat(200) }),
      ),
    );
  });

  test("rejeita aviso sem createdAt ou sem readAt", async () => {
    await assertFails(
      setDoc(doc(dev, "notifications/x"), without(validNotification(), "createdAt")),
    );
    await assertFails(
      setDoc(doc(dev, "notifications/y"), without(validNotification(), "readAt")),
    );
  });

  test("cliente não cria aviso (nem para si mesmo)", async () => {
    await assertFails(
      setDoc(doc(clientA, "notifications/x"), validNotification()),
    );
  });

  test("visitante sem login não cria aviso", async () => {
    await assertFails(setDoc(doc(anon, "notifications/x"), validNotification()));
  });
});

describe("leitura de avisos", () => {
  test("cliente lê o próprio aviso", async () => {
    await assertSucceeds(getDoc(doc(clientA, "notifications/nA1")));
  });

  test("cliente não lê aviso de outro cliente", async () => {
    await assertFails(getDoc(doc(clientA, "notifications/nB1")));
  });

  test("consulta do sininho (where clientId == próprio) retorna só os próprios", async () => {
    const snap = await assertSucceeds(
      getDocs(
        query(collection(clientA, "notifications"), where("clientId", "==", "cA")),
      ),
    );
    const ids = snap.docs.map((d) => d.id);
    if (ids.length !== 1 || ids[0] !== "nA1") {
      throw new Error(`esperava só nA1, veio ${ids.join(", ")}`);
    }
  });

  test("cliente não consulta avisos de outro cliente", async () => {
    await assertFails(
      getDocs(
        query(collection(clientA, "notifications"), where("clientId", "==", "cB")),
      ),
    );
  });

  test("cliente não lista a coleção inteira", async () => {
    await assertFails(getDocs(collection(clientA, "notifications")));
  });

  test("visitante sem login não lê avisos", async () => {
    await assertFails(getDoc(doc(anon, "notifications/nA1")));
    await assertFails(getDocs(collection(anon, "notifications")));
  });

  test("desenvolvedor lê todos os avisos", async () => {
    await assertSucceeds(getDocs(collection(dev, "notifications")));
  });
});

describe("marcar como lido", () => {
  test("cliente marca o próprio aviso como lido", async () => {
    await assertSucceeds(
      updateDoc(doc(clientA, "notifications/nA1"), { readAt: NOW }),
    );
  });

  test("cliente não altera outros campos", async () => {
    await assertFails(
      updateDoc(doc(clientA, "notifications/nA1"), { title: "outro" }),
    );
    await assertFails(
      updateDoc(doc(clientA, "notifications/nA1"), {
        readAt: NOW,
        clientId: "cB",
      }),
    );
  });

  test("cliente não grava readAt que não seja texto", async () => {
    await assertFails(
      updateDoc(doc(clientA, "notifications/nA1"), { readAt: 123 }),
    );
  });

  test("cliente não marca aviso de outro cliente", async () => {
    await assertFails(
      updateDoc(doc(clientA, "notifications/nB1"), { readAt: NOW }),
    );
  });

  test("desenvolvedor não altera aviso existente", async () => {
    await assertFails(
      updateDoc(doc(dev, "notifications/nA1"), { title: "outro" }),
    );
  });

  test("marca 30 avisos como lidos de uma vez (Marcar todos como lidos)", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      for (let i = 0; i < 30; i++) {
        await setDoc(doc(db, `notifications/bulk${i}`), validNotification());
      }
    });
    await assertSucceeds(
      Promise.all(
        Array.from({ length: 30 }, (_, i) =>
          updateDoc(doc(clientA, `notifications/bulk${i}`), { readAt: NOW }),
        ),
      ),
    );
  });
});

describe("apagar avisos", () => {
  test("ninguém apaga aviso pelo app", async () => {
    await assertFails(deleteDoc(doc(dev, "notifications/nA1")));
    await assertFails(deleteDoc(doc(clientA, "notifications/nA1")));
  });
});

describe("fluxos do admin (mesma forma das transações do app)", () => {
  test("nota + aviso na mesma transação", async () => {
    await assertSucceeds(
      runTransaction(dev, async (tx) => {
        const ref = doc(dev, "projects/p1");
        const snap = await tx.get(ref);
        tx.update(ref, {
          notes: [...snap.data().notes, { id: "n1", content: "Olá" }],
          updatedAt: NOW,
        });
        tx.set(doc(dev, "notifications/txNote"), validNotification());
      }),
    );
    const created = await getDoc(doc(dev, "notifications/txNote"));
    if (!created.exists()) throw new Error("aviso não foi gravado");
  });

  test("aviso inválido derruba a transação inteira (nada é salvo)", async () => {
    await assertFails(
      runTransaction(dev, async (tx) => {
        const ref = doc(dev, "projects/p1");
        await tx.get(ref);
        tx.update(ref, { status: "review", updatedAt: NOW });
        tx.set(
          doc(dev, "notifications/txBad"),
          validNotification({ type: "spam" }),
        );
      }),
    );
    const project = await getDoc(doc(dev, "projects/p1"));
    if (project.data().status !== "in_progress") {
      throw new Error("status foi alterado mesmo com a transação rejeitada");
    }
  });

  test("contrato assinado: contrato + cliente + aviso na mesma transação", async () => {
    await assertSucceeds(
      runTransaction(dev, async (tx) => {
        const ref = doc(dev, "contracts/k1");
        const snap = await tx.get(ref);
        tx.update(ref, { status: "signed", signedAt: NOW });
        tx.update(doc(dev, "clients", snap.data().clientId), {
          onboardingComplete: true,
        });
        tx.set(doc(dev, "notifications/txContract"), contractNotification());
      }),
    );
  });

  test("cliente não executa a transação do admin", async () => {
    await assertFails(
      runTransaction(clientA, async (tx) => {
        const ref = doc(clientA, "projects/p1");
        await tx.get(ref);
        tx.update(ref, { status: "delivered" });
        tx.set(doc(clientA, "notifications/txClient"), validNotification());
      }),
    );
  });
});

describe("regras existentes continuam funcionando", () => {
  test("cliente lê os próprios projetos e não os de outro", async () => {
    await assertSucceeds(
      getDocs(
        query(collection(clientA, "projects"), where("clientId", "==", "cA")),
      ),
    );
    await assertFails(getDoc(doc(clientB, "projects/p1")));
  });

  test("cliente não altera projeto", async () => {
    await assertFails(
      updateDoc(doc(clientA, "projects/p1"), { status: "delivered" }),
    );
  });
});
