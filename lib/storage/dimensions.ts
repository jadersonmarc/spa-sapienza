// Dimensões alvo por finalidade (D-dim): fonte única = lib/brand/formats.ts.
// Validação **não-bloqueante**: ao trocar a imagem, avisa se fugir do ideal.
import { getFormat, type FormatId } from "@/lib/brand/formats"

export type SocialPlatform = "instagram" | "linkedin"

// Formato principal por plataforma (espelha lib/social/image.ts).
export const FORMAT_BY_PLATFORM: Record<SocialPlatform, FormatId> = {
  instagram: "ig-feed",
  linkedin: "li-feed",
}

const ASPECT_TOLERANCE = 0.02 // 2% de folga na proporção

/**
 * Devolve um aviso (string) quando a imagem foge do alvo do formato, ou `null`
 * quando está adequada. Não bloqueia o upload — só orienta o operador.
 */
export function dimensionWarning(width: number, height: number, formatId: FormatId): string | null {
  if (!width || !height) return null
  const f = getFormat(formatId)
  const target = f.w / f.h
  const actual = width / height
  if (Math.abs(actual - target) / target > ASPECT_TOLERANCE) {
    return `A imagem é ${width}×${height}; o ideal para ${f.label} é ${f.w}×${f.h} (proporção diferente).`
  }
  if (width < f.w) {
    return `A imagem é ${width}×${height}; abaixo do ideal ${f.w}×${f.h} para ${f.label}.`
  }
  return null
}
