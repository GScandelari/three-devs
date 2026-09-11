import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Link from "next/link";

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contato", label: "Contato" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Three<span className="text-indigo-600 dark:text-indigo-400">Devs</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            Entrar
          </Link>
          <a
            href="#contato"
            className="rounded-full bg-slate-900 px-3 py-2 sm:px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Fale conosco
          </a>
        </div>
      </div>
    </header>
  );
}
