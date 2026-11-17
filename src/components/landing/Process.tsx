import { steps } from "@/config/site";

// S6: um fio em vermelho-revisão se desenha com a rolagem e liga as etapas,
// como a caneta de quem revisa um texto do começo ao fim.
export function Process() {
  return (
    <section
      id="processo"
      data-mk-scene="papel"
      className="scroll-mt-16 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2
            data-mk="rise"
            data-pattern="R2"
            className="font-serif text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em]"
          >
            Da primeira conversa à <em className="italic">entrega</em>
          </h2>
          <p
            data-mk="rise"
            data-pattern="R2"
            className="mt-5 text-[color:var(--lp-muted)]"
          >
            Um fluxo claro, com o contrato antes do código e cada etapa
            registrada no portal.
          </p>
        </div>

        <ol
          data-mk-draw-scope
          className="relative mt-16 grid gap-12 lg:grid-cols-4 lg:gap-8"
        >
          {/* Trilho + fio: vertical no celular, horizontal no desktop. */}
          <svg
            aria-hidden="true"
            className="absolute top-2 left-[11px] h-[calc(100%-1rem)] w-[2px] overflow-visible lg:hidden"
            viewBox="0 0 2 100"
            preserveAspectRatio="none"
          >
            <path d="M1 0 V100" stroke="var(--lp-line)" strokeWidth="2" />
            <path
              data-mk-draw
              data-pattern="S6"
              d="M1 0 V100"
              pathLength={1}
              stroke="var(--color-proof)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <svg
            aria-hidden="true"
            className="absolute top-[11px] left-2 hidden h-[2px] w-[calc(100%-0.5rem)] overflow-visible lg:block"
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
          >
            <path d="M0 1 H100" stroke="var(--lp-line)" strokeWidth="2" />
            <path
              data-mk-draw
              data-pattern="S6"
              d="M0 1 H100"
              pathLength={1}
              stroke="var(--color-proof)"
              strokeWidth="2"
              fill="none"
            />
          </svg>

          {steps.map((step, i) => (
            <li
              key={step.title}
              data-step
              className="relative pl-12 lg:pt-12 lg:pl-0"
            >
              <span
                aria-hidden="true"
                className="lp-step-dot absolute top-0 left-0 grid h-6 w-6 place-items-center rounded-full bg-signal font-mono text-[0.7rem] font-medium text-white ring-4 ring-[color:var(--mk-bg)]"
              >
                {i + 1}
              </span>
              <h3 className="font-serif text-2xl">
                <span className="sr-only">Etapa {i + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-[color:var(--lp-muted)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div data-mk="rise" data-pattern="R2" className="mt-16">
          <a
            href="#contato"
            className="lp-btn group inline-flex min-h-12 items-center gap-2 rounded-full bg-signal px-6 text-[0.95rem] font-medium text-white transition-[background-color,transform] duration-200 hover:bg-signal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Iniciar um projeto
            <span className="lp-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
