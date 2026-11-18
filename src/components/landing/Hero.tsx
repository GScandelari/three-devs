import Link from "next/link";
import type { CSSProperties } from "react";

// Título do hero já dividido em palavras no HTML (sem mexer no DOM depois da
// hidratação). Só `transform` anima: o h1 é o LCP.
const LEAD = "Software sob medida, do rascunho ao";

function Word({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <span className="mk-word">
      <span className="mk-piece" style={{ "--mk-i": i } as CSSProperties}>
        {children}
      </span>
    </span>
  );
}

// Assinatura: "acabamento" nasce em mono (rascunho) e a passada laranja a
// converte na serifada itálica (acabamento).
function SignatureWord({ i }: { i: number }) {
  return (
    <Word i={i}>
      <span className="sig-word" data-pattern="SIG">
        <span className="sig-draft" aria-hidden="true">
          acabamento
        </span>
        <em className="sig-final font-serif font-normal italic tracking-[-0.01em] text-[color:var(--lp-link)]">
          acabamento
        </em>
        <span className="sig-pass" aria-hidden="true" />
      </span>
    </Word>
  );
}

export function Hero() {
  const words = LEAD.split(" ");
  return (
    <section
      data-mk-scene="tinta"
      data-mk-now
      className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 lg:pb-32"
    >
      <div aria-hidden="true" className="hero-grid absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p
            data-mk="fade"
            data-pattern="L1"
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[color:var(--lp-line)] px-3.5 py-1.5 font-mono text-[0.75rem] text-[color:var(--lp-muted)]"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-signal"
            />
            Estúdio de software · três desenvolvedores
          </p>

          <h1
            data-mk="split-words"
            data-pattern="L1"
            className="text-[clamp(2.6rem,6.6vw,5.4rem)] font-semibold leading-[1] tracking-[-0.045em]"
          >
            {words.map((w, i) => (
              <span key={i}>
                <Word i={i}>{w}</Word>{" "}
              </span>
            ))}
            <SignatureWord i={words.length} />
            <span aria-hidden="true">.</span>
          </h1>

          <p
            data-mk="rise"
            data-pattern="L1"
            style={{ "--mk-delay": "0.15s" } as CSSProperties}
            className="mt-7 max-w-xl text-lg leading-relaxed text-[color:var(--lp-muted)]"
          >
            Construímos aplicações web, integrações e MVPs para empresas e
            fundadores. Você assina o contrato pelo gov.br e acompanha cada
            etapa num portal feito para isso.
          </p>

          <div
            data-mk="rise"
            data-pattern="L1"
            style={{ "--mk-delay": "0.25s" } as CSSProperties}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4"
          >
            <a
              href="#contato"
              className="lp-btn group inline-flex min-h-12 items-center gap-2 rounded-full bg-signal px-6 text-[0.95rem] font-semibold text-ink transition-[background-color,transform] duration-200 hover:bg-signal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lp-link)]"
            >
              Iniciar um projeto
              <span className="lp-arrow" aria-hidden="true">
                →
              </span>
            </a>
            <Link
              href="/login"
              className="lp-link py-2 text-[0.95rem] font-medium text-[color:var(--mk-ink)]"
            >
              Acessar o portal do cliente
            </Link>
          </div>
        </div>

        <PortalPreview />
      </div>
    </section>
  );
}

const checklist = [
  { label: "Proposta aprovada", done: true },
  { label: "Contrato assinado pelo gov.br", done: true },
  { label: "Portal liberado", done: true },
  { label: "Entrega", done: false },
];

// Prévia ilustrativa do portal do cliente (dados de exemplo, sinalizados na
// legenda). Com movimento, a barra enche e as etapas se marcam em sequência.
function PortalPreview() {
  return (
    <figure
      data-mk="rise"
      data-pattern="L1"
      style={{ "--mk-delay": "0.35s" } as CSSProperties}
      className="pv-card relative lg:col-span-5"
    >
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute -inset-16 -z-10"
      />
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </span>
          <span className="flex-1 truncate rounded-md bg-white/[0.06] px-3 py-1 text-center font-mono text-[0.7rem] text-mist">
            serifalabs.com/portal
          </span>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <p className="font-mono text-[0.68rem] tracking-wide text-mist uppercase">
                Projeto
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-paper">
                Painel de pedidos
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-signal/15 px-2.5 py-1 text-xs font-medium text-signal-light">
              <span className="pv-pulse h-1.5 w-1.5 rounded-full bg-signal" />
              Em desenvolvimento
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between font-mono text-[0.7rem] text-mist">
              <span>Etapa 3 de 4</span>
              <span>72%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div className="pv-bar h-full w-[72%] rounded-full bg-signal" />
            </div>
          </div>

          <ul className="space-y-1">
            {checklist.map((item, i) => (
              <li
                key={item.label}
                className="pv-item flex items-center gap-3 rounded-lg px-1 py-2 text-sm"
                style={{ "--mk-i": i } as CSSProperties}
              >
                {item.done ? (
                  <span className="pv-check grid h-5 w-5 shrink-0 place-items-center rounded-full bg-signal text-ink">
                    <CheckIcon />
                  </span>
                ) : (
                  <span className="h-5 w-5 shrink-0 rounded-full border border-dashed border-white/25" />
                )}
                <span className={item.done ? "text-paper" : "text-mist"}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-signal-light">
              <BellIcon />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-paper">
                Novo link: ambiente de testes
              </p>
              <p className="font-mono text-[0.68rem] text-mist">
                nota da equipe · hoje
              </p>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 text-center font-mono text-[0.7rem] text-[color:var(--lp-muted)]">
        Ilustração do portal do cliente, com dados de exemplo
      </figcaption>
    </figure>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M10 3a4.5 4.5 0 00-4.5 4.5v2.8L4 13h12l-1.5-2.7V7.5A4.5 4.5 0 0010 3zM8.2 15.5a1.9 1.9 0 003.6 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
