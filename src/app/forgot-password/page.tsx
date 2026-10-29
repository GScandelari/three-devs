"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/firebase/admin-api";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch {
      setError("Não foi possível solicitar a redefinição. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold text-slate-900">
            Three<span className="text-indigo-600">Devs</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">Recuperar acesso</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Esqueci minha senha
          </h1>

          {sent ? (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                Se houver uma conta para <strong>{email}</strong>, você
                receberá em instantes um e-mail com o link para redefinir a
                senha.
              </p>
              <p>
                O link vale por 30 minutos. Cada novo pedido substitui o link
                anterior: use sempre o e-mail mais recente.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mt-1 text-sm text-slate-500">
                Informe o e-mail da sua conta. Enviaremos um link para você
                criar uma nova senha.
              </p>

              <div className="mt-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="seu@email.com"
                />
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-2.5"
              >
                {loading ? "Enviando..." : "Enviar link"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
