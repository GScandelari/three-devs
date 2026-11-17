import Link from "next/link";
import { mailtoHref, site, whatsappHref } from "@/config/site";

export function Contact() {
  const email = mailtoHref("Quero iniciar um projeto com a Serifa Labs");
  const whatsapp = whatsappHref(
    "Olá! Vim pelo site da Serifa Labs e quero conversar sobre um projeto.",
  );

  return (
    <section
      id="contato"
      data-mk-scene="indigo"
      className="scroll-mt-16 py-24 sm:py-36"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          data-mk="rise"
          data-pattern="R2"
          className="max-w-4xl font-serif text-[clamp(2.6rem,7vw,5.4rem)] leading-[1.02] tracking-[-0.025em]"
        >
          Conte o que você quer <em className="italic">construir</em>.
        </h2>
        <p
          data-mk="rise"
          data-pattern="R2"
          className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--lp-muted)]"
        >
          Escreva com a sua ideia, do jeito que ela estiver. Um dos
          desenvolvedores responde para marcar a conversa e montar a proposta.
        </p>

        <div
          data-mk="rise"
          data-pattern="R2"
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          {email && (
            <a
              href={email}
              className="lp-btn group inline-flex min-h-12 max-w-full items-center gap-2 rounded-full bg-white px-6 text-[0.95rem] font-medium text-ink transition-[background-color,transform] duration-200 hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="truncate">
                Escrever para {site.contact.email}
              </span>
              <span className="lp-arrow" aria-hidden="true">
                →
              </span>
            </a>
          )}
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-btn inline-flex min-h-12 items-center rounded-full border border-white/60 px-6 text-[0.95rem] font-medium text-white transition-[background-color,transform] duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Conversar pelo WhatsApp
            </a>
          )}
        </div>
        {email && (
          <p className="mt-4 text-sm text-[color:var(--lp-muted)]">
            O botão abre o seu programa de e-mail com o assunto preenchido.
          </p>
        )}

        <p className="mt-14 text-sm text-[color:var(--lp-muted)]">
          Já é cliente?{" "}
          <Link href="/login" className="lp-link font-medium text-white">
            Acessar o portal
          </Link>
        </p>
      </div>
    </section>
  );
}
