import { describe, expect, it } from "vitest"
import { secretMatches } from "./webhook"

describe("secretMatches (autorização máquina-a-máquina)", () => {
  const expected = "s3cr3t-abc"

  it("aceita o secret correto", () => {
    expect(secretMatches("s3cr3t-abc", expected)).toBe(true)
  })

  it("rejeita o secret errado", () => {
    expect(secretMatches("errado", expected)).toBe(false)
  })

  it("rejeita ausente (null/undefined/vazio)", () => {
    expect(secretMatches(null, expected)).toBe(false)
    expect(secretMatches(undefined, expected)).toBe(false)
    expect(secretMatches("", expected)).toBe(false)
  })

  it("rejeita tamanho diferente sem lançar exceção", () => {
    expect(secretMatches("x", expected)).toBe(false)
    expect(secretMatches("s3cr3t-abc-mais-longo", expected)).toBe(false)
  })
})
