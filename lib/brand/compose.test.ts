import { describe, expect, it } from "vitest"
import { r2KeyFor } from "./compose"

// Convenção de nomes do guia (§6).
describe("r2KeyFor", () => {
  it("monta a chave de imagem social (IG 4:5)", () => {
    expect(r2KeyFor({ pilar: "engenharia", slug: "fila-de-mensagens", formatId: "ig-feed" })).toBe(
      "sapienza_engai_fila-de-mensagens_ig_4x5.png",
    )
  })

  it("monta a chave da OG do blog (1.91:1)", () => {
    expect(r2KeyFor({ pilar: "pme", slug: "retrabalho-manual", formatId: "blog-og" })).toBe(
      "sapienza_pme_retrabalho-manual_blog_191x1.png",
    )
  })
})
