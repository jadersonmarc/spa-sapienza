import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { Differentials } from "@/components/differentials"
import { FiscalMonitor } from "@/components/fiscal-monitor"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <section id="servicos">
        <Services />
      </section>
      <section id="sobre">
        <Differentials />
      </section>
      <FiscalMonitor />
      <section id="contato">
        <Footer />
      </section>
      <WhatsAppButton />
    </main>
  )
}
