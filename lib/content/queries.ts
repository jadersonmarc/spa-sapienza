import { and, desc, eq, ne } from "drizzle-orm"
import { db, schema } from "@/lib/db"

const { contentItems, contentRevisions } = schema

export type ContentType = (typeof schema.contentType.enumValues)[number]
export type ContentStatus = (typeof schema.contentStatus.enumValues)[number]
export type Pilar = (typeof schema.pilar.enumValues)[number]

export type Seo = {
  title?: string
  description?: string
  keywords?: string[]
}

export type RevisionInput = {
  title: string
  bodyMarkdown: string
  excerpt: string
  seo: Seo
}

export type ItemInput = {
  type: ContentType
  slug: string
  pilar: Pilar | null
}

// Lista para a tabela do admin: campos do item + título da revisão atual.
export async function listContentItems() {
  return db
    .select({
      id: contentItems.id,
      type: contentItems.type,
      slug: contentItems.slug,
      pilar: contentItems.pilar,
      status: contentItems.status,
      title: contentRevisions.title,
      updatedAt: contentItems.updatedAt,
    })
    .from(contentItems)
    .leftJoin(
      contentRevisions,
      eq(contentRevisions.id, contentItems.currentRevisionId),
    )
    .orderBy(desc(contentItems.updatedAt))
}

// Item + revisão atual (para a tela de edição).
export async function getContentItem(id: string) {
  const [item] = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, id))
    .limit(1)
  if (!item) return null

  let revision = null
  if (item.currentRevisionId) {
    ;[revision] = await db
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.id, item.currentRevisionId))
      .limit(1)
  }
  return { item, revision: revision ?? null }
}

export async function slugExists(slug: string, exceptId?: string) {
  const where = exceptId
    ? and(eq(contentItems.slug, slug), ne(contentItems.id, exceptId))
    : eq(contentItems.slug, slug)
  const [row] = await db
    .select({ id: contentItems.id })
    .from(contentItems)
    .where(where)
    .limit(1)
  return !!row
}

// Cria item (draft) + primeira revisão, apontando current_revision_id (transação).
export async function createContentItem(
  item: ItemInput,
  rev: RevisionInput,
  authorId: string,
) {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(contentItems)
      .values({ ...item, authorId })
      .returning({ id: contentItems.id })

    const [revision] = await tx
      .insert(contentRevisions)
      .values({ ...rev, contentItemId: created.id, authorId })
      .returning({ id: contentRevisions.id })

    await tx
      .update(contentItems)
      .set({ currentRevisionId: revision.id })
      .where(eq(contentItems.id, created.id))

    return created.id
  })
}

// Salva: atualiza campos do item + cria NOVA revisão (snapshot) e a torna atual.
export async function saveContentItem(
  id: string,
  item: ItemInput,
  rev: RevisionInput,
  authorId: string,
) {
  return db.transaction(async (tx) => {
    const [revision] = await tx
      .insert(contentRevisions)
      .values({ ...rev, contentItemId: id, authorId })
      .returning({ id: contentRevisions.id })

    await tx
      .update(contentItems)
      .set({
        ...item,
        currentRevisionId: revision.id,
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, id))

    return revision.id
  })
}

export async function deleteContentItem(id: string) {
  await db.delete(contentItems).where(eq(contentItems.id, id))
}
