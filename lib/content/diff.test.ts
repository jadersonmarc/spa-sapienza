import { describe, expect, it } from "vitest"
import { diffStats, lineDiff } from "./diff"

describe("lineDiff", () => {
  it("marca linhas iguais", () => {
    const d = lineDiff("a\nb", "a\nb")
    expect(d.every((l) => l.type === "eq")).toBe(true)
  })

  it("detecta adição, remoção e alteração", () => {
    const d = lineDiff("linha A\nlinha B\nlinha C", "linha A\nlinha B2\nlinha C\nlinha D")
    const { added, removed } = diffStats(d)
    expect(added).toBe(2) // B2 + D
    expect(removed).toBe(1) // B
    expect(d[0]).toEqual({ type: "eq", text: "linha A" })
  })

  it("trata texto vazio (tudo novo)", () => {
    const d = lineDiff("", "nova linha")
    const { added, removed } = diffStats(d)
    expect(added).toBe(1)
    expect(removed).toBe(0)
  })

  it("trata remoção total", () => {
    const d = lineDiff("a\nb\nc", "")
    const { added, removed } = diffStats(d)
    expect(added).toBe(0)
    expect(removed).toBe(3)
  })
})
