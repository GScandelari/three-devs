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
