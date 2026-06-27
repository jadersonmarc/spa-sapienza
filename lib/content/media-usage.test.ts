import { describe, expect, it } from "vitest"
import {
  destKeyForMove,
  destKeyForRename,
  isKnownFolderKey,
  keyFolder,
  markdownReferencesUrl,
  sanitizeFileName,
} from "./media-usage"

describe("sanitizeFileName", () => {
  it("remove caracteres problemáticos e preserva ext", () => {
    expect(sanitizeFileName("Minha Foto (1).png")).toBe("Minha-Foto-1-.png")
    expect(sanitizeFileName("  ../etc/passwd  ")).toBe("etc-passwd")
    expect(sanitizeFileName("   ")).toBe("arquivo")
  })
})

describe("keyFolder", () => {
  it("devolve a pasta da key", () => {
    expect(keyFolder("social/instagram/x.png")).toBe("social/instagram")
    expect(keyFolder("semfolder.png")).toBe("")
  })
})

describe("destKeyForRename", () => {
  it("mantém a pasta e troca o nome", () => {
    expect(destKeyForRename("social/instagram/abc.png", "novo.png")).toBe("social/instagram/novo.png")
  })
})

describe("destKeyForMove", () => {
  it("mantém o arquivo e troca a pasta", () => {
    expect(destKeyForMove("social/instagram/abc.png", "geral")).toBe("geral/abc.png")
    expect(destKeyForMove("editor/2026/01/x.png", "article")).toBe("articles/x.png")
  })
})

describe("isKnownFolderKey", () => {
  it("aceita pastas conhecidas e rejeita travessia/raiz", () => {
    expect(isKnownFolderKey("social/instagram/a.png")).toBe(true)
    expect(isKnownFolderKey("geral/a.png")).toBe(true)
    expect(isKnownFolderKey("articles/slug/blog-og.png")).toBe(true)
    expect(isKnownFolderKey("../etc/passwd")).toBe(false)
    expect(isKnownFolderKey("/abs/a.png")).toBe(false)
    expect(isKnownFolderKey("desconhecida/a.png")).toBe(false)
  })
})

describe("markdownReferencesUrl", () => {
  it("detecta a URL no corpo", () => {
    expect(markdownReferencesUrl("![](https://cdn/x.png) texto", "https://cdn/x.png")).toBe(true)
    expect(markdownReferencesUrl("sem imagem", "https://cdn/x.png")).toBe(false)
  })
})
