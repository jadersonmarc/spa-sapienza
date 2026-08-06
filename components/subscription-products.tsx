import Link from "next/link"
import { Check, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag } from "@/components/tag"
import { Eyebrow } from "@/components/eyebrow"
import { Button } from "@/components/ui/button"
import { whatsappUrl } from "@/lib/contact"
import {
  brl,
  type Combo,
  comboDe,
  comboInclusos,
  getComercial,
  getCombos,
  getProducts,
  metricLabel,
  pisoDe,
  type Produto,
  type ProdutoId,
  type Tier,
  tierLabel,
} from "@/lib/pricing"
import {
  COMBO_COPY,
  MOSTRAR_COMBO,
  PRODUTO_COPY,
  TIER_DESTAQUE,
  TIER_ENQUADRAMENTO,
  TRANSPARENCIA,
} from "@/lib/products-config"

const CONSOLE_URL = process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://console.sapienzalabs.com.br"

// Seção de PRODUTOS POR ASSINATURA (Margot / Motor). Estratégia hibrido: valor
// exposto (tiers/inclusos vindos da projeção pública do pricing.yaml), negócio
// conversado (setup/portas/combo ficam para o WhatsApp). Preço nunca chumbado aqui.

const mostraPreco = TRANSPARENCIA !== "sob_consulta"

// Mensagem de WhatsApp pré-preenchida com produto + tier.
function ctaText(nomeProduto: string, tier: Tier): string {
  return `Olá! Vi o plano ${nomeProduto} ${tierLabel(tier.id)} no site e gostaria de entender como funciona para a minha empresa.`
}

function inclusosLine(produto: Produto, tier: Tier): string {
  const unidade = metricLabel(produto.metric)
  return `${tier.incluso.toLocaleString("pt-BR")} ${unidade} por mês`
}

export function TierCard({
  id,
  produto,
  tier,
}: {
  id: ProdutoId
  produto: Produto
  tier: Tier
}) {
  const destaque = tier.id === TIER_DESTAQUE
  const enquadramentoKey = TIER_ENQUADRAMENTO[tier.id] as "entrada" | "resolve" | undefined
  const enquadramento = enquadramentoKey ? PRODUTO_COPY[id][enquadramentoKey] : undefined

  return (
    <Card
      className={`glass flex flex-col transition-colors duration-300 ${
        destaque
          ? "border-primary/40 ring-1 ring-primary/20 hover:border-primary/60"
          : "border-border/50 hover:border-primary/30"
      }`}
    >
      <CardHeader>
        {destaque && (
          <Tag tone="primary" className="mb-1">
            Mais escolhido
          </Tag>
        )}
        <CardTitle className="text-xl font-semibold text-card-foreground font-display">
          {tierLabel(tier.id)}
        </CardTitle>
        {mostraPreco ? (
          <div className="font-mono text-sm text-muted-foreground">
            <p>
              <span className="text-2xl font-semibold text-foreground">{brl(tier.mensal)}</span>
              <span className="ml-1">/mês</span>
              <span className="ml-1 text-xs">no anual</span>
            </p>
            <p className="mt-0.5 text-xs">ou {brl(tier.mensal_sf)}/mês no mensal</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Investimento mensal — a combinar</p>
        )}
        {enquadramento && (
          <p className="text-muted-foreground text-sm leading-relaxed">{enquadramento}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="flex flex-col gap-2 text-sm text-foreground/90">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{inclusosLine(produto, tier)}</span>
          </li>
          {tier.canais != null && (
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                {tier.canais} {tier.canais === 1 ? "canal" : "canais"} de publicação
              </span>
            </li>
          )}
        </ul>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button className="w-full" variant={destaque ? "default" : "outline"} asChild>
          <Link href={`${CONSOLE_URL}/assinar?produto=${id}&tier=${tier.id}`}>
            Assinar o {tierLabel(tier.id)}
          </Link>
        </Button>
        <a
          href={whatsappUrl(ctaText(produto.nome, tier))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Falar com vendas
        </a>
      </CardFooter>
    </Card>
  )
}

export function ProdutoGrid({ id, produto }: { id: ProdutoId; produto: Produto }) {
  const copy = PRODUTO_COPY[id]
  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <Eyebrow className="mb-3">{produto.nome}</Eyebrow>
        <p className="text-foreground text-lg text-balance max-w-2xl sm:text-xl">{copy.promessa}</p>
        {mostraPreco && (
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            a partir de {brl(pisoDe(produto))}/mês
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {produto.tiers.map((tier) => (
          <TierCard key={tier.id} id={id} produto={produto} tier={tier} />
        ))}
      </div>
    </div>
  )
}

// Faixa que explica os DOIS modelos de assinatura (você escolhe no checkout).
export function DiferenciacaoBand() {
  return (
    <div className="glass rounded-lg border border-border/50 px-6 py-5">
      <p className="mb-3 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Dois jeitos de assinar — você escolhe no checkout
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="font-display text-base font-semibold text-foreground">Anual</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Contrato de 12 meses, <span className="text-foreground">mais barato</span> e{" "}
            <span className="text-foreground">sem taxa de implantação</span>. Pago mensalmente no cartão.
          </p>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-foreground">Mensal</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            <span className="text-foreground">Sem fidelidade</span> — cancela quando quiser. A implantação
            equivale a uma mensalidade, cobrada só na adesão.
          </p>
        </div>
      </div>
    </div>
  )
}

// Bloco "Como você paga" — SÓ no modo total e SÓ se o JSON foi gerado com --full.
function ComoVocePaga() {
  const comercial = getComercial()
  if (!comercial) return <DiferenciacaoBand />
  return (
    <div className="glass rounded-lg border border-border/50 px-6 py-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Como você paga</h3>
      <ul className="grid gap-3 sm:grid-cols-3">
        {comercial.portas.map((porta) => (
          <li key={porta.id} className="text-sm text-foreground/90">
            <span className="font-mono text-muted-foreground">entrada</span>{" "}
            <span className="font-semibold text-foreground">{brl(porta.entrada)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        Setup a partir de {brl(comercial.setup.padrao)}. Combine a porta que cabe no seu caixa.
      </p>
    </div>
  )
}

// Card de combo (margot + motor no mesmo tier): de/por/economia + assinatura no console.
function ComboCard({ combo }: { combo: Combo }) {
  const destaque = combo.tier === TIER_DESTAQUE
  const de = comboDe(combo.tier)
  const { respostas, pecas } = comboInclusos(combo.tier)

  return (
    <Card
      className={`glass flex flex-col transition-colors duration-300 ${
        destaque
          ? "border-primary/40 ring-1 ring-primary/20 hover:border-primary/60"
          : "border-border/50 hover:border-primary/30"
      }`}
    >
      <CardHeader>
        {destaque && (
          <Tag tone="primary" className="mb-1">
            Mais escolhido
          </Tag>
        )}
        <CardTitle className="text-xl font-semibold text-card-foreground font-display">
          Combo {tierLabel(combo.tier)}
        </CardTitle>
        {mostraPreco ? (
          <div className="font-mono text-sm text-muted-foreground">
            <p>
              <span className="mr-2 line-through">{brl(de)}</span>
              <span className="text-2xl font-semibold text-foreground">{brl(combo.mensal)}</span>
              <span className="ml-1">/mês</span>
              <span className="ml-1 text-xs">no anual</span>
            </p>
            <p className="mt-0.5 text-xs">ou {brl(combo.mensal_sf)}/mês no mensal</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Investimento mensal — a combinar</p>
        )}
        {mostraPreco && (
          <Tag tone="primary" className="mt-1 w-fit">
            economize {brl(combo.economia)}/mês
          </Tag>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="flex flex-col gap-2 text-sm text-foreground/90">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{respostas.toLocaleString("pt-BR")} {metricLabel("resposta")} por mês</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{pecas.toLocaleString("pt-BR")} {metricLabel("peca")} por mês</span>
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        <Button className="w-full" variant={destaque ? "default" : "outline"} asChild>
          <Link href={`${CONSOLE_URL}/assinar?produto=combo&tier=${combo.tier}`}>
            Assinar o Combo {tierLabel(combo.tier)}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ComboSection() {
  const combos = getCombos()
  if (combos.length === 0) return null
  return (
    <div className="border-t border-border/50 pt-10 sm:pt-14">
      <div className="mb-6 sm:mb-8">
        <Eyebrow className="mb-3">{COMBO_COPY.eyebrow}</Eyebrow>
        <h3 className="font-display text-xl font-semibold text-foreground text-balance max-w-2xl sm:text-2xl">
          {COMBO_COPY.titulo}
        </h3>
        <p className="mt-2 text-foreground/90 text-base text-balance max-w-2xl">
          {COMBO_COPY.promessa}
        </p>
      </div>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {combos.map((combo) => (
          <ComboCard key={combo.tier} combo={combo} />
        ))}
      </div>
    </div>
  )
}

export function SubscriptionProducts() {
  return (
    <section id="produtos" className="py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <Eyebrow className="mb-4">Produtos por assinatura</Eyebrow>
          <h2 className="text-2xl font-semibold text-foreground mb-3 text-balance font-display sm:text-3xl sm:mb-4 md:text-4xl">
            Dois produtos que trabalham por você, todo mês
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto sm:text-lg">
            Escolha o que a sua empresa precisa agora. Sem contrato de amarrar — a gente combina o
            resto no WhatsApp.
          </p>
        </div>

        <div className="flex flex-col gap-12 sm:gap-16">
          {getProducts().map(({ id, produto }) => (
            <ProdutoGrid key={id} id={id} produto={produto} />
          ))}
          {MOSTRAR_COMBO && <ComboSection />}
        </div>

        <div className="mt-10 sm:mt-14 flex flex-col gap-6">
          {TRANSPARENCIA === "total" ? <ComoVocePaga /> : <DiferenciacaoBand />}
        </div>
      </div>
    </section>
  )
}
