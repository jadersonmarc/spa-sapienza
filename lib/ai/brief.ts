import { slugify } from "@/lib/content/slug"
import { callStructured, isAiConfigured } from "@/lib/ai/client"
import { getVertente } from "@/lib/content/vertentes"

export { isAiConfigured }

// Produtor SEPARADO do cron (lib/ai/draft.ts): gera um rascunho a partir de um
// brief livre do editor + a config de IA da vertente. Não compartilha código com
// o gerador do cron por decisão de projeto (não-regressão).

export type BriefInput = {
  vertenteKey: string
  objetivo: string
  pontosChave?: string
  publico?: string
  tom?: string
}

export type BriefDraft = {
  title: string
  slug: string
  excerpt: string
  bodyMarkdown: string
  keywords: string[]
  model: string
}

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Título claro e atraente" },
    slug: { type: "string", description: "slug-em-minusculas-com-hifens" },
    excerpt: { type: "string", description: "Resumo de 1–2 frases" },
    bodyMarkdown: { type: "string", description: "Corpo em Markdown (## headings, listas, ~600-900 palavras)" },
    keywords: { type: "array", items: { type: "string" }, description: "5-8 palavras-chave de SEO" },
  },
  required: ["title", "slug", "excerpt", "bodyMarkdown", "keywords"],
  additionalProperties: false,
} as const

// Monta o prompt do usuário a partir do brief (parte pura, testável).
export function buildBriefUser(input: BriefInput): string {
  const v = getVertente(input.vertenteKey)
  const tom = (input.tom || v?.ai.tone || "").trim()
  const lines = [
    "Escreva um artigo a partir do brief abaixo.",
    "",
    `OBJETIVO / EXPECTATIVA: ${input.objetivo.trim()}`,
    input.pontosChave?.trim() ? `PONTOS-CHAVE:\n${input.pontosChave.trim()}` : "",
    input.publico?.trim() ? `PÚBLICO: ${input.publico.trim()}` : "",
    v ? `VERTENTE: ${v.label}` : "",
    tom ? `TOM: ${tom}` : "",
    "",
    "Requisitos: título objetivo; slug em kebab-case; excerpt curto; corpo em Markdown " +
      "(use ## para subtítulos, listas quando ajudar; 600–900 palavras); 5–8 keywords de SEO.",
  ]
  return lines.filter(Boolean).join("\n")
}

export async function generateFromBrief(input: BriefInput): Promise<BriefDraft> {
  const v = getVertente(input.vertenteKey)
  const system = v?.ai.system ??
    "Você é redator(a) da Sapienza Labs (pt-BR, PMEs da Baixada Fluminense). Conteúdo original e específico."

  const { data, model } = await callStructured<{
    title: string
    slug: string
    excerpt: string
    bodyMarkdown: string
    keywords: string[]
  }>({ system, user: buildBriefUser(input), schema: SCHEMA, maxTokens: 16000 })

  return {
    title: data.title.trim(),
    slug: slugify(data.slug || data.title),
    excerpt: data.excerpt.trim(),
    bodyMarkdown: data.bodyMarkdown.trim(),
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    model,
  }
}
