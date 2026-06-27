import { and, count, desc, eq, like, lt, lte, ne, sql } from "drizzle-orm"
import { db, schema } from "@/lib/db"

const { contentItems, contentRevisions, users, aiAnalyses, socialDrafts } = schema

export type AnalysisType = (typeof schema.analysisType.enumValues)[number]
export type Platform = (typeof schema.platform.enumValues)[number]
export type SocialStatus = (typeof schema.socialStatus.enumValues)[number]

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

// ── usuário (R4: troca de senha) ─────────────────────────────────────────────
export async function getUserCredById(id: string) {
  const [row] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  return row ?? null
}

export async function updateUserPassword(id: string, passwordHash: string) {
  await db
    .update(users)
    .set({ passwordHash, sessionVersion: sql`${users.sessionVersion} + 1`, updatedAt: new Date() })
    .where(eq(users.id, id))
}

// Itens agendados cujo horário já chegou (para o job de publicação).
export async function listDueScheduled() {
  return db
    .select({ id: contentItems.id })
    .from(contentItems)
    .where(
      and(
        eq(contentItems.status, "scheduled"),
        lte(contentItems.scheduledAt, new Date()),
      ),
    )
}

// Histórico de revisões de um item (mais recente primeiro), com e-mail do autor.
export async function listRevisions(itemId: string) {
  return db
    .select({
      id: contentRevisions.id,
      title: contentRevisions.title,
      createdAt: contentRevisions.createdAt,
      authorEmail: users.email,
    })
    .from(contentRevisions)
    .leftJoin(users, eq(users.id, contentRevisions.authorId))
    .where(
      and(
        eq(contentRevisions.contentItemId, itemId),
        eq(contentRevisions.isProposed, false), // propostas (R1) não entram no histórico
      ),
    )
    .orderBy(desc(contentRevisions.createdAt))
}

// Uma revisão + a imediatamente anterior do mesmo item (para o diff "o que mudou").
export async function getRevisionForDiff(itemId: string, revId: string) {
  const [revision] = await db
    .select()
    .from(contentRevisions)
    .where(
      and(
        eq(contentRevisions.id, revId),
        eq(contentRevisions.contentItemId, itemId),
      ),
    )
    .limit(1)
  if (!revision) return null

  const [previous] = await db
    .select()
    .from(contentRevisions)
    .where(
      and(
        eq(contentRevisions.contentItemId, itemId),
        eq(contentRevisions.isProposed, false),
        lt(contentRevisions.createdAt, revision.createdAt),
      ),
    )
    .orderBy(desc(contentRevisions.createdAt))
    .limit(1)

  return { revision, previous: previous ?? null }
}

// ── R1: revisões propostas pela IA ───────────────────────────────────────────
export async function insertProposedRevision(
  itemId: string,
  rev: RevisionInput,
  authorId: string,
  proposedFrom: { analysisType: AnalysisType; recommendation: string },
) {
  const [row] = await db
    .insert(contentRevisions)
    .values({ ...rev, contentItemId: itemId, authorId, isProposed: true, proposedFrom })
    .returning({ id: contentRevisions.id })
  return row.id
}

export async function listProposedRevisions(itemId: string) {
  return db
    .select({
      id: contentRevisions.id,
      title: contentRevisions.title,
      proposedFrom: contentRevisions.proposedFrom,
      createdAt: contentRevisions.createdAt,
    })
    .from(contentRevisions)
    .where(
      and(
        eq(contentRevisions.contentItemId, itemId),
        eq(contentRevisions.isProposed, true),
      ),
    )
    .orderBy(desc(contentRevisions.createdAt))
}

// Proposta + revisão ATUAL do item (para o diff proposta × current).
export async function getProposalDiff(itemId: string, proposalId: string) {
  const [proposal] = await db
    .select()
    .from(contentRevisions)
    .where(
      and(
        eq(contentRevisions.id, proposalId),
        eq(contentRevisions.contentItemId, itemId),
        eq(contentRevisions.isProposed, true),
      ),
    )
    .limit(1)
  if (!proposal) return null

  const [item] = await db
    .select({ currentRevisionId: contentItems.currentRevisionId })
    .from(contentItems)
    .where(eq(contentItems.id, itemId))
    .limit(1)

  let current = null
  if (item?.currentRevisionId) {
    ;[current] = await db
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.id, item.currentRevisionId))
      .limit(1)
  }
  return { proposal, current: current ?? null }
}

// Aceitar: a proposta vira a revisão atual (deixa de ser proposta).
export async function acceptProposal(itemId: string, proposalId: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(contentRevisions)
      .set({ isProposed: false, proposedFrom: null })
      .where(eq(contentRevisions.id, proposalId))
    await tx
      .update(contentItems)
      .set({ currentRevisionId: proposalId, updatedAt: new Date() })
      .where(eq(contentItems.id, itemId))
  })
}

export async function discardProposal(proposalId: string) {
  await db
    .delete(contentRevisions)
    .where(and(eq(contentRevisions.id, proposalId), eq(contentRevisions.isProposed, true)))
}

// Revisão única (escopada ao item) — usada para montar o snapshot de análise.
export async function getRevision(itemId: string, revId: string) {
  const [revision] = await db
    .select()
    .from(contentRevisions)
    .where(
      and(
        eq(contentRevisions.id, revId),
        eq(contentRevisions.contentItemId, itemId),
      ),
    )
    .limit(1)
  return revision ?? null
}

export async function insertAnalysis(input: {
  contentItemId: string
  revisionId: string
  type: AnalysisType
  payload: unknown
  model: string
}) {
  const [row] = await db
    .insert(aiAnalyses)
    .values(input)
    .returning({ id: aiAnalyses.id })
  return row.id
}

export async function listAnalysesByRevision(revisionId: string) {
  return db
    .select({
      id: aiAnalyses.id,
      type: aiAnalyses.type,
      payload: aiAnalyses.payload,
      model: aiAnalyses.model,
      createdAt: aiAnalyses.createdAt,
    })
    .from(aiAnalyses)
    .where(eq(aiAnalyses.revisionId, revisionId))
    .orderBy(desc(aiAnalyses.createdAt))
}

// ── social_drafts ──────────────────────────────────────────────────────────
export async function insertSocialDraft(input: {
  contentItemId: string
  revisionId: string
  platform: Platform
  body: string
  hashtags: string[]
  imageUrl?: string | null
}) {
  const [row] = await db
    .insert(socialDrafts)
    .values(input)
    .returning({ id: socialDrafts.id })
  return row.id
}

export async function listSocialDraftsByRevision(revisionId: string) {
  return db
    .select({
      id: socialDrafts.id,
      platform: socialDrafts.platform,
      body: socialDrafts.body,
      hashtags: socialDrafts.hashtags,
      status: socialDrafts.status,
      imageUrl: socialDrafts.imageUrl,
      postUrl: socialDrafts.postUrl,
      createdAt: socialDrafts.createdAt,
    })
    .from(socialDrafts)
    .where(eq(socialDrafts.revisionId, revisionId))
    .orderBy(desc(socialDrafts.createdAt))
}

// Edita o conteúdo textual do draft (legenda + hashtags). Só faz sentido em `draft`.
export async function updateSocialDraftContent(
  id: string,
  content: { body: string; hashtags: string[] },
) {
  await db
    .update(socialDrafts)
    .set({ body: content.body, hashtags: content.hashtags })
    .where(eq(socialDrafts.id, id))
}

// Troca a imagem do draft (upload ou seleção da pasta da plataforma).
export async function setSocialDraftImage(id: string, imageUrl: string) {
  await db.update(socialDrafts).set({ imageUrl }).where(eq(socialDrafts.id, id))
}

// Onde uma URL de imagem está referenciada (best-effort) — usado antes de
// mover/excluir pela biblioteca. v1 não reescreve, só conta/avisa.
export type ImageReferences = { social: number; markdown: number; cover: number; total: number }

export async function findImageReferences(url: string): Promise<ImageReferences> {
  const [social] = await db
    .select({ n: count() })
    .from(socialDrafts)
    .where(eq(socialDrafts.imageUrl, url))
  const [md] = await db
    .select({ n: count() })
    .from(contentRevisions)
    .where(like(contentRevisions.bodyMarkdown, `%${url}%`))
  const [cover] = await db
    .select({ n: count() })
    .from(contentItems)
    .where(eq(contentItems.coverImageUrl, url))
  const socialN = Number(social?.n ?? 0)
  const markdownN = Number(md?.n ?? 0)
  const coverN = Number(cover?.n ?? 0)
  return { social: socialN, markdown: markdownN, cover: coverN, total: socialN + markdownN + coverN }
}

// Define/remove a capa editorial de um artigo (URL pública do R2 ou null).
export async function setContentCover(itemId: string, url: string | null) {
  await db
    .update(contentItems)
    .set({ coverImageUrl: url, updatedAt: new Date() })
    .where(eq(contentItems.id, itemId))
}

export async function getSocialDraft(id: string) {
  const [row] = await db
    .select({ id: socialDrafts.id, status: socialDrafts.status, contentItemId: socialDrafts.contentItemId })
    .from(socialDrafts)
    .where(eq(socialDrafts.id, id))
    .limit(1)
  return row ?? null
}

// Draft + slug/título do conteúdo (para a postagem social).
export async function getSocialDraftForPost(id: string) {
  const [row] = await db
    .select({
      id: socialDrafts.id,
      contentItemId: socialDrafts.contentItemId,
      platform: socialDrafts.platform,
      body: socialDrafts.body,
      hashtags: socialDrafts.hashtags,
      status: socialDrafts.status,
      imageUrl: socialDrafts.imageUrl,
      slug: contentItems.slug,
      pilar: contentItems.pilar,
      title: contentRevisions.title,
    })
    .from(socialDrafts)
    .innerJoin(contentItems, eq(contentItems.id, socialDrafts.contentItemId))
    .leftJoin(contentRevisions, eq(contentRevisions.id, socialDrafts.revisionId))
    .where(eq(socialDrafts.id, id))
    .limit(1)
  return row ?? null
}

export async function markSocialSent(id: string, postUrl: string | null, imageUrl: string) {
  await db
    .update(socialDrafts)
    .set({ status: "sent", postUrl, imageUrl })
    .where(eq(socialDrafts.id, id))
}

export async function updateSocialStatus(id: string, status: SocialStatus) {
  await db.update(socialDrafts).set({ status }).where(eq(socialDrafts.id, id))
}

export async function deleteSocialDraft(id: string) {
  await db.delete(socialDrafts).where(eq(socialDrafts.id, id))
}
