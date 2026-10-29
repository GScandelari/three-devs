"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { signOut, subscribeToAuth } from "@/lib/firebase/auth";
import {
  flagSessionExpired,
  getLastActivity,
  isSessionIdleExpired,
  markActivity,
} from "@/lib/firebase/session";
import { getClientByEmail, getDeveloperByUid } from "@/lib/firebase/firestore";
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
      // Sessão restaurada depois de 15 minutos sem atividade (aba fechada,
      // computador suspenso): encerra antes de exibir qualquer página logada.
      // O signOut dispara este callback de novo, já sem usuário.
      if (firebaseUser && isSessionIdleExpired()) {
        flagSessionExpired();
        await signOut();
        return;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        // Sessões abertas antes deste controle existir começam a contar agora.
        if (getLastActivity() === null) markActivity();
        const [devData, clientData] = await Promise.all([
          getDeveloperByUid(firebaseUser.uid),
          firebaseUser.email
            ? getClientByEmail(firebaseUser.email)
            : Promise.resolve(null),
        ]);

        setDeveloper(devData);
        setClient(clientData);
        // Todo cliente cadastrado entra no portal, mesmo sem projeto ou contrato
        // assinado: os projetos ainda não assinados aparecem bloqueados.
        setHasPortalAccess(Boolean(devData || clientData));
      } else {
        setDeveloper(null);
        setClient(null);
        setHasPortalAccess(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [firebaseConfigured]);

  useEffect(() => {
    if (!user) return;

    let lastWrite = 0;
    function handleActivity() {
      const now = Date.now();
      // Eventos como mousemove disparam dezenas de vezes por segundo.
      if (now - lastWrite < 10_000) return;
      lastWrite = now;
      markActivity(now);
    }

    function checkIdle() {
      if (!isSessionIdleExpired()) return;
      flagSessionExpired();
      void signOut();
    }

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ] as const;
    activityEvents.forEach((name) =>
      window.addEventListener(name, handleActivity, { passive: true }),
    );
    // O navegador desacelera timers em abas ocultas; ao voltar, confere na hora.
    document.addEventListener("visibilitychange", checkIdle);
    window.addEventListener("focus", checkIdle);
    const interval = window.setInterval(checkIdle, 30_000);

    return () => {
      activityEvents.forEach((name) =>
        window.removeEventListener(name, handleActivity),
      );
      document.removeEventListener("visibilitychange", checkIdle);
      window.removeEventListener("focus", checkIdle);
      window.clearInterval(interval);
    };
  }, [user]);

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

// null: conta no Firebase Auth sem cadastro em clients (ou com e-mail
// diferente). Quem chama encerra a sessão e responde como credencial inválida,
// para não revelar que a conta existe.
export async function resolvePostLoginRoute(
  uid: string,
  email: string,
): Promise<string | null> {
  const developer = await getDeveloperByUid(uid);
  if (developer) {
    if (developer.mustChangePassword) return "/change-password";
    return "/admin";
  }

  const client = await getClientByEmail(email);
  if (client?.mustChangePassword) return "/change-password";
  if (client) return "/portal";

  return null;
}
