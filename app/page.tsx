import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { HowItWorks } from "@/components/how-it-works"
import { Differentials } from "@/components/differentials"
import { Portfolio } from "@/components/portfolio"
import { Trust } from "@/components/trust"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <section id="servicos">
        <Services />
      </section>
      <section id="como-funciona">
        <HowItWorks />
      </section>
      <section id="portfolio">
        <Portfolio />
      </section>
      <section id="confianca">
        <Trust />
      </section>
      <section id="diferenciais">
        <Differentials />
      </section>
      <section id="contato">
        <Footer />
      </section>
      <WhatsAppButton />
    </main>
  )
}
