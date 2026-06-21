import { and, eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"

const { contentItems, contentRevisions } = schema

export type SectionHeader = { eyebrow?: string; title: string; subtitle: string }
export type HeroBlock = {
  badge: string
  titleLead: string
  titleHighlight: string
  subtitle: string
  ctaLabel: string
}
export type DiffBlock = {
  eyebrow: string
  titleLead: string
  titleHighlight: string
  subtitle: string
}

export type HomeBlocks = {
  hero: HeroBlock
  services: SectionHeader
  howItWorks: SectionHeader
  portfolio: SectionHeader
  trust: SectionHeader
  differentials: DiffBlock
}

// Fonte de verdade dos textos da home. Fallback enquanto a page não é publicada
// no admin — garante que o site nunca quebra.
export const DEFAULT_HOME: HomeBlocks = {
  hero: {
    badge: "Software sob medida · Baixada Fluminense",
    titleLead: "Seu negócio merece sistema feito para ele —",
    titleHighlight: "não template comprado de fora.",
    subtitle:
      "Desenvolvemos software sob medida para escritórios de advocacia, contabilidade e clínicas da Baixada Fluminense. Levantamento de requisitos conduzido por engenheiro, entrega com qualidade de produção.",
    ctaLabel: "Diagnóstico gratuito — 30 minutos",
  },
  services: {
    title: "Nossos Serviços",
    subtitle: "Soluções tecnológicas sob medida para impulsionar seu negócio",
  },
  howItWorks: {
    eyebrow: "Como funciona",
    title: "Da conversa inicial ao sistema em produção.",
    subtitle:
      "Um processo simples para transformar necessidade de negócio em software com escopo claro.",
  },
  portfolio: {
    title: "Portfólio",
    subtitle: "Produtos que estamos construindo — e a engenharia por trás deles",
  },
  trust: {
    eyebrow: "Confiança",
    title: "Engenharia com rosto, processo e responsabilidade.",
    subtitle:
      "A Sapienza Labs combina execução técnica com combinados claros para reduzir risco na contratação.",
  },
  differentials: {
    eyebrow: "Por que Sapienza Labs?",
    titleLead: "Porque não entregamos apenas código; entregamos",
    titleHighlight: "inteligência",
    subtitle:
      "Nossa abordagem vai além do desenvolvimento tradicional. Combinamos expertise técnica com visão estratégica de negócio.",
  },
}

// Mescla blocos salvos sobre os defaults (por seção) — campos ausentes caem no default.
function mergeHome(saved: unknown): HomeBlocks {
  const s = (saved ?? {}) as Partial<HomeBlocks>
  return {
    hero: { ...DEFAULT_HOME.hero, ...(s.hero ?? {}) },
    services: { ...DEFAULT_HOME.services, ...(s.services ?? {}) },
    howItWorks: { ...DEFAULT_HOME.howItWorks, ...(s.howItWorks ?? {}) },
    portfolio: { ...DEFAULT_HOME.portfolio, ...(s.portfolio ?? {}) },
    trust: { ...DEFAULT_HOME.trust, ...(s.trust ?? {}) },
    differentials: { ...DEFAULT_HOME.differentials, ...(s.differentials ?? {}) },
  }
}

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
