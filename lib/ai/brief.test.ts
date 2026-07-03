import { describe, expect, it } from "vitest"
import { buildBriefUser } from "./brief"

describe("buildBriefUser", () => {
  it("inclui objetivo, vertente e tom do registry", () => {
    const u = buildBriefUser({ vertenteKey: "campanha", objetivo: "Vender o plano X" })
    expect(u).toContain("Vender o plano X")
    expect(u).toContain("VERTENTE: Campanha")
    expect(u).toMatch(/TOM:/) // tom padrão da vertente
  })

  it("inclui pontos-chave e público quando informados; omite quando vazios", () => {
    const withAll = buildBriefUser({
      vertenteKey: "p1",
      objetivo: "obj",
      pontosChave: "ponto A",
      publico: "advogados",
    })
    expect(withAll).toContain("PONTOS-CHAVE:")
    expect(withAll).toContain("ponto A")
    expect(withAll).toContain("PÚBLICO: advogados")

    const minimal = buildBriefUser({ vertenteKey: "p1", objetivo: "obj" })
    expect(minimal).not.toContain("PONTOS-CHAVE:")
    expect(minimal).not.toContain("PÚBLICO:")
  })

  it("tom explícito sobrepõe o tom da vertente", () => {
    const u = buildBriefUser({ vertenteKey: "p1", objetivo: "obj", tom: "irônico" })
    expect(u).toContain("TOM: irônico")
  })
})
