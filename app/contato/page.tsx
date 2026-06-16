import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/tag"
import { MessageCircle, Mail, MapPin, ArrowUpRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Contato | Sapienza Labs",
  description:
    "Fale com a Sapienza Labs, estúdio de software de Duque de Caxias. Agende um diagnóstico gratuito de 30 minutos pelo WhatsApp ou por e-mail.",
  openGraph: {
    title: "Contato | Sapienza Labs",
    description:
      "Fale com a Sapienza Labs, estúdio de software de Duque de Caxias. Agende um diagnóstico gratuito de 30 minutos pelo WhatsApp ou por e-mail.",
    url: "https://sapienzalabs.com.br/contato",
    siteName: "Sapienza Labs",
    locale: "pt_BR",
    type: "website",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://sapienzalabs.com.br/contato",
  },
}

const whatsappUrl =
  "https://wa.me/5521986537054?text=Olá! Vim do site da Sapienza Labs e quero meu diagnóstico gratuito de 30 minutos."
const email = "jadersonmarc@sapienzalabs.com.br"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contato | Sapienza Labs",
  description:
    "Fale com a Sapienza Labs, estúdio de software de Duque de Caxias.",
  url: "https://sapienzalabs.com.br/contato",
  mainEntity: {
    "@type": "Organization",
    name: "Sapienza Labs",
    url: "https://sapienzalabs.com.br",
    logo: "https://sapienzalabs.com.br/logo-sapienza.png",
    email,
    areaServed: "Baixada Fluminense, Rio de Janeiro, Brasil",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Duque de Caxias",
      addressRegion: "RJ",
      addressCountry: "BR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+5521986537054",
      email,
      availableLanguage: "Portuguese",
    },
  },
}

export default function ContatoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen pt-32 pb-20">
        {/* Hero */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Tag tone="primary" size="sm" className="mb-4">
              Contato
            </Tag>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-display sm:text-4xl md:text-5xl text-balance">
              Vamos transformar sua operação em software.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              O primeiro passo é uma conversa. Em um diagnóstico gratuito de 30 minutos
              entendemos seu processo, apontamos o caminho mais direto e, se fizer sentido,
              seguimos para uma proposta de escopo fechado.
            </p>
          </div>
        </section>

        {/* Canais de contato */}
        <section className="mt-12 px-4 sm:mt-16 sm:px-6">
          <div className="mx-auto grid max-w-3xl gap-4 sm:gap-6">
            {/* WhatsApp — canal principal */}
            <div className="glass rounded-2xl p-6 text-center sm:p-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-foreground font-display sm:text-2xl">
                Fale pelo WhatsApp
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                A forma mais rápida de começar. Respondemos em horário comercial.
              </p>
              <Button asChild className="group mt-6 w-full rounded-full sm:w-auto">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Agendar diagnóstico gratuito
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Button>
            </div>

            {/* E-mail + Localização */}
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <a
                href={`mailto:${email}`}
                className="glass flex flex-col rounded-2xl p-6 transition-colors hover:border-primary/30"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">E-mail</h3>
                <p className="mt-2 break-all text-sm leading-relaxed text-muted-foreground">
                  {email}
                </p>
              </a>

              <div className="glass flex flex-col rounded-2xl p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Onde estamos</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Duque de Caxias — Baixada Fluminense, RJ.
                  <br />
                  Atendimento remoto para todo o Brasil.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
