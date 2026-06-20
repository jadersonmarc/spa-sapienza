"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import {
  getContentItem,
  getRevision,
  insertAnalysis,
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
