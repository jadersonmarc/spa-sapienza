import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, HeartPulse, Building2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Sobre Nos | Sapienza Labs",
  description:
    "Conheca a Sapienza Labs, estudio de software de Duque de Caxias que une engenharia de alta performance a impacto social, ciencia e inovacao.",
  openGraph: {
    title: "Sobre Nos | Sapienza Labs",
    description:
      "Conheca a Sapienza Labs, estudio de software de Duque de Caxias que une engenharia de alta performance a impacto social, ciencia e inovacao.",
    url: "https://sapienzalabs.com.br/sobre",
    siteName: "Sapienza Labs",
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: "https://sapienzalabs.com.br/sobre",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Sobre Nos | Sapienza Labs",
  description:
    "Conheca a Sapienza Labs, estudio de software de Duque de Caxias que une engenharia de alta performance a impacto social, ciencia e inovacao.",
  url: "https://sapienzalabs.com.br/sobre",
  mainEntity: {
    "@type": "Organization",
    name: "Sapienza Labs",
    url: "https://sapienzalabs.com.br",
    logo: "https://sapienzalabs.com.br/logo-sapienza.png",
    foundingLocation: {
      "@type": "Place",
      name: "Duque de Caxias, Rio de Janeiro, Brasil",
    },
  },
}

const impactAreas = [
  {
    icon: Leaf,
    title: "Agro & Soberania Alimentar",
    description:
      "Rastreabilidade, soberania de dados e transparencia para produtores rurais. Tecnologia que da voz e visibilidade a quem alimenta o pais.",
  },
  {
    icon: HeartPulse,
    title: "Saude Publica & SUS",
    description:
      "Sistemas que ajudam a gerir, auditar e melhorar servicos de saude publica. Infraestrutura para quem cuida de gente.",
  },
  {
    icon: Building2,
    title: "Transparencia Civica & Institucional",
    description:
      "Software para auditoria, prestacao de contas e governanca digital para instituicoes publicas e ONGs.",
  },
]

export default function SobrePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-6">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
              Quem somos
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Somos um estudio de software nascido na Baixada Fluminense. Acreditamos que tecnologia de alta qualidade nao deve ser exclusividade de grandes corporacoes ou do eixo Sudeste. Construimos daqui, para ca — e para o mundo.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mt-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground">Nossa missao</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Existimos na interseccao entre engenharia e impacto social. Desenvolvemos software robusto, mas tambem perseguimos algo maior: usar tecnologia como ferramenta para o progresso cientifico e para resolver problemas publicos reais — no agronegocio, na saude publica e na infraestrutura civica.
            </p>
          </div>
        </section>

        {/* How We Build Knowledge Section */}
        <section className="mt-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground">Como construimos conhecimento</h2>
            <div className="mt-4 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                Nao trabalhamos isolados. A Sapienza Labs participa ativamente de programas de empreendedorismo e inovacao, como o Dev Empreendedor do SEBRAE, e busca parcerias com ICTs (Instituicoes de Ciencia e Tecnologia) e centros de pesquisa.
              </p>
              <p>
                Acreditamos que a fronteira entre um estudio de software e um laboratorio de pesquisa deve ser tenue. A cada projeto, buscamos nao apenas entregar codigo, mas gerar conhecimento que possa ser compartilhado e reutilizado — seja em forma de artigos, dados abertos ou ferramentas de codigo aberto.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Areas Section */}
        <section className="mt-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground">Areas de impacto social</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {impactAreas.map((area) => (
                <div
                  key={area.title}
                  className="glass rounded-2xl p-6 transition-colors hover:border-primary/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <area.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-foreground">{area.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {area.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="mt-20 px-6">
          <div className="mx-auto max-w-3xl">
            <div className="glass flex flex-col items-center gap-8 rounded-2xl p-8 md:flex-row md:items-start">
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
                <Image
                  src="/marc.png"
                  alt="Marc, fundador da Sapienza Labs"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">O fundador</h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Sou Marc, o engenheiro por tras da Sapienza Labs. Vim do Ruby e do Smalltalk, me apaixonei por Go e Rust, e decidi que a melhor forma de crescer era construir coisas que importam. Moro em Duque de Caxias e acredito que a Baixada Fluminense merece uma referencia tecnologica propria.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Quer construir algo junto?
            </h2>
            <p className="mt-2 text-muted-foreground">Fale com a gente.</p>
            <Button asChild className="mt-6 group">
              <Link href="https://wa.me/5521986537054?text=Olá! Vim do site e gostaria de conversar.">
                Entrar em contato
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
