import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <ThemeProvider>
        <Header />
        <main>
          <Hero />
          <Services />
          <HowItWorks />
          <Contact />
        </main>
        <Footer />
      </ThemeProvider>
    </>
  );
}
