import { mailtoHref, services, whatsappHref } from "@/config/site";

export function Services() {
  return (
    <section
      id="servicos"
      data-mk-scene="tinta"
      className="scroll-mt-16 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2
            data-mk="rise"
            data-pattern="R2"
            className="font-serif text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em] lg:col-span-6"
          >
            O que a gente <em className="italic">constrói</em>
          </h2>
          <p
            data-mk="rise"
            data-pattern="R2"
            className="max-w-md self-end text-[color:var(--lp-muted)] lg:col-span-5 lg:col-start-8"
          >
            Cada desenvolvedor traz projetos e conduz a relação com o cliente.
            Juntos, entregamos a solução inteira, do código ao ar.
          </p>
        </div>

        <ul
          data-mk-stagger
          className="mt-16 border-t border-[color:var(--lp-line)]"
        >
          {services.map((service) => {
            // WhatsApp com a mensagem do serviço; sem número, cai no e-mail.
            const href =
              whatsappHref(
                `Olá! Vim pelo site da Serifa Labs. ${service.subject}.`,
              ) ?? mailtoHref(service.subject);
            const external = href?.startsWith("https://");
            return (
              <li
                key={service.id}
                data-mk="rise"
                data-pattern="R2"
                className="grid gap-4 border-b border-[color:var(--lp-line)] py-9 sm:grid-cols-12 sm:items-baseline sm:gap-8"
              >
                <h3 className="font-serif text-[1.85rem] leading-tight sm:col-span-4">
                  {service.title}
                </h3>
                <p className="leading-relaxed text-[color:var(--lp-muted)] sm:col-span-5">
                  {service.description}
                </p>
                {href && (
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    data-pattern="U1"
                    className="lp-link group justify-self-start py-1 text-sm font-medium text-[color:var(--lp-link)] sm:col-span-3 sm:justify-self-end"
                  >
                    Conversar sobre isso{" "}
                    <span className="lp-arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
