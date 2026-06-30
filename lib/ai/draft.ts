import type { Pilar, RevisionInput } from "@/lib/content/queries"
import { slugify } from "@/lib/content/slug"
import { callStructured, isAiConfigured } from "@/lib/ai/client"

export { isAiConfigured }

// Tema editorial por pilar (público: PMEs da Baixada Fluminense).
const PILAR_BRIEF: Record<Pilar, string> = {
  p1: "Engenharia + IA: como software sob medida e automações inteligentes resolvem problemas reais de PMEs (advocacia, contabilidade, clínicas). Tom prático, sem jargão.",
  p2: "Negócio / PME: eficiência operacional, processos, custos e crescimento para pequenas e médias empresas. Foco em resultado de negócio, linguagem acessível.",
  p3: "Bastidores: cultura, método e decisões da Sapienza Labs ao construir produtos digitais. Tom autêntico e transparente.",
}

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Título do post, claro e atraente" },
    slug: { type: "string", description: "slug-em-minusculas-com-hifens" },
    excerpt: { type: "string", description: "Resumo de 1–2 frases" },
    bodyMarkdown: { type: "string", description: "Corpo em Markdown (## headings, listas, ~600-900 palavras)" },
    keywords: { type: "array", items: { type: "string" }, description: "5-8 palavras-chave de SEO" },
  },
  required: ["title", "slug", "excerpt", "bodyMarkdown", "keywords"],
  additionalProperties: false,
} as const

export type GeneratedDraft = {
  pilar: Pilar
  slug: string
  rev: RevisionInput
  model: string
}

// Temas já publicados (a evitar) + sementes de tema (áreas sugeridas pela IA).
export type DraftThemeContext = {
  avoidTitles?: string[]
  themeSeeds?: string[]
}

// Monta o bloco de renovação de tema: evita repetir o que já existe e sugere
// ângulos novos a partir das áreas relacionadas geradas pelo analisador temático.
export function themeGuidance(ctx?: DraftThemeContext): string {
  const avoid = (ctx?.avoidTitles ?? []).filter(Boolean).slice(0, 40)
  const seeds = (ctx?.themeSeeds ?? []).filter(Boolean).slice(0, 12)
  let block = ""
  if (avoid.length) {
    block +=
      `\n\nTEMAS JÁ PUBLICADOS — NÃO repita nem reescreva variações destes:\n- ` +
      avoid.join("\n- ")
  }
  if (seeds.length) {
    block +=
      `\n\nÁREAS SUGERIDAS para explorar (escolha UMA e aprofunde com ângulo próprio):\n- ` +
      seeds.join("\n- ")
  }
  block +=
    "\n\nEscolha um tema NOVO, específico e claramente diferente dos já publicados."
  return block
}

// Gera um rascunho de post para o pilar via Claude (structured output).
export async function generateDraft(
  pilar: Pilar,
  themeContext?: DraftThemeContext,
): Promise<GeneratedDraft> {
  const system =
    "Você é redator(a) da Sapienza Labs, um estúdio de software sob medida para PMEs da " +
    "Baixada Fluminense. Escreva em pt-BR correto e natural, com acentuação adequada. " +
    "Conteúdo original, útil e específico — sem clichês de IA. Não invente dados ou clientes."

  const user =
    `Escreva um artigo de blog para o pilar abaixo.\n\nPILAR: ${PILAR_BRIEF[pilar]}\n\n` +
    "Requisitos: título objetivo; slug em kebab-case; excerpt curto; corpo em Markdown " +
    "(use ## para subtítulos, listas quando ajudar; 600–900 palavras); 5–8 keywords de SEO. " +
    "Inclua um CTA leve para falar com a Sapienza Labs no WhatsApp ao final." +
    themeGuidance(themeContext)

  const { data, model } = await callStructured<{
    title: string
    slug: string
    excerpt: string
    bodyMarkdown: string
    keywords: string[]
  }>({ system, user, schema: SCHEMA, maxTokens: 16000 })

  return {
    pilar,
    slug: slugify(data.slug || data.title),
    rev: {
      title: data.title.trim(),
      bodyMarkdown: data.bodyMarkdown.trim(),
      excerpt: data.excerpt.trim(),
      seo: { keywords: data.keywords },
    },
    model,
  }
}
