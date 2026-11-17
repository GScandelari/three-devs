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

// Assinatura: "acabamento" nasce em mono (rascunho) e a passada de revisão
// a converte na serifada (acabamento).
function SignatureWord({ i }: { i: number }) {
  return (
    <Word i={i}>
      <span className="sig-word" data-pattern="SIG">
        <span className="sig-draft" aria-hidden="true">
          acabamento
        </span>
        <em className="sig-final font-medium italic">acabamento</em>
        <span className="sig-pass" aria-hidden="true" />
      </span>
    </Word>
  );
}

export function Hero() {
  const words = LEAD.split(" ");
  return (
    <section
      data-mk-scene="papel"
      data-mk-now
      className="relative overflow-hidden pt-28 pb-20 sm:pt-36 lg:pb-28"
    >
      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <p
            data-mk="fade"
            data-pattern="L1"
            className="mb-6 font-mono text-[0.8rem] text-[color:var(--lp-muted)]"
          >
            Estúdio de software · três desenvolvedores
          </p>

          <h1
            data-mk="split-words"
            data-pattern="L1"
            className="font-serif text-[clamp(2.55rem,7.4vw,5.6rem)] font-normal leading-[1.02] tracking-[-0.025em]"
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
              className="lp-btn group inline-flex min-h-12 items-center gap-2 rounded-full bg-signal px-6 text-[0.95rem] font-medium text-white transition-[background-color,transform] duration-200 hover:bg-signal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              Iniciar um projeto
              <span className="lp-arrow" aria-hidden="true">
                →
              </span>
            </a>
            <Link
              href="/login"
              className="lp-link py-2 text-[0.95rem] font-medium text-[color:var(--lp-link)]"
            >
              Acessar o portal do cliente
            </Link>
          </div>
        </div>

        <Specimen />
      </div>
    </section>
  );
}

// Verbete que explica o nome. Linhas-guia tipográficas em vermelho-revisão.
function Specimen() {
  return (
    <figure
      data-mk="rise"
      data-pattern="L1"
      style={{ "--mk-delay": "0.35s" } as CSSProperties}
      className="self-end rounded-[28px] border border-[color:var(--lp-line)] bg-[color:var(--lp-card)] p-7 lg:col-span-4"
    >
      <div className="relative select-none" aria-hidden="true">
        <span className="absolute inset-x-0 top-[0.05em] h-px bg-proof/70 text-[7rem]" />
        <span className="absolute inset-x-0 top-[0.735em] h-px bg-proof/70 text-[7rem]" />
        <p className="font-serif text-[7rem] leading-none tracking-[-0.03em]">
          Aa<span className="italic text-signal">f</span>
        </p>
      </div>
      <figcaption className="mt-6 border-t border-[color:var(--lp-line)] pt-5">
        <p className="font-serif text-2xl">
          se·ri·fa{" "}
          <span className="font-mono text-xs text-[color:var(--lp-muted)]">
            substantivo feminino
          </span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--lp-muted)]">
          O pequeno traço que arremata as hastes de uma letra. É esse cuidado
          com o acabamento que levamos para cada projeto.
        </p>
      </figcaption>
    </figure>
  );
}
