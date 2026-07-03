"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { generateFromBrief, isAiConfigured, type BriefDraft, type BriefInput } from "@/lib/ai/brief"
import { insertProposedRevision } from "@/lib/content/queries"

export type BriefResult = { error?: string; draft?: BriefDraft; ok?: boolean }

async function requireUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect("/admin/login")
  return session.user.id
}

function validate(input: BriefInput): string | null {
  if (!input?.vertenteKey) return "Selecione a vertente."
  if (!input?.objetivo?.trim()) return "Descreva o objetivo/expectativa do artigo."
  return null
}

// Artigo NOVO/vazio: gera e devolve o rascunho para preencher o editor (sem persistir).
export async function briefDraftAction(input: BriefInput): Promise<BriefResult> {
  await requireUserId()
  if (!isAiConfigured()) return { error: "ANTHROPIC_API_KEY não configurada." }
  const invalid = validate(input)
  if (invalid) return { error: invalid }

  try {
    const draft = await generateFromBrief(input)
    return { draft }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao gerar com IA." }
  }
}

// Artigo COM conteúdo: gera uma revisão PROPOSTA (diff), sem sobrescrever a atual.
export async function briefProposalAction(
  itemId: string,
  input: BriefInput,
): Promise<BriefResult> {
  const authorId = await requireUserId()
  if (!isAiConfigured()) return { error: "ANTHROPIC_API_KEY não configurada." }
  const invalid = validate(input)
  if (invalid) return { error: invalid }
  if (!itemId) return { error: "Artigo inválido." }

  try {
    const draft = await generateFromBrief(input)
    await insertProposedRevision(
      itemId,
      {
        title: draft.title,
        bodyMarkdown: draft.bodyMarkdown,
        excerpt: draft.excerpt,
        seo: { keywords: draft.keywords },
      },
      authorId,
      { kind: "brief", brief: input.objetivo.trim() },
    )
    revalidatePath(`/admin/content/${itemId}`)
    return { ok: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao gerar proposta." }
  }
}
