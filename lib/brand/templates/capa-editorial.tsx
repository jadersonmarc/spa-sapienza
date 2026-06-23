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
  // Título prominente: base ampla na largura, degradê suave por comprimento e
  // teto pela altura (evita estouro em formatos baixos como a OG 1.91:1).
  const big = Math.round(format.w * 0.095)
  const byLength = title.length > 64 ? big * 0.72 : title.length > 42 ? big * 0.84 : big
  const heightCap = Math.round(format.h * 0.24)
  const titlePx = Math.max(minType.title, Math.min(Math.round(byLength), heightCap))
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
