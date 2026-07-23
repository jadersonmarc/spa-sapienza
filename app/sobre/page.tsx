import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/eyebrow"
import { ArrowRight, Bot, Sparkles, Globe } from "lucide-react"
import Image from "next/image"
import { whatsappUrl } from "@/lib/contact"

export const metadata: Metadata = {
  title: "Sobre Nós | Sapienza Labs",
  description:
    "Conheça a Sapienza Labs, startup de inteligência artificial que constrói produtos de software para operar online — IA aplicada à operação de quem contrata, sem que a distância importe.",
  openGraph: {
    title: "Sobre Nós | Sapienza Labs",
    description:
      "Conheça a Sapienza Labs, startup de inteligência artificial que constrói produtos de software para operar online — IA aplicada à operação de quem contrata, sem que a distância importe.",
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
    "Conheça a Sapienza Labs, startup de inteligência artificial que constrói produtos de software para operar online — IA aplicada à operação de quem contrata.",
  url: "https://sapienzalabs.com.br/sobre",
  mainEntity: {
    "@type": "Organization",
    name: "Sapienza Labs",
    url: "https://sapienzalabs.com.br",
    logo: "https://sapienzalabs.com.br/logo-sapienza.png",
  },
}

const capabilities = [
  {
    icon: Bot,
    title: "Atendimento com IA",
    description:
      "Agentes que respondem, qualificam e encaminham no WhatsApp e em outros canais — 24/7, no tom da sua marca.",
  },
  {
    icon: Sparkles,
    title: "Conteúdo com IA",
    description:
      "Geração e publicação de conteúdo sob medida, do artigo ao post social, mantendo a marca consistente em escala.",
  },
  {
    icon: Globe,
    title: "Alcance sem fronteira",
    description:
      "Produtos que operam 100% online. Onde há internet, a Sapienza atende — de qualquer lugar, para qualquer lugar.",
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
              Somos uma startup de inteligência artificial. Construímos produtos de software que operam online e colocam IA para trabalhar dentro da operação de quem contrata — sem que a distância importe. Nosso território é a internet: atendemos de qualquer lugar, para qualquer lugar.
            </p>
          </div>
        </section>

        {/* Commercial Context Section */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold text-foreground font-display sm:text-2xl">Para quem trabalhamos</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Trabalhamos com empresas que chegaram ao limite da planilha, do sistema pronto ou do processo manual — e querem usar inteligência artificial para dar o próximo passo. Nosso papel é transformar operação real em software sob medida, com escopo claro e engenharia responsável desde o primeiro diagnóstico.
            </p>
          </div>
        </section>

        {/* Founder Section */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="glass flex flex-col items-center gap-6 rounded-2xl p-6 text-center sm:gap-8 sm:p-8 md:flex-row md:items-start md:text-left">
              <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20 sm:h-32 sm:w-32">
                <Image
                  src="/owner.jpeg"
                  alt="Marc, fundador da Sapienza Labs"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground font-display sm:text-2xl">O fundador</h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Sou Marc, o engenheiro por trás da Sapienza Labs. Vim do Ruby e do Smalltalk, me apaixonei por Go e Rust, e decidi que a melhor forma de crescer era construir coisas que importam. Hoje concentro esse aprendizado em produtos de IA que rodam online — feitos para resolver problemas reais de negócio, em qualquer lugar.
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
                Não trabalhamos isolados. A Sapienza Labs participa de programas de empreendedorismo e inovação, como o Dev Empreendedor do SEBRAE, e mantém o rigor de engenharia no centro de tudo o que entrega.
              </p>
              <p>
                A cada projeto, buscamos não apenas entregar código, mas deixar uma base sólida: sistemas que o cliente entende, opera e evolui. Menos caixa-preta, mais autonomia — porque tecnologia só vira vantagem quando você confia nela.
              </p>
            </div>
          </div>
        </section>

        {/* What We Build Section */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold text-foreground font-display sm:text-2xl">O que construímos</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Colocamos inteligência artificial para trabalhar onde ela gera valor de verdade: dentro da operação. Nossos produtos nascem para rodar online, escalar sem fronteira e resolver problemas concretos de negócio.
            </p>
            <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
              {capabilities.map((cap) => (
                <div
                  key={cap.title}
                  className="glass rounded-2xl p-6 transition-colors hover:border-primary/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <cap.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-foreground">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {cap.description}
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
                href={whatsappUrl("Olá! Vim do site e gostaria de conversar.")}
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
