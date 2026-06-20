"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import {
  acceptProposal,
  discardProposal,
  getContentItem,
  getRevision,
  insertAnalysis,
  insertProposedRevision,
  type Seo,
} from "@/lib/content/queries"
import { getAnalyzer, type AnalysisType, type AnalyzerInput } from "@/lib/ai/analyzers"
import { callStructured, isAiConfigured } from "@/lib/ai/client"

export type AiFormState = { error?: string; ok?: boolean }

const TYPES: AnalysisType[] = ["quality", "seo", "emotional", "thematic"]

export async function runAnalysisAction(
  _prev: AiFormState,
  formData: FormData,
): Promise<AiFormState> {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")
  if (!isAiConfigured()) return { error: "ANTHROPIC_API_KEY não configurada." }

  const itemId = String(formData.get("itemId") ?? "")
  const revisionId = String(formData.get("revisionId") ?? "")
  const type = String(formData.get("type") ?? "") as AnalysisType
  if (!TYPES.includes(type)) return { error: "Tipo de análise inválido." }

  const data = await getContentItem(itemId)
  const revision = await getRevision(itemId, revisionId)
  if (!data || !revision) return { error: "Conteúdo/revisão não encontrado." }

  const analyzer = getAnalyzer(type)
  if (!analyzer) return { error: "Analisador não registrado." }

  const input: AnalyzerInput = {
    title: revision.title,
    bodyMarkdown: revision.bodyMarkdown,
    excerpt: revision.excerpt,
    seo: (revision.seo ?? {}) as Seo,
    pilar: data.item.pilar,
  }

  try {
    const { data: payload, model } = await callStructured<unknown>({
      system: analyzer.system,
      user: analyzer.buildUser(input),
      schema: analyzer.schema,
    })
    await insertAnalysis({ contentItemId: itemId, revisionId, type, payload, model })
    revalidatePath(`/admin/content/${itemId}`)
    return { ok: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha na análise." }
  }
}

const PROPOSAL_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    bodyMarkdown: { type: "string" },
  },
  required: ["title", "excerpt", "bodyMarkdown"],
  additionalProperties: false,
} as const

// R1: gera uma revisão PROPOSTA implementando só a recomendação dada (não vira current).
export async function applyRecommendationAction(
  _prev: AiFormState,
  formData: FormData,
): Promise<AiFormState> {
  const session = await auth()
  if (!session?.user?.id) redirect("/admin/login")
  if (!isAiConfigured()) return { error: "ANTHROPIC_API_KEY não configurada." }

  const itemId = String(formData.get("itemId") ?? "")
  const revisionId = String(formData.get("revisionId") ?? "")
  const type = String(formData.get("type") ?? "") as AnalysisType
  const recommendation = String(formData.get("recommendation") ?? "").trim()
  if (!TYPES.includes(type)) return { error: "Tipo de análise inválido." }
  if (!recommendation) return { error: "Recomendação vazia." }

  const revision = await getRevision(itemId, revisionId)
  if (!revision) return { error: "Revisão não encontrada." }

  const system =
    "Você é editor(a) sênior da Sapienza Labs (pt-BR, PMEs da Baixada Fluminense). Reescreva o " +
    "conteúdo implementando APENAS a recomendação indicada, preservando o resto, o tom e a " +
    "acentuação correta. Retorne o conteúdo completo revisado."
  const user =
    `Recomendação a implementar (tipo ${type}):\n${recommendation}\n\n` +
    `--- Conteúdo atual ---\nTítulo: ${revision.title}\nResumo: ${revision.excerpt}\n\n` +
    `Corpo (Markdown):\n${revision.bodyMarkdown}`

  try {
    const { data } = await callStructured<{ title: string; excerpt: string; bodyMarkdown: string }>(
      { system, user, schema: PROPOSAL_SCHEMA, maxTokens: 16000 },
    )
    await insertProposedRevision(
      itemId,
      {
        title: data.title.trim(),
        bodyMarkdown: data.bodyMarkdown.trim(),
        excerpt: data.excerpt.trim(),
        seo: (revision.seo ?? {}) as Seo,
      },
      session.user.id,
      { analysisType: type, recommendation },
    )
    revalidatePath(`/admin/content/${itemId}`)
    return { ok: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao aplicar recomendação." }
  }
}

export async function acceptProposalAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")
  const itemId = String(formData.get("itemId") ?? "")
  const proposalId = String(formData.get("proposalId") ?? "")
  if (!itemId || !proposalId) return
  await acceptProposal(itemId, proposalId)
  revalidatePath(`/admin/content/${itemId}`)
}

export async function discardProposalAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")
  const itemId = String(formData.get("itemId") ?? "")
  const proposalId = String(formData.get("proposalId") ?? "")
  if (!proposalId) return
  await discardProposal(proposalId)
  if (itemId) revalidatePath(`/admin/content/${itemId}`)
}
