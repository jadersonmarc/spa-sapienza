import { describe, expect, it } from "vitest"
import { brandImageKey, editorUploadKey, prefixFor } from "./keys"

describe("prefixFor", () => {
  it("mapeia finalidade -> pasta", () => {
    expect(prefixFor("article")).toBe("articles")
    expect(prefixFor("instagram")).toBe("social/instagram")
    expect(prefixFor("linkedin")).toBe("social/linkedin")
    expect(prefixFor("editor")).toBe("editor")
    expect(prefixFor("page")).toBe("pages")
  })
})

describe("brandImageKey", () => {
  it("artigo: articles/<slug>/<formatId>.png", () => {
    expect(brandImageKey({ purpose: "article", slug: "retrabalho-manual", formatId: "blog-og" })).toBe(
      "articles/retrabalho-manual/blog-og.png",
    )
  })

  it("instagram: social/instagram/<slug>__<formatId>.png", () => {
    expect(brandImageKey({ purpose: "instagram", slug: "fila-de-mensagens", formatId: "ig-feed" })).toBe(
      "social/instagram/fila-de-mensagens__ig-feed.png",
    )
  })

  it("linkedin: respeita a pasta e o ext custom", () => {
    expect(brandImageKey({ purpose: "linkedin", slug: "post-x", formatId: "li-feed", ext: "jpg" })).toBe(
      "social/linkedin/post-x__li-feed.jpg",
    )
  })
})

describe("editorUploadKey", () => {
  it("monta editor/<aaaa>/<mm>/<uuid>.<ext> (mês com zero à esquerda)", () => {
    const key = editorUploadKey({ uuid: "abc", ext: "png", date: new Date(Date.UTC(2026, 0, 9)) })
    expect(key).toBe("editor/2026/01/abc.png")
  })
})
