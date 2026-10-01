const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { buildContractPdf, safeFilename } = require("./contract-pdf");
const { buildContractEmailHtml, makeIdempotencyKey } = require("./contract-email");
const { getContractValidationProblem } = require("./contract-validation");

initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");
const contractEmailFrom = defineString("CONTRACT_EMAIL_FROM");
const appUrl = defineString("APP_URL", {
  default: "https://three-devs.web.app",
});

async function assertDeveloper(uid) {
  if (!uid) {
    throw new HttpsError("unauthenticated", "Faça login para continuar.");
  }

  const snap = await getFirestore().doc(`developers/${uid}`).get();
  if (!snap.exists) {
    throw new HttpsError(
      "permission-denied",
      "Apenas desenvolvedores podem realizar esta operação.",
    );
  }
}

function validateContract(contract) {
  const problem = getContractValidationProblem(contract);
  if (problem) throw new HttpsError(problem.code, problem.message);
}

async function loadContractForDeveloper(request) {
  await assertDeveloper(request.auth?.uid);

  const contractId = String(request.data?.contractId ?? "").trim();
  if (!contractId) {
    throw new HttpsError("invalid-argument", "Contrato não informado.");
  }

  const reference = getFirestore().doc(`contracts/${contractId}`);
  const snapshot = await reference.get();
  if (!snapshot.exists) {
    throw new HttpsError("not-found", "Contrato não encontrado.");
  }

  const contract = { id: snapshot.id, ...snapshot.data() };
  validateContract(contract);
  return { contract, reference };
}

exports.generateContractPdf = onCall(
  { region: "us-central1", memory: "512MiB" },
  async (request) => {
    const { contract } = await loadContractForDeveloper(request);

    try {
      const pdf = await buildContractPdf(contract);
      return {
        filename: safeFilename(contract.title),
        pdfBase64: pdf.toString("base64"),
      };
    } catch (error) {
      console.error("generateContractPdf error:", error);
      throw new HttpsError("internal", "Não foi possível gerar o PDF.");
    }
  },
);

exports.sendContractEmail = onCall(
  {
    region: "us-central1",
    memory: "512MiB",
    secrets: [resendApiKey],
  },
  async (request) => {
    const { contract, reference } = await loadContractForDeveloper(request);
    if (contract.status === "cancelled") {
      throw new HttpsError(
        "failed-precondition",
        "Um contrato cancelado não pode ser enviado.",
      );
    }

    const recipient = String(contract.template.clientEmail).trim().toLowerCase();
    const filename = safeFilename(contract.title);
    const idempotencyKey = makeIdempotencyKey(
      contract.id,
      request.data?.requestId,
    );
    if (!idempotencyKey) {
      throw new HttpsError("invalid-argument", "Identificador de envio inválido.");
    }

    const apiKey = resendApiKey.value().trim();
    const sender = contractEmailFrom.value().trim();
    if (!apiKey || !sender) {
      console.error("Contract email configuration is incomplete.");
      throw new HttpsError(
        "failed-precondition",
        "O envio de e-mail ainda não está configurado.",
      );
    }

    try {
      const pdf = await buildContractPdf(contract);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(20_000),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          from: sender,
          to: [recipient],
          subject: `Contrato para assinatura - ${contract.template.projectName}`,
          html: buildContractEmailHtml(contract, appUrl.value()),
          attachments: [
            {
              filename,
              content: pdf.toString("base64"),
            },
          ],
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        console.error("Resend error:", response.status, details);
        throw new Error(`Resend returned ${response.status}`);
      }

      const result = await response.json();
      if (!result.id) {
        console.error("Resend response did not include an email id.");
        throw new Error("Resend response missing id");
      }

      const sentAt = new Date().toISOString();
      let trackingUpdated = true;
      try {
        await reference.update({
          status: contract.status === "signed" ? "signed" : "sent",
          sentAt: contract.sentAt || sentAt,
          lastEmailSentAt: sentAt,
          sentTo: recipient,
          documentFileName: filename,
          emailMessageId: result.id,
          updatedAt: sentAt,
        });
      } catch (error) {
        trackingUpdated = false;
        console.error("Contract sent but tracking update failed:", error);
      }

      return { ok: true, sentAt, sentTo: recipient, trackingUpdated };
    } catch (error) {
      console.error("sendContractEmail error:", error);
      throw new HttpsError(
        "internal",
        "Não foi possível enviar o contrato por e-mail.",
      );
    }
  },
);

exports.setClientPassword = onCall(
  { region: "us-central1" },
  async (request) => {
    await assertDeveloper(request.auth?.uid);

    const email = String(request.data?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(request.data?.password ?? "");

    if (!email || !email.includes("@")) {
      throw new HttpsError("invalid-argument", "E-mail inválido.");
    }

    if (password.length < 6) {
      throw new HttpsError(
        "invalid-argument",
        "A senha deve ter pelo menos 6 caracteres.",
      );
    }

    const auth = getAuth();

    try {
      const user = await auth.getUserByEmail(email);
      await auth.updateUser(user.uid, { password });
      return { ok: true, created: false };
    } catch (err) {
      if (err?.code === "auth/user-not-found") {
        await auth.createUser({ email, password });
        return { ok: true, created: true };
      }

      console.error("setClientPassword error:", err);
      throw new HttpsError(
        "internal",
        "Não foi possível atualizar a senha do cliente.",
      );
    }
  },
);

exports.provisionDeveloper = onCall(
  { region: "us-central1" },
  async (request) => {
    await assertDeveloper(request.auth?.uid);

    const email = String(request.data?.email ?? "")
      .trim()
      .toLowerCase();
    const name = String(request.data?.name ?? "").trim();
    const password = String(request.data?.password ?? "");
    const role = String(request.data?.role ?? "admin");

    if (!email || !email.includes("@")) {
      throw new HttpsError("invalid-argument", "E-mail inválido.");
    }
    if (!name) {
      throw new HttpsError("invalid-argument", "Nome é obrigatório.");
    }
    if (password.length < 6) {
      throw new HttpsError(
        "invalid-argument",
        "A senha deve ter pelo menos 6 caracteres.",
      );
    }

    const auth = getAuth();
    const db = getFirestore();
    let uid;
    let created = false;

    try {
      const existing = await auth.getUserByEmail(email);
      uid = existing.uid;
      await auth.updateUser(uid, { password });
    } catch (err) {
      if (err?.code === "auth/user-not-found") {
        const user = await auth.createUser({ email, password });
        uid = user.uid;
        created = true;
      } else {
        console.error("provisionDeveloper auth error:", err);
        throw new HttpsError(
          "internal",
          "Não foi possível provisionar o desenvolvedor.",
        );
      }
    }

    await db.doc(`developers/${uid}`).set(
      {
        email,
        name,
        role: role === "developer" ? "developer" : "admin",
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return { ok: true, created, uid };
  },
);
