import { describe, expect, it } from "vitest"
import {
  NON_EDITORIAL_KEYS,
  isPilarKey,
  resolveVertente,
  vertentesBySection,
  VERTENTES,
} from "./vertentes"

describe("vertentes registry", () => {
  it("tem os 3 pilares (rodízio/blog) e campanha/produto (avulsas)", () => {
    const pilares = VERTENTES.filter((v) => v.kind === "pilar")
    expect(pilares.map((v) => v.key)).toEqual(["p1", "p2", "p3"])
    expect(pilares.every((v) => v.rotation && v.section === "blog")).toBe(true)
    const avulsas = VERTENTES.filter((v) => v.kind !== "pilar")
    expect(avulsas.map((v) => v.key)).toEqual(["campanha", "produto"])
    expect(avulsas.every((v) => !v.rotation && v.section === "campanhas")).toBe(true)
  })

  it("resolveVertente mapeia pilar → pilar; avulsa → vertente", () => {
    expect(resolveVertente("p2")).toEqual({ pilar: "p2", vertente: null })
    expect(resolveVertente("campanha")).toEqual({ pilar: null, vertente: "campanha" })
    expect(resolveVertente("produto")).toEqual({ pilar: null, vertente: "produto" })
  })

  it("resolveVertente rejeita key desconhecida", () => {
    expect(resolveVertente("inexistente")).toBeNull()
  })

  it("isPilarKey só aceita p1/p2/p3", () => {
    expect(isPilarKey("p1")).toBe(true)
    expect(isPilarKey("campanha")).toBe(false)
  })

  it("seções e keys não-editoriais", () => {
    expect(vertentesBySection("blog").map((v) => v.key)).toEqual(["p1", "p2", "p3"])
    expect(vertentesBySection("campanhas").map((v) => v.key)).toEqual(["campanha", "produto"])
    expect([...NON_EDITORIAL_KEYS]).toEqual(["campanha", "produto"])
  })
})
