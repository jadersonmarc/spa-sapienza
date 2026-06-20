import { describe, expect, it } from "vitest"
import { allowedSocialTransitions, canSocialTransition } from "./social-status"

describe("status do post social", () => {
  it("segue draft → approved → sent", () => {
    expect(canSocialTransition("draft", "approved")).toBe(true)
    expect(canSocialTransition("approved", "sent")).toBe(true)
  })

  it("permite voltar de aprovado para rascunho", () => {
    expect(canSocialTransition("approved", "draft")).toBe(true)
  })

  it("bloqueia pulos e transições a partir de enviado", () => {
    expect(canSocialTransition("draft", "sent")).toBe(false)
    expect(canSocialTransition("sent", "approved")).toBe(false)
    expect(canSocialTransition("sent", "draft")).toBe(false)
  })

  it("lista transições permitidas", () => {
    expect(allowedSocialTransitions("draft")).toEqual(["approved"])
    expect(allowedSocialTransitions("approved")).toEqual(["sent", "draft"])
    expect(allowedSocialTransitions("sent")).toEqual([])
  })
})
