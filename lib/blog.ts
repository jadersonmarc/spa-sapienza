import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import matter from "gray-matter"

export type Pilar =
  | "pme"          // Pilar 1 — Negócio / PME
  | "engenharia"   // Pilar 2 — Engenharia + IA
  | "bastidores"   // Pilar 3 — Bastidores

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

const POSTS_DIR = join(process.cwd(), "app/blog/posts")
const PILARES: Pilar[] = ["pme", "engenharia", "bastidores"]
const DEFAULT_AUTHOR = { name: "Marc Jaderson", role: "Fundador, Sapienza Labs", avatarUrl: "/marc.webp" }

// Conteúdo gerado pela automação chega em Markdown; ~200 palavras/minuto.
function readingTimeFromContent(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min`
}

function normalizePilar(value: unknown, slug: string): Pilar {
  if (typeof value === "string" && PILARES.includes(value as Pilar)) {
    return value as Pilar
  }
  console.warn(`[blog] pilar inválido "${value}" em "${slug}" — usando "pme"`)
  return "pme"
}

// Lê um arquivo .mdx e mapeia o frontmatter para a interface Post.
// Retorna null para arquivos sem os campos mínimos.
function parsePost(fileName: string): Post | null {
  const raw = readFileSync(join(POSTS_DIR, fileName), "utf-8")
  const { data, content } = matter(raw)

  const slug = typeof data.slug === "string" ? data.slug : fileName.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.mdx$/, "")
  if (!data.title || !data.publishedAt) {
    console.warn(`[blog] frontmatter incompleto em "${fileName}" — ignorando`)
    return null
  }

  const author = typeof data.author === "string"
    ? { ...DEFAULT_AUTHOR, name: data.author }
    : { ...DEFAULT_AUTHOR, ...(data.author ?? {}) }

  return {
    title: String(data.title),
    slug,
    excerpt: String(data.excerpt ?? ""),
    content: content.trim(),
    date: String(data.publishedAt),
    readingTime: readingTimeFromContent(content),
    pilar: normalizePilar(data.pillar, slug),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    author,
    keywords: Array.isArray(data.tags) ? data.tags.map(String) : [],
  }
}

function readAllPosts(): Post[] {
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"))
  return files
    .map(parsePost)
    .filter((p): p is Post => p !== null)
}

export function getAllPosts(): Post[] {
  return readAllPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getPostBySlug(slug: string): Post | undefined {
  return readAllPosts().find((post) => post.slug === slug)
}
