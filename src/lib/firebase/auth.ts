import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./config";

export async function signIn(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase não configurado");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  const auth = getFirebaseAuth();
  if (!auth) return;
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
