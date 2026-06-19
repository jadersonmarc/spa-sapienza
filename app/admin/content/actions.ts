"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import {
  createContentItem,
  deleteContentItem,
  saveContentItem,
  slugExists,
  type ContentType,
  type ItemInput,
  type Pilar,
  type RevisionInput,
  type Seo,
} from "@/lib/content/queries"

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

export async function deleteContentAction(formData: FormData) {
  await requireUserId()
  const id = String(formData.get("id") ?? "")
  if (id) {
    await deleteContentItem(id)
    revalidatePath("/admin/content")
  }
}
