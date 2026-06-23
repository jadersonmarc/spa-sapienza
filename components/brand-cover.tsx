import type { Pilar } from "@/lib/blog"
import { getFormat, type FormatId } from "@/lib/brand/formats"
import { cn } from "@/lib/utils"

// Capa on-brand (capa-editorial) renderizada pelo app via /api/og — substitui a
// capa programática antiga. Mesma peça serve hero do post e miniatura do índice.
export function BrandCover({
  pilar,
  title,
  format = "blog-hero",
  className,
  priority = false,
}: {
  pilar: Pilar
  title: string
  format?: FormatId
  className?: string
  priority?: boolean
}) {
  const f = getFormat(format)
  const qs = new URLSearchParams({ archetype: "capa", format, pilar, text: title })
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/og?${qs.toString()}`}
      alt={title}
      width={f.w}
      height={f.h}
      loading={priority ? "eager" : "lazy"}
      className={cn("aspect-video w-full object-cover", className)}
    />
  )
}
