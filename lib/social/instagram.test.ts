import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { postToInstagram } from "./instagram"

// Roteia as chamadas do Graph por URL, registrando a ordem para checar que o
// publish só acontece depois do container ficar FINISHED.
function mockGraph(statusSequence: string[]) {
  const calls: string[] = []
  let statusIdx = 0
  const fetchMock = vi.fn(async (url: string | URL) => {
    const u = String(url)
    if (u.includes("/media_publish")) {
      calls.push("publish")
      return new Response(JSON.stringify({ id: "MEDIA_123" }), { status: 200 })
    }
    if (u.includes("/media")) {
      calls.push("create")
      return new Response(JSON.stringify({ id: "CONTAINER_1" }), { status: 200 })
    }
    if (u.includes("status_code")) {
      const code = statusSequence[Math.min(statusIdx++, statusSequence.length - 1)]
      calls.push(`status:${code}`)
      return new Response(JSON.stringify({ status_code: code }), { status: 200 })
    }
    // permalink (best-effort)
    calls.push("permalink")
    return new Response(JSON.stringify({ permalink: "https://instagram.com/p/abc" }), { status: 200 })
  })
  vi.stubGlobal("fetch", fetchMock)
  return { calls }
}

describe("postToInstagram", () => {
  beforeEach(() => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "tok"
    process.env.INSTAGRAM_ACCOUNT_ID = "ig123"
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("só publica depois do container ficar FINISHED", async () => {
    const { calls } = mockGraph(["FINISHED"])
    const out = await postToInstagram({ caption: "oi", imageUrl: "https://cdn/x.png" })

    expect(out.id).toBe("MEDIA_123")
    expect(out.permalink).toBe("https://instagram.com/p/abc")
    // ordem: cria → checa status → publica (publish nunca antes do status)
    expect(calls.indexOf("status:FINISHED")).toBeLessThan(calls.indexOf("publish"))
    expect(calls.indexOf("create")).toBeLessThan(calls.indexOf("status:FINISHED"))
  })

  it("não publica e lança erro quando o container dá ERROR", async () => {
    const { calls } = mockGraph(["ERROR"])
    await expect(
      postToInstagram({ caption: "oi", imageUrl: "https://cdn/x.png" }),
    ).rejects.toThrow(/processamento da imagem falhou/i)
    expect(calls).not.toContain("publish")
  })
})
