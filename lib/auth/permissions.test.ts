import { describe, expect, it } from "vitest"
import { isAdmin, socialStatusRequiresAdmin, transitionRequiresAdmin } from "./permissions"

describe("permissões", () => {
  it("isAdmin distingue os papéis", () => {
    expect(isAdmin("admin")).toBe(true)
    expect(isAdmin("editor")).toBe(false)
  })

  it("publicar/agendar/arquivar exigem admin", () => {
    expect(transitionRequiresAdmin("published")).toBe(true)
    expect(transitionRequiresAdmin("scheduled")).toBe(true)
    expect(transitionRequiresAdmin("archived")).toBe(true)
  })

  it("rascunho/em revisão não exigem admin", () => {
    expect(transitionRequiresAdmin("draft")).toBe(false)
    expect(transitionRequiresAdmin("in_review")).toBe(false)
  })

  it("envio social exige admin; aprovar/voltar não", () => {
    expect(socialStatusRequiresAdmin("sent")).toBe(true)
    expect(socialStatusRequiresAdmin("approved")).toBe(false)
    expect(socialStatusRequiresAdmin("draft")).toBe(false)
  })
})
