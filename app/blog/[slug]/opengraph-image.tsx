import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { getFormat } from "@/lib/brand/formats"
import { pillarStyle } from "@/lib/brand/pillar"
import { renderBrandImage } from "@/lib/brand/render"
import { CapaEditorial } from "@/lib/brand/templates/capa-editorial"

const format = getFormat("blog-og")
export const size = { width: format.w, height: format.h }
export const contentType = "image/png"
export const alt = "Sapienza Labs"

// Geração estática no build (sem runtime no Coolify).
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  const { tag, field } = pillarStyle(post?.pilar ?? "pme")
  return renderBrandImage(
    format,
    CapaEditorial({
      format,
      field,
      eyebrow: tag,
      title: post?.title ?? "Sapienza Labs",
      footer: "SAPIENZA LABS · BLOG",
    }),
  )
}
