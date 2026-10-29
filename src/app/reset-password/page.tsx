"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { completePasswordReset } from "@/lib/firebase/admin-api";
import { signOut } from "@/lib/firebase/auth";
import { Button, LinkButton } from "@/components/ui/Button";

// Página aberta pelos links dos e-mails de boas-vindas (72 h) e de
// redefinição de senha (30 min). A validade é conferida pela Cloud Function.
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("A confirmação da senha não confere.");
      return;
    }

    setSaving(true);
    try {
      await completePasswordReset(token, newPassword);
      // A função encerra as sessões abertas; o usuário entra de novo com a nova senha.
      await signOut();
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível salvar a nova senha.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!token) {
    return (
      <Card title="Link inválido">
        <p className="mt-2 text-sm text-slate-600">
          Este link está incompleto. Solicite um novo em{" "}
          <Link
            href="/forgot-password"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Esqueci minha senha
          </Link>
          .
        </p>
      </Card>
    );
  }

  if (done) {
    return (
      <Card title="Senha definida">
        <p className="mt-2 text-sm text-slate-600">
          Sua senha foi salva. Agora é só entrar com o seu e-mail e a nova
          senha.
        </p>
        <LinkButton href="/login" className="mt-6 w-full py-2.5">
          Ir para o login
        </LinkButton>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card title="Definir nova senha">
        <p className="mt-1 text-sm text-slate-500">
          Escolha uma senha com pelo menos 6 caracteres.
        </p>

        <div className="mt-6 space-y-4">
          <Field
            label="Nova senha"
            value={newPassword}
            onChange={setNewPassword}
          />
          <Field
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}{" "}
            {error.includes("expirou") && (
              <Link
                href="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Solicitar novo link
              </Link>
            )}
          </p>
        )}

        <Button type="submit" disabled={saving} className="mt-6 w-full py-2.5">
          {saving ? "Salvando..." : "Salvar senha"}
        </Button>
      </Card>
    </form>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="password"
        required
        autoComplete="new-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold text-slate-900">
            Three<span className="text-indigo-600">Devs</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">Acesso ao sistema</p>
        </div>

        <Suspense
          fallback={<p className="text-center text-sm text-slate-500">Carregando...</p>}
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
