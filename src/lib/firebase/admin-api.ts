import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "./config";

export async function setClientPassword(
  clientId: string,
  password: string,
  mustChangePassword: boolean,
): Promise<{ ok: boolean; created: boolean }> {
  const functions = getFirebaseFunctions();
  if (!functions) throw new Error("Firebase não configurado");

  const callable = httpsCallable<
    { clientId: string; password: string; mustChangePassword: boolean },
    { ok: boolean; created: boolean }
  >(functions, "setClientPassword");

  const result = await callable({ clientId, password, mustChangePassword });
  return result.data;
}

export async function sendClientWelcome(
  clientId: string,
): Promise<{ ok: boolean; sentAt: string }> {
  const functions = getFirebaseFunctions();
  if (!functions) throw new Error("Firebase não configurado");

  const callable = httpsCallable<
    { clientId: string },
    { ok: boolean; sentAt: string }
  >(functions, "sendClientWelcome");

  const result = await callable({ clientId });
  return result.data;
}

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: boolean }> {
  const functions = getFirebaseFunctions();
  if (!functions) throw new Error("Firebase não configurado");

  const callable = httpsCallable<{ email: string }, { ok: boolean }>(
    functions,
    "requestPasswordReset",
  );

  const result = await callable({ email });
  return result.data;
}

export async function completePasswordReset(
  token: string,
  password: string,
): Promise<{ ok: boolean; email?: string }> {
  const functions = getFirebaseFunctions();
  if (!functions) throw new Error("Firebase não configurado");

  const callable = httpsCallable<
    { token: string; password: string },
    { ok: boolean; email?: string }
  >(functions, "completePasswordReset");

  const result = await callable({ token, password });
  return result.data;
}

export async function generateContractPdf(
  contractId: string,
): Promise<{ filename: string; pdfBase64: string }> {
  const functions = getFirebaseFunctions();
  if (!functions) throw new Error("Firebase não configurado");

  const callable = httpsCallable<
    { contractId: string },
    { filename: string; pdfBase64: string }
  >(functions, "generateContractPdf");

  const result = await callable({ contractId });
  return result.data;
}

export async function sendContractEmail(
  contractId: string,
): Promise<{
  ok: boolean;
  sentAt: string;
  sentTo: string;
  trackingUpdated: boolean;
}> {
  const functions = getFirebaseFunctions();
  if (!functions) throw new Error("Firebase não configurado");

  const callable = httpsCallable<
    { contractId: string; requestId: string },
    {
      ok: boolean;
      sentAt: string;
      sentTo: string;
      trackingUpdated: boolean;
    }
  >(functions, "sendContractEmail");

  const result = await callable({ contractId, requestId: crypto.randomUUID() });
  return result.data;
}
