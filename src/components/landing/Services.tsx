const services = [
  {
    title: "Aplicações web",
    description:
      "Sistemas, dashboards e plataformas sob medida com foco em performance e usabilidade.",
  },
  {
    title: "Integrações & APIs",
    description:
      "Conectamos seu produto a serviços externos, automatizamos fluxos e escalamos operações.",
  },
  {
    title: "MVP & produtos digitais",
    description:
      "Validamos ideias rapidamente com entregas incrementais e acompanhamento próximo.",
  },
];

export function Services() {
  return (
    <section id="servicos" className="border-t border-slate-100 dark:border-slate-800 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            O que fazemos
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Cada membro do time traz leads e conduz a relação com o cliente.
            Juntos, entregamos soluções completas.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
