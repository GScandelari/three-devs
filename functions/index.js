const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { buildContractPdf, safeFilename } = require("./contract-pdf");
const {
  buildContractEmailHtml,
  buildReplyToField,
  makeIdempotencyKey,
} = require("./contract-email");
const { getContractValidationProblem } = require("./contract-validation");
const {
  MIN_PASSWORD_LENGTH,
  PASSWORD_TOKEN_TTL_MS,
  buildPasswordLink,
  buildResetEmailHtml,
  buildWelcomeEmailHtml,
  createPasswordToken,
  hashPasswordToken,
  isValidTokenFormat,
} = require("./password-email");

initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");
const contractEmailFrom = defineString("CONTRACT_EMAIL_FROM");
const appUrl = defineString("APP_URL", {
  default: "https://serifalabs.com",
});
// Opcional: endereço que recebe as respostas dos clientes (reply_to).
const emailReplyTo = defineString("EMAIL_REPLY_TO", { default: "" });

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

    const { apiKey, sender, replyTo } = readEmailConfig();

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
          ...replyTo,
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

function readEmailConfig() {
  const apiKey = resendApiKey.value().trim();
  const sender = contractEmailFrom.value().trim();
  if (!apiKey || !sender) {
    console.error("Email configuration is incomplete.");
    throw new HttpsError(
      "failed-precondition",
      "O envio de e-mail ainda não está configurado.",
    );
  }
  return { apiKey, sender, replyTo: buildReplyToField(emailReplyTo.value()) };
}

async function sendEmail({ to, subject, html }) {
  const { apiKey, sender, replyTo } = readEmailConfig();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(20_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: sender, to: [to], ...replyTo, subject, html }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Resend error:", response.status, details);
    throw new Error(`Resend returned ${response.status}`);
  }
}

// Grava o link de senha do usuário. O documento usa o uid como id, então cada
// novo link substitui o anterior: só o último enviado funciona.
async function issuePasswordToken(uid, email, purpose) {
  const { token, tokenHash } = createPasswordToken();
  const now = Date.now();
  await getFirestore()
    .doc(`passwordTokens/${uid}`)
    .set({
      tokenHash,
      purpose,
      email,
      createdAt: Timestamp.fromMillis(now),
      expiresAt: Timestamp.fromMillis(now + PASSWORD_TOKEN_TTL_MS[purpose]),
    });
  return token;
}

async function findClientByEmail(email) {
  const snapshot = await getFirestore()
    .collection("clients")
    .where("email", "==", email)
    .limit(1)
    .get();
  return snapshot.empty ? null : snapshot.docs[0];
}

function validatePassword(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpsError(
      "invalid-argument",
      `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }
}

async function loadClientForDeveloper(request) {
  await assertDeveloper(request.auth?.uid);

  const clientId = String(request.data?.clientId ?? "").trim();
  if (!clientId) {
    throw new HttpsError("invalid-argument", "Cliente não informado.");
  }

  const reference = getFirestore().doc(`clients/${clientId}`);
  const snapshot = await reference.get();
  if (!snapshot.exists) {
    throw new HttpsError("not-found", "Cliente não encontrado.");
  }

  const client = snapshot.data();
  const email = String(client.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new HttpsError("failed-precondition", "O cliente não tem e-mail válido.");
  }

  return { client, email, reference };
}

exports.sendClientWelcome = onCall(
  { region: "us-central1", secrets: [resendApiKey] },
  async (request) => {
    const { client, email, reference } = await loadClientForDeveloper(request);
    readEmailConfig();

    const auth = getAuth();
    let uid;
    try {
      uid = (await auth.getUserByEmail(email)).uid;
    } catch (err) {
      if (err?.code !== "auth/user-not-found") {
        console.error("sendClientWelcome auth error:", err);
        throw new HttpsError("internal", "Não foi possível criar o acesso do cliente.");
      }
      // Conta sem senha: o cliente só entra depois de defini-la pelo link.
      uid = (await auth.createUser({ email, displayName: client.name || undefined })).uid;
    }

    try {
      const token = await issuePasswordToken(uid, email, "welcome");
      await sendEmail({
        to: email,
        subject: "Boas-vindas à Three Devs - defina sua senha",
        html: buildWelcomeEmailHtml({
          name: client.name,
          link: buildPasswordLink(appUrl.value(), token),
          appUrl: appUrl.value(),
        }),
      });
    } catch (error) {
      console.error("sendClientWelcome error:", error);
      throw new HttpsError(
        "internal",
        "Não foi possível enviar o e-mail de boas-vindas.",
      );
    }

    const sentAt = new Date().toISOString();
    await reference.update({ welcomeEmailSentAt: sentAt });
    return { ok: true, sentAt };
  },
);

// Pública (tela de login). Responde sempre da mesma forma para não revelar
// quais e-mails têm conta.
exports.requestPasswordReset = onCall(
  { region: "us-central1", secrets: [resendApiKey] },
  async (request) => {
    const email = String(request.data?.email ?? "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) {
      throw new HttpsError("invalid-argument", "E-mail inválido.");
    }

    try {
      let user;
      try {
        user = await getAuth().getUserByEmail(email);
      } catch (err) {
        if (err?.code === "auth/user-not-found") return { ok: true };
        throw err;
      }

      // Evita disparos repetidos em sequência (cliques duplos, abuso).
      const current = await getFirestore().doc(`passwordTokens/${user.uid}`).get();
      const lastCreatedAt = current.exists ? current.get("createdAt")?.toMillis() : 0;
      if (lastCreatedAt && Date.now() - lastCreatedAt < 60_000) {
        return { ok: true };
      }

      const clientDoc = await findClientByEmail(email);
      const name = clientDoc?.get("name") || user.displayName || "";
      const token = await issuePasswordToken(user.uid, email, "reset");
      await sendEmail({
        to: email,
        subject: "Redefinição de senha - Three Devs",
        html: buildResetEmailHtml({
          name,
          link: buildPasswordLink(appUrl.value(), token),
        }),
      });
    } catch (error) {
      console.error("requestPasswordReset error:", error);
    }

    return { ok: true };
  },
);

// Pública (página aberta pelo link do e-mail).
exports.completePasswordReset = onCall(
  { region: "us-central1" },
  async (request) => {
    const token = String(request.data?.token ?? "").trim();
    const password = String(request.data?.password ?? "");
    const invalidLink = new HttpsError(
      "failed-precondition",
      'Este link é inválido ou expirou. Solicite um novo em "Esqueci minha senha" na tela de login.',
    );

    if (!isValidTokenFormat(token)) throw invalidLink;
    validatePassword(password);

    const db = getFirestore();
    const snapshot = await db
      .collection("passwordTokens")
      .where("tokenHash", "==", hashPasswordToken(token))
      .limit(1)
      .get();
    if (snapshot.empty) throw invalidLink;

    const tokenDoc = snapshot.docs[0];
    if (tokenDoc.get("expiresAt").toMillis() <= Date.now()) {
      await tokenDoc.ref.delete();
      throw invalidLink;
    }

    const uid = tokenDoc.id;
    const auth = getAuth();
    let email;
    try {
      const user = await auth.updateUser(uid, { password, emailVerified: true });
      email = user.email;
      await auth.revokeRefreshTokens(uid);
    } catch (error) {
      console.error("completePasswordReset auth error:", error);
      throw new HttpsError("internal", "Não foi possível salvar a nova senha.");
    }

    await tokenDoc.ref.delete();

    // A senha foi escolhida pelo próprio usuário: não precisa trocá-la de novo.
    const clientDoc = email ? await findClientByEmail(email) : null;
    if (clientDoc?.get("mustChangePassword")) {
      await clientDoc.ref.update({ mustChangePassword: false });
    }
    const developerRef = db.doc(`developers/${uid}`);
    if ((await developerRef.get()).get("mustChangePassword")) {
      await developerRef.update({ mustChangePassword: false });
    }

    return { ok: true, email };
  },
);

exports.setClientPassword = onCall(
  { region: "us-central1" },
  async (request) => {
    const { client, email, reference } = await loadClientForDeveloper(request);
    const password = String(request.data?.password ?? "");
    const mustChangePassword = request.data?.mustChangePassword !== false;
    validatePassword(password);

    const auth = getAuth();
    let uid;
    let created = false;

    try {
      const user = await auth.getUserByEmail(email);
      uid = user.uid;
      await auth.updateUser(uid, { password });
      await auth.revokeRefreshTokens(uid);
    } catch (err) {
      if (err?.code !== "auth/user-not-found") {
        console.error("setClientPassword error:", err);
        throw new HttpsError(
          "internal",
          "Não foi possível atualizar a senha do cliente.",
        );
      }
      uid = (
        await auth.createUser({
          email,
          password,
          displayName: client.name || undefined,
        })
      ).uid;
      created = true;
    }

    // A senha definida pelo admin passa a valer; links pendentes deixam de valer.
    await getFirestore().doc(`passwordTokens/${uid}`).delete();
    await reference.update({ mustChangePassword });

    return { ok: true, created };
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
