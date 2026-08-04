import Image from "next/image"
import Link from "next/link"
import { Bot, PenLine, MessageCircle, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/eyebrow"
import { Tag } from "@/components/tag"
import { Footer } from "@/components/footer"
import { CtaFinal } from "@/components/cta-final"
import { ProdutoGrid } from "@/components/subscription-products"
import { whatsappUrl } from "@/lib/contact"
import { getProducts, type ProdutoId } from "@/lib/pricing"
import { PRODUTO_COPY } from "@/lib/products-config"

const CONSOLE_URL = process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://console.sapienzalabs.com.br"

const PRODUTO_ICON: Record<ProdutoId, typeof Bot> = {
  margot: Bot,
  motor: PenLine,
}

// FAQ curto por produto — dúvidas de compra que o dono de PME sempre tem.
const FAQ: Record<ProdutoId, { q: string; a: string }[]> = {
  margot: [
    {
      q: "Preciso de um número de WhatsApp separado?",
      a: "Sim — a Margot atende num número dedicado da empresa, para não misturar com o seu pessoal. A gente ajuda a configurar na conversa.",
    },
    {
      q: "E quando a conversa foge do script?",
      a: "A Margot reconhece quando precisa de gente e passa o bastão para você, com o histórico da conversa já organizado.",
    },
    {
      q: "Tenho fidelidade?",
      a: "Sem fidelidade abusiva. A estrutura de pagamento é combinada para caber no seu caixa — o resto a gente conversa no WhatsApp.",
    },
  ],
  motor: [
    {
      q: "O conteúdo sai no meu tom ou genérico?",
      a: "No seu tom. Você define voz, temas e público uma vez, e a Margot escreve a partir disso — você aprova antes de publicar.",
    },
    {
      q: "Em quais canais ela publica?",
      a: "Blog, Instagram e LinkedIn, conforme o seu plano. Você conecta os canais e ela publica no lugar certo.",
    },
    {
      q: "Preciso revisar tudo?",
      a: "Só se quiser. Você aprova cada peça — ou deixa uma janela passar e ela publica sozinha. O controle é seu.",
    },
  ],
}

/** Página de detalhe de um produto Margot (Atendente = margot, Editora = motor).
 *  Estrutura: hero de produto → o que é → para quem → como funciona → prova →
 *  planos (reusa ProdutoGrid) → FAQ → CTA. */
export function MargotProductPage({ id }: { id: ProdutoId }) {
  const entry = getProducts().find((p) => p.id === id)
  if (!entry) return null
  const { produto } = entry
  const copy = PRODUTO_COPY[id]
  const Icon = PRODUTO_ICON[id]

  return (
    <>
      <main className="min-h-screen pt-32 pb-20">
        {/* Hero do produto */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <Eyebrow className="mb-4">{produto.nome}</Eyebrow>
            <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {copy.promessa}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {copy.oQueE}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href={`${CONSOLE_URL}/assinar?produto=${id}&tier=pro`}>
                  Assinar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <a
                href={whatsappUrl(`Olá! Quero entender como a ${produto.nome} funciona para a minha empresa.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com vendas
              </a>
            </div>
          </div>
        </section>

        {/* Para quem */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
              <Eyebrow className="mb-3">Para quem é</Eyebrow>
              <p className="font-display text-lg text-foreground sm:text-xl">{copy.paraQuem}</p>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <Eyebrow className="mb-6">Como funciona</Eyebrow>
            <ol className="flex flex-col gap-4">
              {copy.comoFunciona.map((passo, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 font-mono text-sm tabular-nums text-primary">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-base leading-relaxed text-foreground/90">{passo}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Prova — o fundador responde por cada entrega */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="glass flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-primary/25">
                <Image
                  src="/owner.jpeg"
                  alt="Marc Jaderson, fundador da Sapienza Labs"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div>
                <Tag tone="primary" className="mb-3">
                  Feito e operado pela Sapienza
                </Tag>
                <p className="text-base leading-relaxed text-foreground/90">
                  A Margot é um produto nosso, construído e mantido aqui — não é revenda. Você fala
                  com quem faz a engenharia por trás dela.
                </p>
                <p className="mt-3 font-display font-semibold text-foreground">
                  Marc Jaderson · fundador
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Planos — reusa o grid de tiers do pricing público */}
        <section id="planos" className="mt-16 scroll-mt-28 px-4 sm:mt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center sm:mb-14">
              <Eyebrow className="mb-4">Planos</Eyebrow>
              <h2 className="text-balance font-display text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                Escolha o plano e comece hoje
              </h2>
            </div>
            <ProdutoGrid id={id} produto={produto} />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16 px-4 sm:mt-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <Eyebrow className="mb-6">Perguntas frequentes</Eyebrow>
            <dl className="flex flex-col gap-5">
              {FAQ[id].map((item) => (
                <div key={item.q} className="border-t border-border/50 pt-5">
                  <dt className="flex items-start gap-2 font-display text-base font-semibold text-foreground">
                    <Check className="mt-1 h-4 w-4 flex-shrink-0 text-primary" aria-hidden />
                    {item.q}
                  </dt>
                  <dd className="mt-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <CtaFinal secondary={null} />
      </main>
      <Footer />
    </>
  )
}
