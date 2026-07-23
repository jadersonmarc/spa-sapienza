import pricingData from "@/config/pricing.public.json"

// Fonte de preço do site = projeção pública gerada pelo core (pnpm pricing:public no
// sapienza-core, a partir do config/pricing.yaml). Nunca chumbar preço aqui: os valores
// vêm SEMPRE deste JSON. Números comerciais (setup/portas/combo/excedente) não entram
// no site — o JSON público não os contém no modo default.

export type Tier = {
  id: string
  mensal: number
  incluso: number
  canais?: number
}

export type Produto = {
  nome: string
  metric: string
  tiers: Tier[]
}

// Bloco comercial só existe quando o JSON foi gerado com --full (modo TRANSPARENCIA=total).
export type Comercial = {
  setup: { padrao: number; porta_assinatura: number; degrau_13: boolean }
  combo: { setup: number; mensal_start: number; assinatura: { setup: number; mensal: number } }
  portas: { id: string; entrada: number; premio_mensal_pct: number }[]
}

export type PublicPricing = {
  currency: string
  produtos: { margot: Produto; motor: Produto }
  comercial?: Comercial
}

const pricing = pricingData as PublicPricing

/** Ordem canônica dos produtos na seção. */
export const PRODUTO_IDS = ["margot", "motor"] as const
export type ProdutoId = (typeof PRODUTO_IDS)[number]

export function getProducts(): { id: ProdutoId; produto: Produto }[] {
  return PRODUTO_IDS.map((id) => ({ id, produto: pricing.produtos[id] }))
}

/** Bloco comercial (só presente com JSON --full). */
export function getComercial(): Comercial | undefined {
  return pricing.comercial
}

/** Rótulo da unidade a partir do campo `metric` — nunca assumir. */
export function metricLabel(metric: string, plural = true): string {
  const map: Record<string, [string, string]> = {
    resposta: ["resposta", "respostas"],
    peca: ["peça", "peças"],
  }
  const pair = map[metric] ?? [metric, metric]
  return plural ? pair[1] : pair[0]
}

/** Nome comercial do tier. */
export function tierLabel(id: string): string {
  const map: Record<string, string> = { start: "Start", pro: "Pro", scale: "Scale" }
  return map[id] ?? id
}

/** Formata BRL sem centavos (mensalidades são inteiras). */
export function brl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

/** Menor mensalidade de um produto — base do rótulo honesto "a partir de". */
export function pisoDe(produto: Produto): number {
  return Math.min(...produto.tiers.map((t) => t.mensal))
}

/** Localiza produto+tier pelos ids (checkout). undefined se qualquer um for inválido. */
export function findTier(
  produtoId: string,
  tierId: string,
): { id: ProdutoId; produto: Produto; tier: Tier } | undefined {
  if (!(PRODUTO_IDS as readonly string[]).includes(produtoId)) return undefined
  const id = produtoId as ProdutoId
  const produto = pricing.produtos[id]
  const tier = produto.tiers.find((t) => t.id === tierId)
  return tier ? { id, produto, tier } : undefined
}
