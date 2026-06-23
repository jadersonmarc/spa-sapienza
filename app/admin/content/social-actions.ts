"use server"

import { revalidatePath } from "next/cache"
import { requireUser, isAdmin, socialStatusRequiresAdmin } from "@/lib/auth/session"
import {
  deleteSocialDraft,
  getContentItem,
  getRevision,
  getSocialDraft,
  getSocialDraftForPost,
  insertSocialDraft,
  markSocialSent,
  updateSocialStatus,
  type Platform,
  type SocialStatus,
} from "@/lib/content/queries"
import { getSocialGenerator } from "@/lib/ai/social"
import { canSocialTransition } from "@/lib/content/social-status"
import { callStructured, isAiConfigured } from "@/lib/ai/client"
import { pilarFromDb } from "@/lib/blog"
import { getSocialImageUrl, renderSocialImage } from "@/lib/social/image"
import { postToInstagram } from "@/lib/social/instagram"
import { postToLinkedin } from "@/lib/social/linkedin"

export type SocialFormState = { error?: string; ok?: boolean }

const SITE_URL = process.env.SITE_URL ?? "https://sapienzalabs.com.br"
const PLATFORMS: Platform[] = ["instagram", "linkedin"]

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
  const user = await requireUser()
  const id = String(formData.get("id") ?? "")
  const to = String(formData.get("to") ?? "") as SocialStatus
  if (socialStatusRequiresAdmin(to) && !isAdmin(user.role)) return
  const draft = await getSocialDraft(id)
  if (!draft) return
  if (!canSocialTransition(draft.status, to)) return
  await updateSocialStatus(id, to)
  revalidatePath(`/admin/content/${draft.contentItemId}`)
}

// Postagem por BOTÃO: posta o draft aprovado no IG/LinkedIn, grava post_url e marca sent.
export async function postSocialAction(
  _prev: SocialFormState,
  formData: FormData,
): Promise<SocialFormState> {
  const user = await requireUser()
  if (!isAdmin(user.role)) return { error: "Apenas administradores publicam nas redes." }

  const id = String(formData.get("id") ?? "")
  const draft = await getSocialDraftForPost(id)
  if (!draft) return { error: "Post não encontrado." }
  if (draft.status !== "approved") return { error: "Aprove o post antes de publicar." }

  const tags = Array.isArray(draft.hashtags) ? (draft.hashtags as string[]) : []
  const articleUrl = `${SITE_URL}/blog/${draft.slug}`

  const imageInput = {
    platform: draft.platform as Platform,
    pilar: pilarFromDb(draft.pilar),
    slug: draft.slug,
    title: draft.title ?? draft.slug,
  }
  const tagLine = tags.length ? `\n\n${tags.map((t) => `#${t}`).join(" ")}` : ""

  try {
    const imageUrl = await getSocialImageUrl(imageInput)
    let postUrl: string | null = null

    if (draft.platform === "instagram") {
      const r = await postToInstagram({ caption: `${draft.body}${tagLine}`, imageUrl })
      postUrl = r.permalink ?? null
    } else {
      // IMAGE share: sobe o binário do card e referencia o artigo no texto.
      const imageBuffer = await renderSocialImage(imageInput)
      const text = `${draft.body}${tagLine}\n\n${articleUrl}`
      const r = await postToLinkedin({ text, title: draft.title ?? draft.slug, imageBuffer })
      postUrl = r.permalink ?? null
    }

    await markSocialSent(id, postUrl, imageUrl)
    revalidatePath(`/admin/content/${draft.contentItemId}`)
    return { ok: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao publicar." }
  }
}

export async function deleteSocialAction(formData: FormData) {
  await requireUser()
  const id = String(formData.get("id") ?? "")
  const draft = await getSocialDraft(id)
  if (!draft) return
  await deleteSocialDraft(id)
  revalidatePath(`/admin/content/${draft.contentItemId}`)
}
