// Registry de "vertentes" — estende os pilares editoriais (p1/p2/p3) com vertentes
// avulsas (campanha, produto), SEM tocar no enum `pilar` nem no cron.
//
// Modelagem aditiva: um post de pilar guarda `pilar` (como hoje) e `vertente=null`;
// uma vertente avulsa guarda `pilar=null` e `vertente=<key>`. Ver lib/db/schema.ts
// (coluna aditiva `content_items.vertente`).
import type { Pilar } from "@/lib/content/queries"

export type VertenteKind = "pilar" | "campaign" | "product"
export type VertenteSection = "blog" | "campanhas"

export type Vertente = {
  key: string
  label: string
  kind: VertenteKind
  /** Entra no rodízio editorial do cron? (documental — o cron mantém sua própria lista) */
  rotation: boolean
  /** Onde aparece no site: índice editorial /blog ou a rota avulsa /campanhas. */
  section: VertenteSection
  /** Config de IA da vertente (usada pela geração por brief, não pelo cron). */
  ai: { system: string; tone: string }
}

const BASE_AI_SYSTEM =
  "Você é redator(a) da Sapienza Labs, estúdio de software sob medida para PMEs da Baixada " +
  "Fluminense. Escreva em pt-BR correto e natural, com acentuação adequada. Conteúdo original, " +
  "útil e específico — sem clichês de IA. Não invente dados ou clientes."

// Ordem importa para a UI (pilares primeiro, depois as avulsas).
export const VERTENTES: readonly Vertente[] = [
  {
    key: "p1",
    label: "Engenharia + IA",
    kind: "pilar",
    rotation: true,
    section: "blog",
    ai: {
      system: `${BASE_AI_SYSTEM} Foco em engenharia e IA aplicadas a problemas reais de PME.`,
      tone: "prático, técnico sem jargão",
    },
  },
  {
    key: "p2",
    label: "Negócio / PME",
    kind: "pilar",
    rotation: true,
    section: "blog",
    ai: {
      system: `${BASE_AI_SYSTEM} Foco em eficiência operacional, processos, custos e crescimento de PME.`,
      tone: "acessível, orientado a resultado de negócio",
    },
  },
  {
    key: "p3",
    label: "Bastidores",
    kind: "pilar",
    rotation: true,
    section: "blog",
    ai: {
      system: `${BASE_AI_SYSTEM} Foco em cultura, método e decisões da Sapienza ao construir produtos.`,
      tone: "autêntico e transparente",
    },
  },
  {
    key: "campanha",
    label: "Campanha",
    kind: "campaign",
    rotation: false,
    section: "campanhas",
    ai: {
      system: `${BASE_AI_SYSTEM} Peça de campanha: objetivo claro, foco em conversão e CTA forte.`,
      tone: "persuasivo e direto, sem exagero",
    },
  },
  {
    key: "produto",
    label: "Apresentação de produto",
    kind: "product",
    rotation: false,
    section: "campanhas",
    ai: {
      system: `${BASE_AI_SYSTEM} Apresentação de produto: benefícios concretos, casos de uso e diferenciais.`,
      tone: "confiante, concreto, orientado a benefício",
    },
  },
] as const

const PILAR_KEYS = new Set<string>(["p1", "p2", "p3"])

export function getVertente(key: string): Vertente | undefined {
  return VERTENTES.find((v) => v.key === key)
}

export function isPilarKey(key: string): key is Pilar {
  return PILAR_KEYS.has(key)
}

// Resolve a key escolhida no editor para as colunas do banco (aditivo):
// pilar → { pilar, vertente: null }; avulsa → { pilar: null, vertente: key }.
// Retorna null se a key não existe no registry.
export function resolveVertente(
  key: string,
): { pilar: Pilar | null; vertente: string | null } | null {
  if (!getVertente(key)) return null
  if (isPilarKey(key)) return { pilar: key, vertente: null }
  return { pilar: null, vertente: key }
}

// Vertentes de uma seção do site (blog = editorial; campanhas = avulsas).
export function vertentesBySection(section: VertenteSection): Vertente[] {
  return VERTENTES.filter((v) => v.section === section)
}

// Keys avulsas (não-editoriais) — usadas para filtrar o /blog e alimentar /campanhas.
export const NON_EDITORIAL_KEYS: readonly string[] = VERTENTES.filter(
  (v) => v.section !== "blog",
).map((v) => v.key)
