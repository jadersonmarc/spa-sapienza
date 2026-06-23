import type { Format } from "../formats"
import { fieldStyle, fonts, minType, type Field } from "../tokens"
import { Frame } from "./signature"

export interface CapaEditorialProps {
  format: Format
  field: Field
  /** `{TAG} · {ÍNDICE}` do trilho */
  eyebrow: string
  title: string
  /** metadado do rodapé (ex.: `SAPIENZA LABS`) */
  footer: string
}

// Arquétipo capa-editorial: título Bricolage grande ancorado embaixo,
// um único sublinhado petróleo. Título degrada (nunca abaixo do mínimo).
export function CapaEditorial({ format, field, eyebrow, title, footer }: CapaEditorialProps) {
  const c = fieldStyle[field]
  const big = Math.round(format.w * 0.075)
  const titlePx = Math.max(
    minType.title,
    title.length > 60 ? Math.round(big * 0.7) : title.length > 38 ? Math.round(big * 0.85) : big,
  )
  const ruleH = Math.max(4, Math.round(format.w * 0.006))

  return (
    <Frame format={format} field={field} eyebrow={eyebrow} footer={footer}>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "flex-end" }}>
        <div
          style={{
            display: "flex",
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: titlePx,
            lineHeight: 1.04,
            letterSpacing: -Math.round(titlePx * 0.02),
            maxWidth: Math.round(format.w * 0.92),
            color: c.fg,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: Math.round(titlePx * 0.3),
            width: Math.round(titlePx * 1.6),
            height: ruleH,
            borderRadius: ruleH,
            backgroundColor: c.accent,
          }}
        />
      </div>
    </Frame>
  )
}
