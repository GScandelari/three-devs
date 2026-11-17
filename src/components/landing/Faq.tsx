import { faq } from "@/config/site";

export function Faq() {
  return (
    <section
      id="perguntas"
      data-mk-scene="papel"
      className="scroll-mt-16 border-t border-[color:var(--lp-line)] py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-12">
        <h2
          data-mk="rise"
          data-pattern="R2"
          className="font-serif text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em] lg:col-span-4"
        >
          Perguntas <em className="italic">frequentes</em>
        </h2>

        <div className="border-t border-[color:var(--lp-line)] lg:col-span-8">
          {faq.map((item) => (
            <details
              key={item.q}
              className="lp-faq group border-b border-[color:var(--lp-line)]"
            >
              <summary className="flex items-start justify-between gap-6 py-6 text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">
                {item.q}
                <span
                  aria-hidden="true"
                  className="lp-faq-icon mt-1 font-mono text-xl leading-none text-[color:var(--lp-link)]"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-7 leading-relaxed text-[color:var(--lp-muted)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
