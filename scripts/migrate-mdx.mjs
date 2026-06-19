// Migra os posts .mdx (app/blog/posts) para o Postgres (content_items + revisions).
// Idempotente por slug: pula posts já existentes. Slugs preservados (valor de SEO).
// Uso: node scripts/migrate-mdx.mjs   (ou: pnpm db:import-mdx)

import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import matter from "gray-matter"
import postgres from "postgres"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const POSTS_DIR = join(root, "app/blog/posts")

// Carrega .env.local (DATABASE_URL).
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida (.env.local).")
  process.exit(1)
}

// Mapeia o pilar do blog (por significado) para o enum do banco.
const PILAR_MAP = { engenharia: "p1", pme: "p2", bastidores: "p3" }

function parse(fileName) {
  const raw = readFileSync(join(POSTS_DIR, fileName), "utf8")
  const { data, content } = matter(raw)
  if (!data.title || !data.publishedAt) return null
  const slug =
    typeof data.slug === "string"
      ? data.slug
      : fileName.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.mdx$/, "")
  const pilar = PILAR_MAP[data.pillar] ?? "p2"
  const keywords = Array.isArray(data.tags) ? data.tags.map(String) : []
  return {
    slug,
    pilar,
    title: String(data.title),
    excerpt: String(data.excerpt ?? ""),
    bodyMarkdown: content.trim(),
    publishedAt: new Date(String(data.publishedAt)),
    seo: keywords.length ? { keywords } : {},
  }
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false })

try {
  const [author] = await sql`select id from users where role='admin' order by created_at limit 1`
  if (!author) throw new Error("Nenhum usuário admin encontrado — rode o seed antes.")

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"))
  let created = 0
  let skipped = 0

  for (const file of files) {
    const p = parse(file)
    if (!p) {
      console.warn(`! frontmatter incompleto, pulando: ${file}`)
      continue
    }
    const [exists] = await sql`select id from content_items where slug=${p.slug} limit 1`
    if (exists) {
      skipped++
      console.log(`= já existe: ${p.slug}`)
      continue
    }
    await sql.begin(async (tx) => {
      const [item] = await tx`
        insert into content_items (type, slug, pilar, status, published_at, author_id)
        values ('post', ${p.slug}, ${p.pilar}, 'published', ${p.publishedAt}, ${author.id})
        returning id`
      const [rev] = await tx`
        insert into content_revisions (content_item_id, title, body_markdown, excerpt, seo, author_id)
        values (${item.id}, ${p.title}, ${p.bodyMarkdown}, ${p.excerpt}, ${sql.json(p.seo)}, ${author.id})
        returning id`
      await tx`update content_items set current_revision_id=${rev.id} where id=${item.id}`
    })
    created++
    console.log(`+ criado: ${p.slug} (${p.pilar})`)
  }

  console.log(`\nResumo: ${created} criados, ${skipped} já existentes, ${files.length} arquivos.`)
} catch (err) {
  console.error("Falha na migração:", err.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
