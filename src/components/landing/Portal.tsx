import { Wordmark } from "@/components/ui/Wordmark";

const features = [
  {
    key: "status",
    title: "Status de cada projeto",
    description:
      "Você vê em que etapa o projeto está, do onboarding à entrega, sem precisar perguntar.",
  },
  {
    key: "contrato",
    title: "Contrato e assinatura",
    description:
      "O contrato fica no portal. Você assina no gov.br e envia o PDF por lá; o projeto é liberado depois da assinatura.",
  },
  {
    key: "links",
    title: "Links e notas da equipe",
    description:
      "Repositório, ambientes e documentos reunidos, com as notas que a equipe registra a cada avanço.",
  },
  {
    key: "avisos",
    title: "Avisos de cada mudança",
    description:
      "Quando o status muda ou chega uma nota nova, um aviso aparece no portal para você.",
  },
];

// S1: no desktop, a ilustração do portal fica fixa enquanto os recursos passam;
// o recurso no centro da tela acende a área correspondente.
export function Portal() {
  return (
    <section
      id="portal"
      data-mk-scene="papel"
      className="scroll-mt-16 border-t border-[color:var(--lp-line)] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2
            data-mk="rise"
            data-pattern="R2"
            className="font-serif text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em]"
          >
            O projeto inteiro em <em className="italic">um só lugar</em>
          </h2>
          <p
            data-mk="rise"
            data-pattern="R2"
            className="mt-5 text-[color:var(--lp-muted)]"
          >
            Todo cliente recebe acesso ao portal da Serifa Labs, com login
            próprio. É lá que o projeto acontece às claras.
          </p>
        </div>

        <div data-stage className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="self-start lg:sticky lg:top-28" data-pattern="S1">
            <PortalIllustration />
          </div>

          <ol className="space-y-4 lg:space-y-0">
            {features.map((f) => (
              <li
                key={f.key}
                data-stage-step={f.key}
                className="flex flex-col justify-center rounded-2xl border border-[color:var(--lp-line)] bg-[color:var(--lp-card)] p-6 lg:min-h-[52vh] lg:rounded-none lg:border-0 lg:border-l-2 lg:bg-transparent lg:py-0 lg:pl-8"
              >
                <h3 className="font-serif text-[1.7rem] leading-tight">
                  {f.title}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-[color:var(--lp-muted)]">
                  {f.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function PortalIllustration() {
  return (
    <figure>
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-[22px] border border-[color:var(--lp-line)] bg-white text-ink shadow-[0_30px_80px_-40px_rgba(23,19,59,0.45)]"
      >
        <div className="flex items-center justify-between border-b border-[#ece9fb] px-5 py-3.5">
          <span className="text-base">
            <Wordmark />
            <span className="ml-2 text-xs text-muted">Portal</span>
          </span>
          <span
            data-zone="avisos"
            className="portal-zone relative grid h-8 w-8 place-items-center rounded-full bg-paper"
          >
            <BellIcon />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-proof" />
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="font-mono text-[0.7rem] text-muted">Projeto</p>
            <p className="font-serif text-2xl">Seu projeto</p>
          </div>

          <div
            data-zone="status"
            className="portal-zone rounded-xl bg-paper p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span className="rounded-full bg-signal-soft px-2.5 py-0.5 text-xs font-medium text-signal">
                Em andamento
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <span className="h-1.5 rounded-full bg-signal" />
              <span className="h-1.5 rounded-full bg-signal" />
              <span className="h-1.5 rounded-full bg-paper-deep" />
              <span className="h-1.5 rounded-full bg-paper-deep" />
            </div>
          </div>

          <div
            data-zone="contrato"
            className="portal-zone flex items-center justify-between rounded-xl border border-[#ece9fb] p-4"
          >
            <span className="text-sm">Contrato de prestação de serviços</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              Assinado
            </span>
          </div>

          <div
            data-zone="links"
            className="portal-zone grid gap-2 rounded-xl border border-[#ece9fb] p-4 text-sm"
          >
            <span className="flex items-center justify-between">
              Repositório <span className="text-signal">↗</span>
            </span>
            <span className="flex items-center justify-between">
              Ambiente de testes <span className="text-signal">↗</span>
            </span>
            <span className="mt-1 border-t border-[#ece9fb] pt-3 text-muted">
              Nota da equipe: nova versão publicada para revisão.
            </span>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-[color:var(--lp-muted)]">
        Ilustração simplificada do portal do cliente.
      </figcaption>
    </figure>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
