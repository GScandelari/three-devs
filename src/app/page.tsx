import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { Process } from "@/components/landing/Process";
import { Portal } from "@/components/landing/Portal";
import { Faq } from "@/components/landing/Faq";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { MotionLayer } from "@/components/landing/MotionLayer";
import { faq, services, site } from "@/config/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// JSON-LD só com dados confirmados (docs/PENDENCIAS-VALIDACAO.md).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      description: site.description,
      ...(site.contact.email ? { email: site.contact.email } : {}),
      ...(site.contact.whatsapp
        ? {
            contactPoint: {
              "@type": "ContactPoint",
              telephone: site.contact.phoneE164,
              contactType: "sales",
              availableLanguage: "pt-BR",
            },
          }
        : {}),
      knowsAbout: services.map((s) => s.title),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      inLanguage: "pt-BR",
      publisher: { "@id": `${site.url}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <div className="lp flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MotionLayer />
      <a
        href="#conteudo"
        className="sr-only z-[60] rounded-md bg-signal px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Services />
        <Process />
        <Portal />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
