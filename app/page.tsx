import type { Metadata } from "next"
import { Hero } from "@/components/hero"
import { CapabilityLadder } from "@/components/capability-ladder"
import { EngineeringProof } from "@/components/engineering-proof"
import { HowItWorks } from "@/components/how-it-works"
import { Services } from "@/components/services"
import { Plans } from "@/components/plans"
import { SubscriptionProducts } from "@/components/subscription-products"
import { Trust } from "@/components/trust"
import { Differentials } from "@/components/differentials"
import { CtaFinal } from "@/components/cta-final"
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
      {/* Tese acima da dobra */}
      <Hero block={home.hero} />
      {/* Escada de capacidade — a seção-assinatura */}
      <section id="escada">
        <CapabilityLadder />
      </section>
      {/* Prova de engenharia — antes dos planos, é o que convence */}
      <section id="provas">
        <EngineeringProof />
      </section>
      {/* Como trabalhamos */}
      <section id="como-funciona">
        <HowItWorks header={home.howItWorks} />
      </section>
      {/* Capacidades em detalhe */}
      <section id="servicos">
        <Services header={home.services} />
      </section>
      {/* Vitrine (planos) — rebaixada para depois da prova */}
      <section id="planos">
        <Plans block={home.portfolio} />
      </section>
      {/* Produtos por assinatura — valor exposto, negócio conversado */}
      <SubscriptionProducts />
      <section id="confianca">
        <Trust header={home.trust} />
      </section>
      <section id="diferenciais">
        <Differentials block={home.differentials} />
      </section>
      <CtaFinal />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
