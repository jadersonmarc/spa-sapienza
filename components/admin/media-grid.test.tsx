import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { MediaGrid, fileNameFromKey, formatBytes } from "./media-grid"

describe("fileNameFromKey", () => {
  it("pega o último segmento da key", () => {
    expect(fileNameFromKey("social/instagram/abc.png")).toBe("abc.png")
    expect(fileNameFromKey("x.png")).toBe("x.png")
  })
})

describe("formatBytes", () => {
  it("formata B/KB/MB e trata ausência", () => {
    expect(formatBytes(512)).toBe("512 B")
    expect(formatBytes(2048)).toBe("2 KB")
    expect(formatBytes(3_145_728)).toBe("3.0 MB")
    expect(formatBytes(undefined)).toBe("")
  })
})

describe("MediaGrid", () => {
  const objects = [
    { key: "social/instagram/a.png", url: "https://cdn/social/instagram/a.png", size: 1024 },
    { key: "social/instagram/b.png", url: "https://cdn/social/instagram/b.png" },
  ]

  it("renderiza uma miniatura selecionável por objeto", () => {
    const html = renderToStaticMarkup(<MediaGrid objects={objects} onSelect={() => {}} />)
    expect((html.match(/<img/g) ?? []).length).toBe(2)
    expect((html.match(/<button/g) ?? []).length).toBe(2)
    expect(html).toContain("https://cdn/social/instagram/a.png")
    expect(html).toContain("a.png")
  })

  it("destaca a imagem selecionada", () => {
    const html = renderToStaticMarkup(
      <MediaGrid objects={objects} onSelect={() => {}} selectedUrl="https://cdn/social/instagram/a.png" />,
    )
    expect(html).toContain("ring-primary")
  })

  it("sem onSelect, não vira botão (modo só-leitura)", () => {
    const html = renderToStaticMarkup(<MediaGrid objects={objects} />)
    expect((html.match(/<button/g) ?? []).length).toBe(0)
    expect((html.match(/<img/g) ?? []).length).toBe(2)
  })
})
