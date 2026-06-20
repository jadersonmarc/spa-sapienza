import { describe, expect, it } from "vitest"
import { validatePasswordStrength } from "./password"

describe("validatePasswordStrength", () => {
  it("aceita senha forte", () => {
    expect(validatePasswordStrength("Senha1Forte")).toBeNull()
  })

  it("rejeita curta", () => {
    expect(validatePasswordStrength("Ab1")).toMatch(/10 caracteres/)
  })

  it("exige minúscula, maiúscula e número", () => {
    expect(validatePasswordStrength("SENHA123456")).toMatch(/minúscula/)
    expect(validatePasswordStrength("senha123456")).toMatch(/maiúscula/)
    expect(validatePasswordStrength("SenhaSemNumero")).toMatch(/número/)
  })
})
