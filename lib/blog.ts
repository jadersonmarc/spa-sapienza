import { and, desc, eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"

export type Pilar =
  | "pme"          // Negócio / PME (enum DB: p2)
  | "engenharia"   // Engenharia + IA (enum DB: p1)
  | "bastidores"   // Bastidores (enum DB: p3)

export interface Post {
  title: string
  slug: string
  excerpt: string
  content: string
  date: string
  readingTime: string
  pilar: Pilar
  coverImage?: string
  author: {
    name: string
    role: string
    avatarUrl?: string
  }
  keywords: string[]
}

const DEFAULT_AUTHOR = {
  name: "Marc Jaderson",
  role: "Fundador, Sapienza Labs",
  avatarUrl: "/marc.webp",
}

// Mapeia o enum de pilar do banco para o vocabulário do site.
const PILAR_FROM_DB: Record<string, Pilar> = {
  p1: "engenharia",
  p2: "pme",
  p3: "bastidores",
}

/** Resolve o enum do banco (p1/p2/p3) para o vocabulário do site. */
export function pilarFromDb(value: string | null): Pilar {
  return PILAR_FROM_DB[value ?? "p2"] ?? "pme"
}

// ~200 palavras/minuto.
function readingTimeFromContent(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min`
}

type Seo = { title?: string; description?: string; keywords?: string[] }

function toPost(row: {
  slug: string
  pilar: string | null
  publishedAt: Date | null
  title: string
  excerpt: string
  bodyMarkdown: string
  seo: unknown
  coverImage: string | null
}): Post {
  const seo = (row.seo ?? {}) as Seo
  return {
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.bodyMarkdown.trim(),
    date: (row.publishedAt ?? new Date()).toISOString(),
    readingTime: readingTimeFromContent(row.bodyMarkdown),
    pilar: PILAR_FROM_DB[row.pilar ?? "p2"] ?? "pme",
    coverImage: row.coverImage ?? undefined,
    author: { ...DEFAULT_AUTHOR },
    keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
  }
}

// Base: posts juntando a revisão atual (filtro de where aplicado por função).
function baseSelect() {
  const { contentItems, contentRevisions } = schema
  return db
    .select({
      slug: contentItems.slug,
      pilar: contentItems.pilar,
      coverImage: contentItems.coverImageUrl,
      publishedAt: contentItems.publishedAt,
      title: contentRevisions.title,
      excerpt: contentRevisions.excerpt,
      bodyMarkdown: contentRevisions.bodyMarkdown,
      seo: contentRevisions.seo,
    })
    .from(contentItems)
    .innerJoin(
      contentRevisions,
      eq(contentRevisions.id, contentItems.currentRevisionId),
    )
}

export async function getAllPosts(): Promise<Post[]> {
  const { contentItems } = schema
  const rows = await baseSelect()
    .where(
      and(eq(contentItems.type, "post"), eq(contentItems.status, "published")),
    )
    .orderBy(desc(contentItems.publishedAt))
  return rows.map(toPost)
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const { contentItems } = schema
  const [row] = await baseSelect()
    .where(
      and(
        eq(contentItems.type, "post"),
        eq(contentItems.status, "published"),
        eq(contentItems.slug, slug),
      ),
    )
    .limit(1)
  return row ? toPost(row) : undefined
}
