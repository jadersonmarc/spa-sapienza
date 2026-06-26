import { describe, expect, it } from "vitest"
import { parseHashtags } from "./social-text"

describe("parseHashtags", () => {
  it("remove #, separa por espaço/vírgula e descarta vazios", () => {
    expect(parseHashtags("#pme, automacao  #software")).toEqual(["pme", "automacao", "software"])
  })

  it("deduplica preservando a ordem", () => {
    expect(parseHashtags("pme pme #pme automacao")).toEqual(["pme", "automacao"])
  })

  it("string vazia -> lista vazia", () => {
    expect(parseHashtags("   ")).toEqual([])
  })
})
