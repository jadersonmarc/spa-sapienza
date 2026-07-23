import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight, Bot, PenLine } from "lucide-react"
import { Eyebrow } from "@/components/eyebrow"
import { DEFAULT_HOME, type HeroBlock } from "@/lib/content/pages"
import { whatsappUrl } from "@/lib/contact"
import { getProducts, type ProdutoId } from "@/lib/pricing"
import { PRODUTO_COPY } from "@/lib/products-config"

// Ícone por produto (carro-chefe da marca Margot).
const PRODUTO_ICON: Record<ProdutoId, typeof Bot> = {
  margot: Bot,
  motor: PenLine,
}

export function Hero({ block = DEFAULT_HOME.hero }: { block?: HeroBlock }) {
  const produtos = getProducts()

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden sm:px-6 lg:px-8">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl sm:w-96 sm:h-96" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Eyebrow className="mb-5 justify-center sm:mb-6">{block.badge}</Eyebrow>

        <h1 className="font-display text-[2rem] font-semibold leading-[1.08] tracking-tight text-foreground text-balance mb-4 sm:text-5xl sm:mb-6 md:text-6xl">
          {block.titleLead}{" "}
          <span className="text-primary">{block.titleHighlight}</span>
        </h1>

        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed sm:text-lg sm:mb-12 md:text-xl">
          {block.subtitle}
        </p>

        {/* Carro-chefe: os produtos Margot em destaque */}
        <div className="mx-auto grid max-w-2xl gap-4 text-left sm:grid-cols-2">
          {produtos.map(({ id, produto }) => {
            const Icon = PRODUTO_ICON[id]
            return (
              <div
                key={id}
                className="glass flex flex-col rounded-2xl border border-border/60 p-5 transition-colors hover:border-primary/30 sm:p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {produto.nome}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {PRODUTO_COPY[id].promessa}
                </p>
                <Button asChild variant="outline" className="group mt-5 w-full">
                  <Link href="#produtos">
                    Ver planos
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>

        {/* Secundário: falar com a gente */}
        <div className="mt-8">
          <a
            href={whatsappUrl("Olá! Quero agendar um diagnóstico (sem custo).")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            {block.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
