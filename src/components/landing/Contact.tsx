export function Contact() {
  return (
    <section id="contato" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl bg-slate-900 px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-400">
            Entre em contato com um dos nossos desenvolvedores ou envie um e-mail
            para discutirmos seu projeto.
          </p>
          <a
            href="mailto:contato@three-devs.com"
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            contato@three-devs.com
          </a>
        </div>
      </div>
    </section>
  );
}
