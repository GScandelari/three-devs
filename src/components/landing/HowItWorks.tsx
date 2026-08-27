const steps = [
  {
    step: "01",
    title: "Proposta",
    description:
      "Um dos desenvolvedores identifica o lead, alinha a ideia com o time e apresenta a proposta.",
  },
  {
    step: "02",
    title: "Contrato",
    description:
      "Com a proposta aceita, geramos e enviamos o contrato. Sem assinatura, o onboarding não inicia.",
  },
  {
    step: "03",
    title: "Portal do cliente",
    description:
      "Após a assinatura, o cliente acessa o portal com status, links, contratos e notas do projeto.",
  },
  {
    step: "04",
    title: "Entrega",
    description:
      "Acompanhamos cada etapa com transparência até a entrega e evolução contínua do produto.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Como funciona
          </h2>
          <p className="mt-4 text-slate-600">
            Um fluxo claro do primeiro contato até a entrega do projeto.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="rounded-2xl bg-white p-6 shadow-sm">
              <span className="text-sm font-semibold text-indigo-600">
                {item.step}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
