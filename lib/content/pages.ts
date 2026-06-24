import { and, eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { mergeHome, type HomeBlocks } from "./home-blocks"

const { contentItems, contentRevisions } = schema

// Re-exporta tipos e defaults (dados puros vivem em ./home-blocks, sem dep. de DB).
export {
  DEFAULT_HOME,
  mergeHome,
  type SectionHeader,
  type HeroBlock,
  type DiffBlock,
  type PlanCard,
  type PlansBlock,
  type HomeBlocks,
} from "./home-blocks"

// Blocos da home para o site (revisão atual da page publicada; senão, defaults).
export async function getHomeBlocks(): Promise<HomeBlocks> {
  const [row] = await db
    .select({ blocks: contentRevisions.blocks })
    .from(contentItems)
    .innerJoin(contentRevisions, eq(contentRevisions.id, contentItems.currentRevisionId))
    .where(
      and(
        eq(contentItems.type, "page"),
        eq(contentItems.slug, "home"),
        eq(contentItems.status, "published"),
      ),
    )
    .limit(1)
  return mergeHome(row?.blocks)
}

// Para o admin: a page (qualquer status) + blocos atuais mesclados (p/ edição).
export async function getPageForAdmin(slug: string) {
  const [item] = await db
    .select()
    .from(contentItems)
    .where(and(eq(contentItems.type, "page"), eq(contentItems.slug, slug)))
    .limit(1)
  if (!item) return null

  let blocks: unknown = null
  if (item.currentRevisionId) {
    const [rev] = await db
      .select({ blocks: contentRevisions.blocks })
      .from(contentRevisions)
      .where(eq(contentRevisions.id, item.currentRevisionId))
      .limit(1)
    blocks = rev?.blocks ?? null
  }
  return { item, blocks: mergeHome(blocks) }
}

// Cria a page (draft) se não existir; retorna o id.
export async function ensurePage(slug: string, authorId: string): Promise<string> {
  const [existing] = await db
    .select({ id: contentItems.id })
    .from(contentItems)
    .where(and(eq(contentItems.type, "page"), eq(contentItems.slug, slug)))
    .limit(1)
  if (existing) return existing.id
  const [created] = await db
    .insert(contentItems)
    .values({ type: "page", slug, authorId })
    .returning({ id: contentItems.id })
  return created.id
}

// Salva uma nova revisão de page com os blocos (snapshot) e a torna atual.
export async function savePageRevision(itemId: string, blocks: HomeBlocks, authorId: string) {
  return db.transaction(async (tx) => {
    const [rev] = await tx
      .insert(contentRevisions)
      .values({
        contentItemId: itemId,
        title: "Home",
        bodyMarkdown: "",
        excerpt: "",
        blocks,
        authorId,
      })
      .returning({ id: contentRevisions.id })
    await tx
      .update(contentItems)
      .set({ currentRevisionId: rev.id, updatedAt: new Date() })
      .where(eq(contentItems.id, itemId))
    return rev.id
  })
}
