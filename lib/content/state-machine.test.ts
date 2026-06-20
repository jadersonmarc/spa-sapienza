import { describe, expect, it } from "vitest"
import { allowedTransitions, canTransition } from "./state-machine"

describe("máquina de estados", () => {
  it("permite o fluxo editorial padrão", () => {
    expect(canTransition("draft", "in_review")).toBe(true)
    expect(canTransition("in_review", "scheduled")).toBe(true)
    expect(canTransition("in_review", "published")).toBe(true)
    expect(canTransition("scheduled", "published")).toBe(true)
    expect(canTransition("published", "archived")).toBe(true)
  })

  it("permite voltar a rascunho em edição", () => {
    expect(canTransition("in_review", "draft")).toBe(true)
    expect(canTransition("scheduled", "draft")).toBe(true)
    expect(canTransition("published", "draft")).toBe(true)
    expect(canTransition("archived", "draft")).toBe(true)
  })

  it("bloqueia transições inválidas", () => {
    expect(canTransition("draft", "published")).toBe(false)
    expect(canTransition("draft", "scheduled")).toBe(false)
    expect(canTransition("published", "in_review")).toBe(false)
    expect(canTransition("archived", "published")).toBe(false)
  })

  it("não permite transição para o mesmo estado", () => {
    expect(canTransition("draft", "draft")).toBe(false)
  })

  it("lista as transições permitidas por estado", () => {
    expect(allowedTransitions("draft")).toEqual(["in_review"])
    expect(allowedTransitions("archived")).toEqual(["draft"])
    expect(allowedTransitions("in_review")).toContain("published")
  })
})
