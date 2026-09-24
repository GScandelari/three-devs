const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { buildContractPdf, safeFilename } = require("./contract-pdf");

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
  if (!contract) {
    throw new HttpsError("not-found", "Contrato não encontrado.");
  }

  const template = contract.template || {};
  const requiredFields = [
    ["clientName", "nome do cliente"],
    ["clientEmail", "e-mail do cliente"],
    ["projectName", "nome do projeto"],
    ["servicesDescription", "descrição dos serviços"],
    ["totalValue", "valor total"],
    ["commencementDate", "data de início"],
    ["conclusionDate", "data de conclusão"],
  ];
  const missing = requiredFields
    .filter(([key]) => !String(template[key] ?? "").trim())
    .map(([, label]) => label);

  if (missing.length) {
    throw new HttpsError(
      "failed-precondition",
      `Preencha antes de gerar: ${missing.join(", ")}.`,
    );
  }

  if (!String(template.clientEmail).includes("@")) {
    throw new HttpsError("invalid-argument", "E-mail do cliente inválido.");
  }
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

    try {
      const pdf = await buildContractPdf(contract);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey.value()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: contractEmailFrom.value(),
          to: [recipient],
          subject: `Contrato para assinatura - ${contract.template.projectName}`,
          html: `
            <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.6;max-width:620px;margin:0 auto">
              <p style="color:#4f46e5;font-size:12px;font-weight:700;letter-spacing:1.4px">THREE DEVS</p>
              <h1 style="font-size:24px;line-height:1.25;margin:12px 0">Seu contrato está pronto</h1>
              <p>Olá, ${escapeHtml(contract.template.clientName)}.</p>
              <p>Segue em anexo o contrato de prestação de serviços referente ao projeto <strong>${escapeHtml(contract.template.projectName)}</strong>.</p>
              <p>Revise o documento e responda este e-mail caso tenha alguma dúvida. O acesso ao portal será liberado depois que a assinatura for confirmada.</p>
              <p style="margin:28px 0"><a href="${escapeHtml(appUrl.value())}/login/" style="background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;padding:12px 18px;display:inline-block">Acessar a Three Devs</a></p>
              <p style="color:#64748b;font-size:13px">Atenciosamente,<br>Equipe Three Devs</p>
            </div>
          `,
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
      const sentAt = new Date().toISOString();
      await reference.update({
        status: contract.status === "signed" ? "signed" : "sent",
        sentAt: contract.sentAt || sentAt,
        lastEmailSentAt: sentAt,
        sentTo: recipient,
        documentFileName: filename,
        emailMessageId: result.id || "",
        updatedAt: sentAt,
      });

      return { ok: true, sentAt, sentTo: recipient };
    } catch (error) {
      console.error("sendContractEmail error:", error);
      throw new HttpsError(
        "internal",
        "Não foi possível enviar o contrato por e-mail.",
      );
    }
  },
);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
