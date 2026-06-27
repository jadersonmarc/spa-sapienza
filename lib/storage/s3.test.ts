import { describe, expect, it } from "vitest"
import { mapListedObjects } from "./s3"

describe("mapListedObjects", () => {
  it("monta {key, url} público e normaliza a barra final do base", () => {
    const out = mapListedObjects(
      [{ Key: "social/instagram/a__ig-feed.png" }, { Key: "social/instagram/b__ig-feed.png" }],
      "https://cdn.exemplo.com/",
    )
    expect(out).toEqual([
      { key: "social/instagram/a__ig-feed.png", url: "https://cdn.exemplo.com/social/instagram/a__ig-feed.png" },
      { key: "social/instagram/b__ig-feed.png", url: "https://cdn.exemplo.com/social/instagram/b__ig-feed.png" },
    ])
  })

  it("descarta entradas vazias e pseudo-pastas (terminadas em /)", () => {
    const out = mapListedObjects(
      [{ Key: "social/instagram/" }, { Key: undefined }, { Key: "social/instagram/c.png" }],
      "https://cdn.exemplo.com",
    )
    expect(out).toEqual([
      { key: "social/instagram/c.png", url: "https://cdn.exemplo.com/social/instagram/c.png" },
    ])
  })

  it("retorna vazio quando não há Contents", () => {
    expect(mapListedObjects(undefined, "https://cdn.exemplo.com")).toEqual([])
  })

  it("inclui size e lastModified (ISO) quando presentes", () => {
    const out = mapListedObjects(
      [{ Key: "geral/x.png", Size: 1234, LastModified: new Date(Date.UTC(2026, 5, 27, 12, 0, 0)) }],
      "https://cdn.exemplo.com",
    )
    expect(out).toEqual([
      {
        key: "geral/x.png",
        url: "https://cdn.exemplo.com/geral/x.png",
        size: 1234,
        lastModified: "2026-06-27T12:00:00.000Z",
      },
    ])
  })
})
