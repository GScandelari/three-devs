import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-indigo-100 dark:bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-100 dark:bg-slate-800/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Desenvolvimento de software sob medida
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
            Três desenvolvedores.
            <br />
            <span className="text-slate-500 dark:text-slate-400">Um time completo para o seu projeto.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Transformamos ideias em produtos digitais. Do contrato à entrega, com
            transparência total no portal do cliente.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#contato"
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 dark:hover:bg-indigo-700"
            >
              Iniciar um projeto
            </a>
            <Link
              href="/login"
              className="rounded-full border border-slate-200 dark:border-slate-700 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Acessar portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
