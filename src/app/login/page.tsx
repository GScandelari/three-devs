"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/firebase/auth";
import { resolvePostLoginRoute } from "@/contexts/AuthContext";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingContract = searchParams.get("pending") === "contract";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!getFirebaseAuth()) {
      setError("O acesso está indisponível: a configuração do Firebase está ausente.");
      return;
    }
    setLoading(true);

    try {
      await signIn(email, password);
      const user = getFirebaseAuth()?.currentUser;
      if (user?.email) {
        router.push(await resolvePostLoginRoute(user.uid, user.email));
      } else {
        router.push("/portal");
      }
    } catch {
      setError("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="w-full max-w-md py-8">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Three<span className="text-indigo-600 dark:text-indigo-400">Devs</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Acesso ao sistema</p>
        </div>

        {pendingContract && (
          <div className="mb-6 rounded-lg border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 p-4 text-sm text-amber-800 dark:text-amber-300">
            Seu acesso ao portal será liberado após a assinatura do contrato.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Entrar</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Use as credenciais enviadas pela equipe Three Devs.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/25"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/25"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-2.5"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <ThemeProvider>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </ThemeProvider>
    </>
  );
}
