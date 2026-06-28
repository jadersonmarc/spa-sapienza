import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/eyebrow"
import { ArrowRight, Leaf, HeartPulse, Building2 } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Sobre Nós | Sapienza Labs",
  description:
    "Conheça a Sapienza Labs, estúdio de software de Duque de Caxias que une engenharia de alta performance a impacto social, ciência e inovação.",
  openGraph: {
    title: "Sobre Nós | Sapienza Labs",
    description:
      "Conheça a Sapienza Labs, estúdio de software de Duque de Caxias que une engenharia de alta performance a impacto social, ciência e inovação.",
    url: "https://sapienzalabs.com.br/sobre",
    siteName: "Sapienza Labs",
    locale: "pt_BR",
    type: "website",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://sapienzalabs.com.br/sobre",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Sobre Nós | Sapienza Labs",
  description:
    "Conheça a Sapienza Labs, estúdio de software de Duque de Caxias que une engenharia de alta performance a impacto social, ciência e inovação.",
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
      "Rastreabilidade, soberania de dados e transparência para produtores rurais. Tecnologia que dá voz e visibilidade a quem alimenta o país.",
  },
  {
    icon: HeartPulse,
    title: "Saúde Pública & SUS",
    description:
      "Sistemas que ajudam a gerir, auditar e melhorar serviços de saúde pública. Infraestrutura para quem cuida de gente.",
  },
  {
    icon: Building2,
    title: "Transparência Cívica & Institucional",
    description:
      "Software para auditoria, prestação de contas e governança digital para instituições públicas e ONGs.",
  },
]

export default function SobrePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <Eyebrow className="mb-5">Sobre a Sapienza</Eyebrow>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-display sm:text-4xl md:text-5xl text-balance">
              Quem somos
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Somos um estúdio de software nascido na Baixada Fluminense. Acreditamos que tecnologia de alta qualidade não deve ser exclusividade de grandes corporações ou do eixo Sudeste. Construímos daqui, para cá — e para o mundo.
            </p>
          </div>
        </section>

        {/* Commercial Context Section */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold text-foreground font-display sm:text-2xl">Para quem trabalhamos</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Trabalhamos com empresas que chegaram ao limite da planilha, do sistema pronto ou do processo manual. Nosso papel é transformar operação real em software sob medida, com escopo claro e engenharia responsável desde o primeiro diagnóstico.
            </p>
          </div>
        </section>

        {/* Founder Section */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="glass flex flex-col items-center gap-6 rounded-2xl p-6 text-center sm:gap-8 sm:p-8 md:flex-row md:items-start md:text-left">
              <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20 sm:h-32 sm:w-32">
                <Image
                  src="/marc.webp"
                  alt="Marc, fundador da Sapienza Labs"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground font-display sm:text-2xl">O fundador</h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Sou Marc, o engenheiro por trás da Sapienza Labs. Vim do Ruby e do Smalltalk, me apaixonei por Go e Rust, e decidi que a melhor forma de crescer era construir coisas que importam. Moro em Duque de Caxias e acredito que a Baixada Fluminense merece uma referência tecnológica própria.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work Section */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold text-foreground font-display sm:text-2xl">Como trabalhamos</h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Não trabalhamos isolados. A Sapienza Labs participa ativamente de programas de empreendedorismo e inovação, como o Dev Empreendedor do SEBRAE, e busca parcerias com ICTs (Instituições de Ciência e Tecnologia) e centros de pesquisa.
              </p>
              <p>
                Acreditamos que a fronteira entre um estúdio de software e um laboratório de pesquisa deve ser tênue. A cada projeto, buscamos não apenas entregar código, mas gerar conhecimento que possa ser compartilhado e reutilizado — seja em forma de artigos, dados abertos ou ferramentas de código aberto.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Areas Section */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold text-foreground font-display sm:text-2xl">Impacto social como visão</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Existimos na interseção entre engenharia e impacto social. Desenvolvemos software robusto, mas também perseguimos algo maior: usar tecnologia como ferramenta para o progresso científico e para resolver problemas públicos reais — no agronegócio, na saúde pública e na infraestrutura cívica.
            </p>
            <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
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

        {/* CTA Section */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl font-semibold text-foreground font-display sm:text-2xl">
              Quer construir algo junto?
            </h2>
            <p className="mt-2 text-muted-foreground">Fale com a gente.</p>
            <Button asChild className="mt-6 w-full group sm:w-auto">
              <a
                href="https://wa.me/5521984167397?text=Olá! Vim do site e gostaria de conversar."
                target="_blank"
                rel="noopener noreferrer"
              >
                Entrar em contato
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
