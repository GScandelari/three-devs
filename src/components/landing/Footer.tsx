import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer
      data-mk-scene="indigo"
      className="border-t border-[color:var(--lp-line)] py-10"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <span className="text-xl">
            <Wordmark tone="accent" />
          </span>
          <p className="mt-2 text-sm text-[color:var(--lp-muted)]">
            © {new Date().getFullYear()} {site.name}. Todos os direitos
            reservados.
          </p>
        </div>
        <nav
          aria-label="Rodapé"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
        >
          <Link href="/login" className="lp-link py-1">
            Portal do cliente
          </Link>
          {site.contact.whatsapp && (
            <a
              href={`https://wa.me/${site.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-link py-1"
            >
              WhatsApp {site.contact.phoneDisplay}
            </a>
          )}
          {site.contact.email && (
            <a href={`mailto:${site.contact.email}`} className="lp-link py-1">
              {site.contact.email}
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
