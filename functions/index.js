const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

async function assertDeveloper(uid) {
  if (!uid) {
    throw new HttpsError("unauthenticated", "Faça login para continuar.");
  }

  const snap = await getFirestore().doc(`developers/${uid}`).get();
  if (!snap.exists) {
    throw new HttpsError(
      "permission-denied",
      "Apenas desenvolvedores podem alterar senhas.",
    );
  }
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
