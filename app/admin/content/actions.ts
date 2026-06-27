"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import {
  createContentItem,
  deleteContentItem,
  getContentItem,
  saveContentItem,
  setContentCover,
  slugExists,
  type ContentStatus,
  type ContentType,
  type ItemInput,
  type Pilar,
  type RevisionInput,
  type Seo,
} from "@/lib/content/queries"
import { contentTransition, TransitionError } from "@/lib/content/transition"
import { requireUser, isAdmin, transitionRequiresAdmin } from "@/lib/auth/session"

export type FormState = { error?: string }

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PILARES: Pilar[] = ["p1", "p2", "p3"]

async function requireUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect("/admin/login")
  return session.user.id
}

// Lê e valida os campos compartilhados dos forms de criar/editar.
function parseForm(
  formData: FormData,
): { item: ItemInput; rev: RevisionInput } | { error: string } {
  const type = String(formData.get("type") ?? "") as ContentType
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase()
  const pilarRaw = String(formData.get("pilar") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const bodyMarkdown = String(formData.get("bodyMarkdown") ?? "")
  const excerpt = String(formData.get("excerpt") ?? "").trim()

  if (type !== "post" && type !== "page") return { error: "Tipo inválido." }
  if (!SLUG_RE.test(slug))
    return { error: "Slug inválido (use minúsculas, números e hifens)." }
  if (!title) return { error: "Título é obrigatório." }
  if (!bodyMarkdown.trim()) return { error: "Corpo é obrigatório." }

  let pilar: Pilar | null = null
  if (type === "post") {
    if (!PILARES.includes(pilarRaw as Pilar))
      return { error: "Selecione o pilar do post." }
    pilar = pilarRaw as Pilar
  }

  const keywords = String(formData.get("seoKeywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
  const seo: Seo = {
    title: String(formData.get("seoTitle") ?? "").trim() || undefined,
    description: String(formData.get("seoDescription") ?? "").trim() || undefined,
    keywords: keywords.length ? keywords : undefined,
  }

  return { item: { type, slug, pilar }, rev: { title, bodyMarkdown, excerpt, seo } }
}

export async function createContentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const authorId = await requireUserId()
  const parsed = parseForm(formData)
  if ("error" in parsed) return parsed

  if (await slugExists(parsed.item.slug))
    return { error: "Já existe conteúdo com esse slug." }

  await createContentItem(parsed.item, parsed.rev, authorId)
  revalidatePath("/admin/content")
  redirect("/admin/content")
}

export async function saveContentAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const authorId = await requireUserId()
  const parsed = parseForm(formData)
  if ("error" in parsed) return parsed

  if (await slugExists(parsed.item.slug, id))
    return { error: "Já existe outro conteúdo com esse slug." }

  await saveContentItem(id, parsed.item, parsed.rev, authorId)
  revalidatePath("/admin/content")
  revalidatePath(`/admin/content/${id}`)
  redirect("/admin/content")
}

// Define/remove a capa editorial do artigo (URL pública do R2 vinda da biblioteca).
export async function setContentCoverAction(
  itemId: string,
  url: string | null,
): Promise<FormState> {
  await requireUserId()
  const data = await getContentItem(itemId)
  if (!data) return { error: "Conteúdo não encontrado." }

  await setContentCover(itemId, url)
  revalidatePath(`/admin/content/${itemId}`)
  revalidatePath(`/blog/${data.item.slug}`)
  return {}
}

export async function transitionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const itemId = String(formData.get("itemId") ?? "")
  const to = String(formData.get("to") ?? "") as ContentStatus

  if (transitionRequiresAdmin(to) && !isAdmin(user.role)) {
    return { error: "Apenas administradores podem publicar, agendar ou arquivar." }
  }

  // datetime-local não tem fuso → interpretamos como BRT (-03:00).
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "")
  const normalized = scheduledAtRaw.length === 16 ? `${scheduledAtRaw}:00` : scheduledAtRaw
  const scheduledAt = scheduledAtRaw ? new Date(`${normalized}-03:00`) : null

  try {
    await contentTransition(itemId, to, user.id, { scheduledAt })
  } catch (err) {
    if (err instanceof TransitionError) return { error: err.message }
    throw err
  }
  revalidatePath("/admin/content")
  revalidatePath(`/admin/content/${itemId}`)
  return {}
}

export async function deleteContentAction(formData: FormData) {
  const user = await requireUser()
  if (!isAdmin(user.role)) return // só admin exclui
  const id = String(formData.get("id") ?? "")
  if (!id) return

  const data = await getContentItem(id)
  if (!data) return
  if (data.item.status === "published") return // arquive antes de excluir

  await deleteContentItem(id)
  revalidatePath("/admin/content")
}
