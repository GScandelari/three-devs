import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "./config";

export async function setClientPassword(
  email: string,
  password: string,
): Promise<{ ok: boolean; created: boolean }> {
  const functions = getFirebaseFunctions();
  if (!functions) throw new Error("Firebase não configurado");

  const callable = httpsCallable<
    { email: string; password: string },
    { ok: boolean; created: boolean }
  >(functions, "setClientPassword");

  const result = await callable({ email, password });
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
): Promise<{ ok: boolean; sentAt: string; sentTo: string }> {
  const functions = getFirebaseFunctions();
  if (!functions) throw new Error("Firebase não configurado");

  const callable = httpsCallable<
    { contractId: string },
    { ok: boolean; sentAt: string; sentTo: string }
  >(functions, "sendContractEmail");

  const result = await callable({ contractId });
  return result.data;
}
