import { describe, expect, it } from "vitest"
import { themeGuidance } from "./draft"

describe("themeGuidance (renovação de tema)", () => {
  it("sempre pede um tema novo, mesmo sem contexto", () => {
    const g = themeGuidance()
    expect(g).toMatch(/tema NOVO/i)
    expect(g).not.toMatch(/JÁ PUBLICADOS/)
    expect(g).not.toMatch(/ÁREAS SUGERIDAS/)
  })

  it("lista os títulos a evitar e as sementes temáticas", () => {
    const g = themeGuidance({
      avoidTitles: ["Como automatizar prazos no PJe"],
      themeSeeds: ["LGPD para clínicas"],
    })
    expect(g).toMatch(/JÁ PUBLICADOS/)
    expect(g).toContain("Como automatizar prazos no PJe")
    expect(g).toMatch(/ÁREAS SUGERIDAS/)
    expect(g).toContain("LGPD para clínicas")
  })

  it("limita o volume (40 títulos, 12 sementes)", () => {
    const avoidTitles = Array.from({ length: 60 }, (_, i) => `T${i}`)
    const themeSeeds = Array.from({ length: 30 }, (_, i) => `S${i}`)
    const g = themeGuidance({ avoidTitles, themeSeeds })
    expect(g).toContain("T39")
    expect(g).not.toContain("T40")
    expect(g).toContain("S11")
    expect(g).not.toContain("S12")
  })
})
