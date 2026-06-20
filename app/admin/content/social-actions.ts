"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import {
  deleteSocialDraft,
  getContentItem,
  getRevision,
  getSocialDraft,
  insertSocialDraft,
  updateSocialStatus,
  type Platform,
  type SocialStatus,
} from "@/lib/content/queries"
import { getSocialGenerator } from "@/lib/ai/social"
import { canSocialTransition } from "@/lib/content/social-status"
import { callStructured, isAiConfigured } from "@/lib/ai/client"

export type SocialFormState = { error?: string; ok?: boolean }

const SITE_URL = process.env.SITE_URL ?? "https://sapienzalabs.com.br"
const PLATFORMS: Platform[] = ["instagram", "linkedin"]

async function requireUser() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")
}

export async function generateSocialAction(
  _prev: SocialFormState,
  formData: FormData,
): Promise<SocialFormState> {
  await requireUser()
  if (!isAiConfigured()) return { error: "ANTHROPIC_API_KEY não configurada." }

  const itemId = String(formData.get("itemId") ?? "")
  const revisionId = String(formData.get("revisionId") ?? "")
  const platform = String(formData.get("platform") ?? "") as Platform
  if (!PLATFORMS.includes(platform)) return { error: "Plataforma inválida." }

  const data = await getContentItem(itemId)
  const revision = await getRevision(itemId, revisionId)
  if (!data || !revision) return { error: "Conteúdo/revisão não encontrado." }

  const generator = getSocialGenerator(platform)
  if (!generator) return { error: "Gerador não registrado." }

  try {
    const { data: out } = await callStructured<{ body: string; hashtags: string[] }>({
      system: generator.system,
      schema: generator.schema,
      user: generator.buildUser({
        title: revision.title,
        bodyMarkdown: revision.bodyMarkdown,
        excerpt: revision.excerpt,
        pilar: data.item.pilar,
        url: `${SITE_URL}/blog/${data.item.slug}`,
      }),
    })
    await insertSocialDraft({
      contentItemId: itemId,
      revisionId,
      platform,
      body: out.body,
      hashtags: Array.isArray(out.hashtags) ? out.hashtags : [],
    })
    revalidatePath(`/admin/content/${itemId}`)
    return { ok: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao gerar post." }
  }
}

export async function setSocialStatusAction(formData: FormData) {
  await requireUser()
  const id = String(formData.get("id") ?? "")
  const to = String(formData.get("to") ?? "") as SocialStatus
  const draft = await getSocialDraft(id)
  if (!draft) return
  if (!canSocialTransition(draft.status, to)) return
  await updateSocialStatus(id, to)
  revalidatePath(`/admin/content/${draft.contentItemId}`)
}

export async function deleteSocialAction(formData: FormData) {
  await requireUser()
  const id = String(formData.get("id") ?? "")
  const draft = await getSocialDraft(id)
  if (!draft) return
  await deleteSocialDraft(id)
  revalidatePath(`/admin/content/${draft.contentItemId}`)
}
