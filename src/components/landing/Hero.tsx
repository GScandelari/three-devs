import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-100 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-indigo-600">
            Desenvolvimento de software sob medida
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Três desenvolvedores.
            <br />
            <span className="text-slate-500">Um time completo para o seu projeto.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Transformamos ideias em produtos digitais. Do contrato à entrega, com
            transparência total no portal do cliente.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#contato"
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Iniciar um projeto
            </a>
            <Link
              href="/login"
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Acessar portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
