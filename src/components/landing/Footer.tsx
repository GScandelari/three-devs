import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Three Devs. Todos os direitos reservados.
        </p>
        <div className="flex gap-6">
          <Link
            href="/login"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            Portal do cliente
          </Link>
          <a
            href="https://github.com/GScandelari/three-devs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
