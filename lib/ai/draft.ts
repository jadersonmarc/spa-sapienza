import Anthropic from "@anthropic-ai/sdk"
import type { Pilar, RevisionInput } from "@/lib/content/queries"

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

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

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export type GeneratedDraft = {
  pilar: Pilar
  slug: string
  rev: RevisionInput
  model: string
}

// Gera um rascunho de post para o pilar via Claude (structured output).
export async function generateDraft(pilar: Pilar): Promise<GeneratedDraft> {
  if (!isAiConfigured()) {
    throw new Error("ANTHROPIC_API_KEY não configurada.")
  }
  const client = new Anthropic()
  const model = "claude-opus-4-8"

  const system =
    "Você é redator(a) da Sapienza Labs, um estúdio de software sob medida para PMEs da " +
    "Baixada Fluminense. Escreva em pt-BR correto e natural, com acentuação adequada. " +
    "Conteúdo original, útil e específico — sem clichês de IA. Não invente dados ou clientes."

  const response = await client.messages.create({
    model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "medium" },
    system,
    messages: [
      {
        role: "user",
        content:
          `Escreva um artigo de blog para o pilar abaixo.\n\nPILAR: ${PILAR_BRIEF[pilar]}\n\n` +
          "Requisitos: título objetivo; slug em kebab-case; excerpt curto; corpo em Markdown " +
          "(use ## para subtítulos, listas quando ajudar; 600–900 palavras); 5–8 keywords de SEO. " +
          "Inclua um CTA leve para falar com a Sapienza Labs no WhatsApp ao final.",
      },
    ],
  })

  const text = response.content.find((b) => b.type === "text")
  if (!text || text.type !== "text") {
    throw new Error("Resposta do modelo sem conteúdo de texto.")
  }
  const data = JSON.parse(text.text) as {
    title: string
    slug: string
    excerpt: string
    bodyMarkdown: string
    keywords: string[]
  }

  return {
    pilar,
    slug: slugify(data.slug || data.title),
    rev: {
      title: data.title.trim(),
      bodyMarkdown: data.bodyMarkdown.trim(),
      excerpt: data.excerpt.trim(),
      seo: { keywords: data.keywords },
    },
    model: response.model,
  }
}
