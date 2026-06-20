import type { Pilar } from "@/lib/content/queries"

// Espelha o enum platform do schema.
export type Platform = "instagram" | "linkedin"

export type SocialInput = {
  title: string
  bodyMarkdown: string
  excerpt: string
  pilar: Pilar | null
  url: string
}

export type SocialGenerator = {
  platform: Platform
  label: string
  system: string
  buildUser: (input: SocialInput) => string
  schema: Record<string, unknown>
}

const SCHEMA = {
  type: "object",
  properties: {
    body: { type: "string", description: "Texto do post, pronto para publicar" },
    hashtags: { type: "array", items: { type: "string" }, description: "sem o #" },
  },
  required: ["body", "hashtags"],
  additionalProperties: false,
} as const

function block(i: SocialInput): string {
  return [
    `Artigo: ${i.title}`,
    `Resumo: ${i.excerpt}`,
    `Pilar: ${i.pilar ?? "-"}`,
    `Link: ${i.url}`,
    "",
    "Conteúdo (Markdown):",
    i.bodyMarkdown,
  ].join("\n")
}

const BASE =
  "Você cuida das redes da Sapienza Labs (software sob medida para PMEs da Baixada " +
  "Fluminense). Escreva em pt-BR, natural e específico. Inclua um CTA para o link/WhatsApp. " +
  "Retorne hashtags sem o caractere #."

const generators: Record<Platform, SocialGenerator> = {
  instagram: {
    platform: "instagram",
    label: "Instagram",
    system: `${BASE} Tom acessível e caloroso; emojis com moderação; quebras de linha curtas.`,
    buildUser: (i) =>
      `Crie uma legenda de Instagram a partir do artigo. Gancho forte na 1ª linha, ` +
      `corpo escaneável e CTA. 8–12 hashtags relevantes (mix de alcance e nicho local).\n\n${block(i)}`,
    schema: SCHEMA,
  },
  linkedin: {
    platform: "linkedin",
    label: "LinkedIn",
    system: `${BASE} Tom profissional e direto; sem emojis em excesso; foco em valor de negócio.`,
    buildUser: (i) =>
      `Crie um post de LinkedIn a partir do artigo. Abertura que prende, 2–4 parágrafos ` +
      `curtos com insight prático para gestores de PME e CTA. 3–5 hashtags.\n\n${block(i)}`,
    schema: SCHEMA,
  },
}

export function getSocialGenerator(platform: Platform): SocialGenerator | undefined {
  return generators[platform]
}

export const SOCIAL_PLATFORMS: { platform: Platform; label: string }[] = Object.values(
  generators,
).map((g) => ({ platform: g.platform, label: g.label }))
