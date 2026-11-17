import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

type AuthShellProps = {
  // Linha curta sob o logotipo no celular e acima do formulário no desktop.
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

// Moldura das telas de acesso (login e senhas): painel da marca em
// tinta-índigo à esquerda (desktop) e o formulário no papel-lavanda.
export function AuthShell({ subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-1 bg-paper text-ink">
      <aside className="relative hidden w-[44%] max-w-[640px] flex-col justify-between overflow-hidden bg-ink p-12 text-paper lg:flex">
        <Link
          href="/"
          aria-label="Serifa Labs, página inicial"
          className="w-fit rounded-md text-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-light"
        >
          <Wordmark tone="dark" />
        </Link>

        <div className="relative">
          {/* Linhas-guia tipográficas: a marca gráfica da identidade. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-10 h-px bg-proof/60"
          />
          <p className="font-serif text-[clamp(2.2rem,3.4vw,3.2rem)] leading-[1.08] tracking-[-0.02em]">
            O seu projeto, do rascunho ao{" "}
            <em className="italic text-signal-light">acabamento</em>, em um só
            lugar.
          </p>
          <ul className="mt-10 space-y-3 text-[0.95rem] text-mist">
            {[
              "Status e etapas de cada projeto",
              "Contratos com assinatura pelo gov.br",
              "Links, notas e avisos da equipe",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-5 bg-signal-light" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-xs text-mist/80">
          serifalabs.com · portal do cliente
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 lg:hidden">
            <Link
              href="/"
              aria-label="Serifa Labs, página inicial"
              className="rounded-md text-[1.7rem]"
            >
              <Wordmark />
            </Link>
          </div>
          <p className="mb-3 font-mono text-xs text-muted">{subtitle}</p>
          {children}
          {footer && <div className="mt-8 text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

// Estilos compartilhados dos campos das telas de acesso.
export const authInputClass =
  "mt-1.5 w-full rounded-xl border border-[#dcd8f3] bg-white px-3.5 py-2.5 text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/60 focus:border-signal focus:ring-4 focus:ring-signal/15";

export const authLabelClass = "block text-sm font-medium text-graphite";
