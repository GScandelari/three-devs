import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#processo", label: "Processo" },
  { href: "#portal", label: "Portal" },
  { href: "#perguntas", label: "Perguntas" },
];

// A cor acompanha a cena da seção visível (variáveis --mk-bg/--mk-ink da .lp).
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--lp-line)] bg-[color:color-mix(in_oklab,var(--mk-bg)_86%,transparent)] text-[color:var(--mk-ink)] backdrop-blur-md transition-colors duration-[1.2s]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Serifa Labs, página inicial"
          className="rounded-md text-[1.35rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
        >
          <Wordmark tone="scene" />
        </Link>

        <nav aria-label="Seções" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="lp-link text-sm text-[color:var(--lp-muted)] transition-colors hover:text-[color:var(--mk-ink)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="lp-link py-2 text-sm font-medium">
            Entrar
          </Link>
          <a
            href="#contato"
            className="lp-btn inline-flex min-h-10 items-center rounded-full bg-signal px-4 text-sm font-medium text-white ring-1 ring-white/30 transition-[background-color,transform] duration-200 hover:bg-signal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <span className="sm:hidden">Contato</span>
            <span className="hidden sm:inline">Iniciar um projeto</span>
          </a>
        </div>
      </div>
    </header>
  );
}
