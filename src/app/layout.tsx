import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";
import { THEME_BOOT_SCRIPT } from "@/components/theme/theme-boot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Three Devs — Desenvolvimento de Software",
  description:
    "Startup de desenvolvimento de software. Landing page e portal do cliente.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <Script id="theme-initialization" strategy="beforeInteractive">
          {THEME_BOOT_SCRIPT}
        </Script>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
