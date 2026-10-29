import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./config";
import { clearActivity, markActivity } from "./session";

export async function signIn(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado");
  // Antes do login: um horário antigo de outra sessão derrubaria a nova na hora.
  markActivity();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  clearActivity();
  return firebaseSignOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
) {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user?.email) throw new Error("Usuário não autenticado");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
