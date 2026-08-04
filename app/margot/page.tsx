import type { Metadata } from "next"
import Link from "next/link"
import { Bot, PenLine, ArrowRight } from "lucide-react"
import { Eyebrow } from "@/components/eyebrow"
import { Footer } from "@/components/footer"
import { CtaFinal } from "@/components/cta-final"
import { ComboSection, DiferenciacaoBand } from "@/components/subscription-products"
import { brl, getProducts, pisoDe, type ProdutoId } from "@/lib/pricing"
import { MOSTRAR_COMBO, PRODUTO_COPY, TRANSPARENCIA } from "@/lib/products-config"

const TITLE = "Produtos Margot | Sapienza Labs"
const DESCRIPTION =
  "A linha Margot: um atendente de IA para o seu WhatsApp e uma editora que publica conteúdo no seu tom. Assine separado ou junto, no combo."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://sapienzalabs.com.br/margot",
    siteName: "Sapienza Labs",
    locale: "pt_BR",
    type: "website",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://sapienzalabs.com.br/margot" },
}

const PRODUTO_ICON: Record<ProdutoId, typeof Bot> = {
  margot: Bot,
  motor: PenLine,
}

// Rota de detalhe por produto.
const PRODUTO_HREF: Record<ProdutoId, string> = {
  margot: "/margot/atendente",
  motor: "/margot/editora",
}

const mostraPreco = TRANSPARENCIA !== "sob_consulta"

export default function MargotHubPage() {
  const produtos = getProducts()

  return (
    <>
      <main className="min-h-screen pt-32 pb-20">
        {/* Hero da linha Margot */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow className="mb-5 justify-center">Produtos Margot</Eyebrow>
            <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Dois produtos de IA que trabalham por você, todo mês
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A Margot atende o seu WhatsApp e produz o seu conteúdo — no seu tom, sem você fazer na
              mão. Assine o que precisa agora; junte os dois quando fizer sentido.
            </p>
          </div>
        </section>

        {/* Os dois produtos */}
        <section className="mt-14 px-4 sm:mt-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-5 sm:gap-6 md:grid-cols-2">
            {produtos.map(({ id, produto }) => {
              const Icon = PRODUTO_ICON[id]
              const copy = PRODUTO_COPY[id]
              return (
                <Link
                  key={id}
                  href={PRODUTO_HREF[id]}
                  className="glass group flex flex-col rounded-2xl border border-border/60 p-6 transition-colors hover:border-primary/40 sm:p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 font-display text-xl font-semibold text-foreground sm:text-2xl">
                    {produto.nome}
                  </h2>
                  <p className="mt-3 flex-1 text-base leading-relaxed text-muted-foreground">
                    {copy.promessa}
                  </p>
                  {mostraPreco && (
                    <p className="mt-4 font-mono text-sm text-muted-foreground">
                      a partir de {brl(pisoDe(produto))}/mês
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-2 font-medium text-primary">
                    Ver planos e detalhes
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Combo + faixa de diferenciação (reuso da seção de assinatura) */}
        <section className="mt-16 px-4 sm:mt-24 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:gap-14">
            {MOSTRAR_COMBO && <ComboSection />}
            <DiferenciacaoBand />
          </div>
        </section>

        <CtaFinal secondary={null} />
      </main>
      <Footer />
    </>
  )
}
