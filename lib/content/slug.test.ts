import { describe, expect, it } from "vitest"
import { slugify } from "./slug"

describe("slugify", () => {
  it("remove acentos e normaliza para kebab-case", () => {
    expect(slugify("Automação para PMEs")).toBe("automacao-para-pmes")
    expect(slugify("Inovação & Tecnologia")).toBe("inovacao-tecnologia")
  })

  it("apara hifens das pontas e colapsa separadores", () => {
    expect(slugify("  Olá   Mundo!  ")).toBe("ola-mundo")
    expect(slugify("a---b__c")).toBe("a-b-c")
  })

  it("limita o tamanho a 80 caracteres", () => {
    expect(slugify("a".repeat(120)).length).toBeLessThanOrEqual(80)
  })
})
