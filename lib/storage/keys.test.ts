import { describe, expect, it } from "vitest"
import {
  brandImageKey,
  editorUploadKey,
  isR2Purpose,
  listPrefixFor,
  mediaUploadKey,
  prefixFor,
  R2_PURPOSES,
  socialUploadKey,
} from "./keys"

describe("prefixFor", () => {
  it("mapeia finalidade -> pasta", () => {
    expect(prefixFor("article")).toBe("articles")
    expect(prefixFor("instagram")).toBe("social/instagram")
    expect(prefixFor("linkedin")).toBe("social/linkedin")
    expect(prefixFor("editor")).toBe("editor")
    expect(prefixFor("page")).toBe("pages")
    expect(prefixFor("geral")).toBe("geral")
  })

  it("listPrefixFor adiciona a barra final (picker)", () => {
    expect(listPrefixFor("instagram")).toBe("social/instagram/")
    expect(listPrefixFor("linkedin")).toBe("social/linkedin/")
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

describe("socialUploadKey", () => {
  it("cai na pasta da plataforma: social/<plataforma>/<uuid>.<ext>", () => {
    expect(socialUploadKey({ platform: "instagram", uuid: "u1", ext: "jpg" })).toBe(
      "social/instagram/u1.jpg",
    )
    expect(socialUploadKey({ platform: "linkedin", uuid: "u2", ext: "png" })).toBe(
      "social/linkedin/u2.png",
    )
  })
})

describe("mediaUploadKey", () => {
  it("cai na pasta da finalidade: <pasta>/<uuid>.<ext>", () => {
    expect(mediaUploadKey({ purpose: "geral", uuid: "g1", ext: "webp" })).toBe("geral/g1.webp")
    expect(mediaUploadKey({ purpose: "page", uuid: "p1", ext: "png" })).toBe("pages/p1.png")
    expect(mediaUploadKey({ purpose: "instagram", uuid: "i1", ext: "jpg" })).toBe(
      "social/instagram/i1.jpg",
    )
  })
})

describe("isR2Purpose / R2_PURPOSES", () => {
  it("valida finalidades conhecidas e rejeita o resto", () => {
    for (const p of R2_PURPOSES) expect(isR2Purpose(p)).toBe(true)
    expect(isR2Purpose("../etc")).toBe(false)
    expect(isR2Purpose("uploads")).toBe(false)
  })
})

describe("editorUploadKey", () => {
  it("monta editor/<aaaa>/<mm>/<uuid>.<ext> (mês com zero à esquerda)", () => {
    const key = editorUploadKey({ uuid: "abc", ext: "png", date: new Date(Date.UTC(2026, 0, 9)) })
    expect(key).toBe("editor/2026/01/abc.png")
  })
})
