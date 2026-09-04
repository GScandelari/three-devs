"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/firebase/auth";
import {
  getClientByEmail,
  getDeveloperByUid,
  clientHasSignedContract,
} from "@/lib/firebase/firestore";
import type { Client, Developer } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase/config";

interface AuthContextValue {
  user: User | null;
  client: Client | null;
  developer: Developer | null;
  isDeveloper: boolean;
  hasPortalAccess: boolean;
  loading: boolean;
  firebaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  client: null,
  developer: null,
  isDeveloper: false,
  hasPortalAccess: false,
  loading: true,
  firebaseConfigured: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseConfigured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [hasPortalAccess, setHasPortalAccess] = useState(false);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;

    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const [devData, clientData] = await Promise.all([
          getDeveloperByUid(firebaseUser.uid),
          firebaseUser.email
            ? getClientByEmail(firebaseUser.email)
            : Promise.resolve(null),
        ]);

        setDeveloper(devData);
        setClient(clientData);

        if (devData) {
          setHasPortalAccess(true);
        } else if (clientData) {
          const hasAccess = await clientHasSignedContract(clientData.id);
          setHasPortalAccess(hasAccess);
        } else {
          setHasPortalAccess(false);
        }
      } else {
        setDeveloper(null);
        setClient(null);
        setHasPortalAccess(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [firebaseConfigured]);

  return (
    <AuthContext.Provider
      value={{
        user,
        client,
        developer,
        isDeveloper: Boolean(developer),
        hasPortalAccess,
        loading,
        firebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function resolvePostLoginRoute(
  uid: string,
  email: string,
): Promise<string> {
  const developer = await getDeveloperByUid(uid);
  if (developer) {
    if (developer.mustChangePassword) return "/change-password";
    return "/admin";
  }

  const client = await getClientByEmail(email);
  if (client && (await clientHasSignedContract(client.id))) return "/portal";

  return "/login?pending=contract";
}
