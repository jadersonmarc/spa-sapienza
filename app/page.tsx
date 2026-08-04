import type { Metadata } from "next"
import { Hero } from "@/components/hero"
import { CapabilityLadder } from "@/components/capability-ladder"
import { MargotShowcase } from "@/components/margot-showcase"
import { EngineeringProof } from "@/components/engineering-proof"
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
      {/* Tese única acima da dobra */}
      <Hero block={home.hero} />
      {/* Sob medida — teaser da escada; aprofunda em /engenharia */}
      <section id="sob-medida">
        <CapabilityLadder />
      </section>
      {/* Produtos Margot — vitrine; aprofunda em /margot */}
      <section id="produtos">
        <MargotShowcase />
      </section>
      {/* Prova compartilhada — serve às duas ofertas */}
      <section id="provas">
        <EngineeringProof />
      </section>
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
