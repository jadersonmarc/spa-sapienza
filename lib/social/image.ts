import type { Pilar } from "@/lib/blog"
import { composeBrandImage, r2KeyFor } from "@/lib/brand/compose"
import type { FormatId } from "@/lib/brand/formats"
import { renderBrandImage } from "@/lib/brand/render"
import type { Platform } from "@/lib/content/queries"
import { isStorageConfigured, uploadObject } from "@/lib/storage/s3"

const SITE_URL = process.env.SITE_URL ?? "https://sapienzalabs.com.br"

// Aspecto principal por plataforma (IG retrato 4:5; LinkedIn feed 1:1).
const FORMAT_BY_PLATFORM: Record<Platform, FormatId> = {
  instagram: "ig-feed",
  linkedin: "li-feed",
}

export interface SocialImageInput {
  platform: Platform
  pilar: Pilar
  slug: string
  title: string
}

/** Renderiza o card social on-brand (capa-editorial) no PNG da plataforma. */
export function renderSocialImage(input: SocialImageInput): Promise<Buffer> {
  const formatId = FORMAT_BY_PLATFORM[input.platform]
  const { format, node } = composeBrandImage({ archetype: "capa", formatId, pilar: input.pilar, text: input.title })
  return renderBrandImage(format, node)
    .arrayBuffer()
    .then((b) => Buffer.from(b))
}

// URL pública do card social. Com R2: renderiza e hospeda lá (nome §6).
// Sem R2: cai na rota on-demand (/api/og), que rende o mesmo PNG público.
export async function getSocialImageUrl(input: SocialImageInput): Promise<string> {
  const formatId = FORMAT_BY_PLATFORM[input.platform]

  if (!isStorageConfigured()) {
    const qs = new URLSearchParams({
      archetype: "capa",
      format: formatId,
      pilar: input.pilar,
      text: input.title,
    })
    return `${SITE_URL}/api/og?${qs.toString()}`
  }

  const buffer = await renderSocialImage(input)
  const key = r2KeyFor({ pilar: input.pilar, slug: input.slug, formatId })
  return uploadObject(key, buffer, "image/png")
}
