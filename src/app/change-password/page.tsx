"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { changeOwnPassword } from "@/lib/firebase/auth";
import { clearMustChangePassword } from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, developer, loading, firebaseConfigured } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!firebaseConfigured || !user) {
      router.replace("/login");
      return;
    }
    if (!developer) {
      router.replace("/portal");
      return;
    }
    if (!developer.mustChangePassword) {
      router.replace("/admin");
    }
  }, [user, developer, loading, firebaseConfigured, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("A nova senha deve ser diferente da senha temporária.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("A confirmação da senha não confere.");
      return;
    }

    setSaving(true);
    try {
      await changeOwnPassword(currentPassword, newPassword);
      if (user) await clearMustChangePassword(user.uid);
      window.location.href = "/admin";
    } catch {
      setError("Não foi possível alterar a senha. Verifique a senha atual.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !developer?.mustChangePassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold text-slate-900">
            Three<span className="text-indigo-600">Devs</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">Redefinição obrigatória</p>
        </div>

        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Você está usando uma senha temporária. Defina uma nova senha para
          continuar no painel admin.
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-slate-900">
            Criar nova senha
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Olá, {developer.name}. Escolha uma senha segura.
          </p>

          <div className="mt-6 space-y-4">
            <Field
              label="Senha temporária atual"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              required
            />
            <Field
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              required
            />
            <Field
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
            />
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={saving} className="mt-6 w-full py-2.5">
            {saving ? "Salvando..." : "Salvar e continuar"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}
