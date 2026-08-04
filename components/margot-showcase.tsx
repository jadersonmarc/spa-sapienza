import Link from "next/link"
import { Bot, PenLine, ArrowRight, ArrowUpRight } from "lucide-react"
import { Eyebrow } from "@/components/eyebrow"
import { brl, getProducts, pisoDe, type ProdutoId } from "@/lib/pricing"
import { PRODUTO_COPY, TRANSPARENCIA } from "@/lib/products-config"

const PRODUTO_ICON: Record<ProdutoId, typeof Bot> = {
  margot: Bot,
  motor: PenLine,
}

const PRODUTO_HREF: Record<ProdutoId, string> = {
  margot: "/margot/atendente",
  motor: "/margot/editora",
}

const mostraPreco = TRANSPARENCIA !== "sob_consulta"

// Vitrine dos produtos Margot na home — NÃO é o pricing inteiro (esse mora em
// /margot). Aqui só apresenta os dois e leva para a página dedicada.
export function MargotShowcase() {
  const produtos = getProducts()

  return (
    <section className="py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <Eyebrow className="mb-4">Produtos Margot</Eyebrow>
          <h2 className="mb-3 text-balance font-display text-2xl font-semibold text-foreground sm:mb-4 sm:text-3xl md:text-4xl">
            Prefere um produto pronto? Conheça a Margot.
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Além do sob medida, operamos dois produtos de IA por assinatura — atendimento e conteúdo,
            trabalhando por você todo mês.
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
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
                <h3 className="mt-5 font-display text-xl font-semibold text-foreground sm:text-2xl">
                  {produto.nome}
                </h3>
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

        <div className="mt-8 text-center sm:mt-10">
          <Link
            href="/margot"
            className="group inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
          >
            Ver os produtos e o combo
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
