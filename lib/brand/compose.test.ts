import { describe, expect, it } from "vitest"
import { r2KeyFor } from "./compose"

// File-system por finalidade (lib/storage/keys.ts): canal do formato -> pasta.
describe("r2KeyFor", () => {
  it("imagem social do IG cai em social/instagram/", () => {
    expect(r2KeyFor({ pilar: "engenharia", slug: "fila-de-mensagens", formatId: "ig-feed" })).toBe(
      "social/instagram/fila-de-mensagens__ig-feed.png",
    )
  })

  it("OG do blog cai em articles/<slug>/", () => {
    expect(r2KeyFor({ pilar: "pme", slug: "retrabalho-manual", formatId: "blog-og" })).toBe(
      "articles/retrabalho-manual/blog-og.png",
    )
  })
})
