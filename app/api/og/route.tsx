import type { Pilar } from "@/lib/blog"
import { composeBrandImage, type ArchetypeId } from "@/lib/brand/compose"
import { formats, type FormatId } from "@/lib/brand/formats"
import { renderBrandImage } from "@/lib/brand/render"
import type { Field } from "@/lib/brand/tokens"

// Render on-demand de uma peça da marca. Usado pelo preview do composer no
// admin (e por qualquer orquestrador externo). OG do blog continua estática.
export const dynamic = "force-dynamic"

const ARCHETYPES = new Set<ArchetypeId>(["capa", "conceito", "diagrama", "carrossel", "bastidores"])
const PILARS = new Set<Pilar>(["engenharia", "pme", "bastidores"])

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams
  const archetype = (p.get("archetype") ?? "capa") as ArchetypeId
  const formatId = (p.get("format") ?? "ig-feed") as FormatId
  const pilar = (p.get("pilar") ?? "pme") as Pilar

  if (!ARCHETYPES.has(archetype) || !(formatId in formats) || !PILARS.has(pilar)) {
    return new Response("parâmetro inválido", { status: 400 })
  }

  const fieldParam = p.get("field")
  const field = fieldParam === "ink" || fieldParam === "surface" ? (fieldParam as Field) : undefined

  const { format, node } = composeBrandImage({
    archetype,
    formatId,
    pilar,
    field,
    text: (p.get("text") ?? "Sapienza Labs").slice(0, 200),
    index: Number(p.get("index")) || undefined,
    total: Number(p.get("total")) || undefined,
    kind: (p.get("kind") as "cover" | "body" | "cta") || undefined,
    imageUrl: p.get("image") ?? undefined,
    caption: p.get("caption")?.slice(0, 200) ?? undefined,
  })

  // Cache pela URL completa (texto/pilar/aspecto entram na chave): editar o
  // título gera nova URL, então o cache nunca serve uma peça desatualizada.
  return renderBrandImage(format, node, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  })
}
