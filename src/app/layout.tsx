import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { site } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Serifada de títulos: o nome da marca é "Serifa".
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: site.locale,
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary",
    title: site.title,
    description: site.description,
  },
};

// Tira o `no-js` e liga o movimento (classe `mk-motion`) só quando não há
// redução de movimento nem economia de dados. Se a landing não confirmar em
// 3 s que o movimento está pronto, a classe sai e tudo aparece.
const motionBootstrap = `(function(d){d.classList.remove('no-js');var r=matchMedia('(prefers-reduced-motion: reduce)').matches,s=navigator.connection&&navigator.connection.saveData;if(!r&&!s){d.classList.add('mk-motion');setTimeout(function(){if(!window.__mkReady)d.classList.remove('mk-motion')},3000)}})(document.documentElement)`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-ambicao="elevado"
      // O script do <head> troca as classes antes da hidratação.
      suppressHydrationWarning
      className={`no-js ${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
