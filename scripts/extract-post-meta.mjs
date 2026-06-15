import { readFileSync } from 'node:fs'
import matter from 'gray-matter'

// Extrai o frontmatter de um arquivo MDX e imprime JSON no stdout.
// Usado pela GitHub Action (publish-social.yml) para montar o payload do webhook n8n.
const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node extract-post-meta.mjs <path-to-mdx>')
  process.exit(1)
}

const raw = readFileSync(filePath, 'utf-8')
const { data } = matter(raw)

const payload = {
  title: data.title,
  slug: data.slug,
  excerpt: data.excerpt,
  pillar: data.pillar,
  publishedAt: data.publishedAt,
  url: `https://sapienzalabs.com.br/blog/${data.slug}`,
  tags: data.tags || [],
}

console.log(JSON.stringify(payload))
