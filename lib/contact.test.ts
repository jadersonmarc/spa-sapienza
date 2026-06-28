import { describe, expect, it } from "vitest"
import { WHATSAPP_PHONE, whatsappUrl } from "./contact"

describe("whatsappUrl", () => {
  it("usa o número padrão do site", () => {
    expect(WHATSAPP_PHONE).toBe("5521984167397")
    expect(whatsappUrl("oi")).toContain("https://wa.me/5521984167397")
  })

  it("faz encode da mensagem", () => {
    const url = whatsappUrl('Plano "Essencial" & cia')
    expect(url).toContain("?text=")
    expect(url).toContain("%22Essencial%22")
    expect(url).toContain("%26")
    expect(url).not.toContain(" ")
  })
})
