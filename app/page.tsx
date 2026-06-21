import type { Metadata } from "next"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { HowItWorks } from "@/components/how-it-works"
import { Differentials } from "@/components/differentials"
import { Portfolio } from "@/components/portfolio"
import { Trust } from "@/components/trust"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { getHomeBlocks } from "@/lib/content/pages"

export const metadata: Metadata = {
  alternates: { canonical: "https://sapienzalabs.com.br" },
}

export default async function HomePage() {
  const home = await getHomeBlocks()
  return (
    <main className="min-h-screen">
      <Hero block={home.hero} />
      <section id="servicos">
        <Services header={home.services} />
      </section>
      <section id="como-funciona">
        <HowItWorks header={home.howItWorks} />
      </section>
      <section id="portfolio">
        <Portfolio header={home.portfolio} />
      </section>
      <section id="confianca">
        <Trust header={home.trust} />
      </section>
      <section id="diferenciais">
        <Differentials block={home.differentials} />
      </section>
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
