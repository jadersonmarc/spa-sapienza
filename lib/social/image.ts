import { isStorageConfigured, uploadObject } from "@/lib/storage/s3"

const SITE_URL = process.env.SITE_URL ?? "https://sapienzalabs.com.br"

// URL pública da imagem do post: usa a OG do artigo (PNG via ImageResponse).
// Se o R2 estiver configurado, re-hospeda lá; senão usa a própria rota OG (já pública).
export async function getSocialImageUrl(slug: string): Promise<string> {
  const ogUrl = `${SITE_URL}/blog/${slug}/opengraph-image`
  if (!isStorageConfigured()) return ogUrl

  const res = await fetch(ogUrl, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) return ogUrl // fallback se a OG não responder
  const buffer = Buffer.from(await res.arrayBuffer())
  return uploadObject(`social/${slug}.png`, buffer, "image/png")
}
