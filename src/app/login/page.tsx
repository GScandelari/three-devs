"use client";

import { Suspense, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "@/lib/firebase/auth";
import {
  clearSessionExpiredFlag,
  wasSessionExpired,
} from "@/lib/firebase/session";
import { resolvePostLoginRoute } from "@/contexts/AuthContext";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  AuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/auth/AuthShell";

// Mesma mensagem para senha errada e para conta sem cadastro de cliente: a tela
// não confirma se o e-mail existe.
const INVALID_CREDENTIALS =
  "Não foi possível entrar. Verifique suas credenciais.";

// O flag de sessão expirada não muda enquanto a tela está aberta.
const subscribeNoop = () => () => {};

function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // A página é pré-renderizada no build, sem sessionStorage: no servidor o
  // aviso nunca aparece; no navegador lê o flag depois da hidratação.
  const sessionExpired = useSyncExternalStore(
    subscribeNoop,
    wasSessionExpired,
    () => false,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    clearSessionExpiredFlag();

    try {
      await signIn(email, password);
      const user = getFirebaseAuth()?.currentUser;
      const route = user?.email
        ? await resolvePostLoginRoute(user.uid, user.email)
        : null;
      if (!route) {
        // Conta sem cadastro de cliente: mesma resposta de senha errada.
        await signOut();
        setError(INVALID_CREDENTIALS);
        return;
      }
      router.push(route);
    } catch {
      setError(INVALID_CREDENTIALS);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      subtitle="Portal do cliente e painel da equipe"
      footer={
        <Link
          href="/"
          className="font-medium text-signal hover:text-signal-hover"
        >
          ← Voltar ao site
        </Link>
      }
    >
      <h1 className="font-serif text-[2.6rem] leading-none tracking-[-0.02em]">
        Entrar
      </h1>
      <p className="mt-3 text-[0.95rem] text-muted">
        Use o e-mail e a senha enviados pela equipe Serifa Labs.
      </p>

      {sessionExpired && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          Sua sessão foi encerrada após 15 minutos de inatividade. Entre
          novamente para continuar.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className={authLabelClass}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className={authLabelClass}>
                Senha
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-signal hover:text-signal-hover"
              >
                Esqueci minha senha
              </Link>
            </div>
            <PasswordInput
              id="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              wrapperClassName="mt-1.5"
              className={authInputClass.replace("mt-1.5 ", "")}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="mt-8 min-h-12 w-full rounded-xl text-[0.95rem]"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <p className="text-sm text-muted">Carregando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
