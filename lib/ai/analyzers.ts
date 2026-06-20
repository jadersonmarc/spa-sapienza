import type { Pilar, Seo } from "@/lib/content/queries"

// Espelha o enum analysis_type do schema (mantido local p/ não acoplar ao driver de DB).
export type AnalysisType = "quality" | "seo" | "emotional" | "thematic"

export type AnalyzerInput = {
  title: string
  bodyMarkdown: string
  excerpt: string
  seo: Seo
  pilar: Pilar | null
}

export type Analyzer = {
  type: AnalysisType
  label: string
  system: string
  buildUser: (input: AnalyzerInput) => string
  schema: Record<string, unknown>
}

const strArray = { type: "array", items: { type: "string" } }

// Bloco comum com o snapshot da revisão.
function contentBlock(i: AnalyzerInput): string {
  return [
    `Título: ${i.title}`,
    `Resumo: ${i.excerpt || "(sem resumo)"}`,
    `Pilar: ${i.pilar ?? "(página)"}`,
    i.seo?.keywords?.length ? `Keywords atuais: ${i.seo.keywords.join(", ")}` : "",
    "",
    "Corpo (Markdown):",
    i.bodyMarkdown,
  ]
    .filter(Boolean)
    .join("\n")
}

const BASE_SYSTEM =
  "Você é editor(a) sênior da Sapienza Labs (conteúdo pt-BR para PMEs da Baixada " +
  "Fluminense). Seja específico e acionável; nada de generalidades. Responda em pt-BR."

const analyzers: Record<AnalysisType, Analyzer> = {
  quality: {
    type: "quality",
    label: "Qualidade",
    system: `${BASE_SYSTEM} Avalie qualidade, legibilidade e estrutura do texto.`,
    buildUser: (i) =>
      `Analise a qualidade do conteúdo abaixo. Dê um score de 0 a 100, um resumo do ` +
      `diagnóstico, pontos fortes e recomendações acionáveis.\n\n${contentBlock(i)}`,
    schema: {
      type: "object",
      properties: {
        score: { type: "number", description: "0 a 100" },
        summary: { type: "string" },
        strengths: strArray,
        recommendations: strArray,
      },
      required: ["score", "summary", "strengths", "recommendations"],
      additionalProperties: false,
    },
  },

  seo: {
    type: "seo",
    label: "SEO",
    system: `${BASE_SYSTEM} Avalie a visibilidade em busca (SEO on-page).`,
    buildUser: (i) =>
      `Avalie o SEO do conteúdo. Score 0-100, sugestão de título, meta description ` +
      `(<=160 caracteres), keywords sugeridas, dicas de headings e observações sobre ` +
      `densidade/uso de termos.\n\n${contentBlock(i)}`,
    schema: {
      type: "object",
      properties: {
        score: { type: "number", description: "0 a 100" },
        titleSuggestion: { type: "string" },
        metaDescription: { type: "string" },
        suggestedKeywords: strArray,
        headingTips: strArray,
        notes: strArray,
      },
      required: ["score", "titleSuggestion", "metaDescription", "suggestedKeywords", "headingTips", "notes"],
      additionalProperties: false,
    },
  },

  emotional: {
    type: "emotional",
    label: "Impacto emocional",
    system: `${BASE_SYSTEM} Avalie tom emocional e impacto do texto no leitor.`,
    buildUser: (i) =>
      `Analise o tom emocional e o impacto do conteúdo. Indique o tom dominante, um ` +
      `score de impacto 0-100, uma análise e sugestões para fortalecer a conexão com ` +
      `o leitor PME.\n\n${contentBlock(i)}`,
    schema: {
      type: "object",
      properties: {
        dominantTone: { type: "string" },
        score: { type: "number", description: "0 a 100" },
        analysis: { type: "string" },
        suggestions: strArray,
      },
      required: ["dominantTone", "score", "analysis", "suggestions"],
      additionalProperties: false,
    },
  },

  thematic: {
    type: "thematic",
    label: "Temática",
    system: `${BASE_SYSTEM} Extraia os temas e sugira áreas de conteúdo relacionadas.`,
    buildUser: (i) =>
      `Identifique os tópicos principais do conteúdo e sugira áreas de conteúdo ` +
      `relacionadas (ideias para o calendário editorial). Inclua um resumo temático.\n\n${contentBlock(i)}`,
    schema: {
      type: "object",
      properties: {
        mainTopics: strArray,
        relatedAreas: strArray,
        summary: { type: "string" },
      },
      required: ["mainTopics", "relatedAreas", "summary"],
      additionalProperties: false,
    },
  },
}

export function getAnalyzer(type: AnalysisType): Analyzer | undefined {
  return analyzers[type]
}

export const ANALYZER_LIST: { type: AnalysisType; label: string }[] = Object.values(
  analyzers,
).map((a) => ({ type: a.type, label: a.label }))
