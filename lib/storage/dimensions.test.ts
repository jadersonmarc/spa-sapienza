import { describe, expect, it } from "vitest"
import { dimensionWarning, FORMAT_BY_PLATFORM } from "./dimensions"

describe("dimensionWarning", () => {
  it("dimensão exata do formato -> sem aviso", () => {
    // ig-feed = 1080×1350
    expect(dimensionWarning(1080, 1350, FORMAT_BY_PLATFORM.instagram)).toBeNull()
  })

  it("mesma proporção em resolução maior -> sem aviso", () => {
    expect(dimensionWarning(2160, 2700, "ig-feed")).toBeNull()
  })

  it("proporção diferente -> avisa", () => {
    expect(dimensionWarning(1080, 1080, "ig-feed")).toMatch(/proporção diferente/)
  })

  it("proporção certa mas resolução abaixo -> avisa", () => {
    expect(dimensionWarning(540, 675, "ig-feed")).toMatch(/abaixo do ideal/)
  })

  it("dimensões ausentes -> sem aviso", () => {
    expect(dimensionWarning(0, 0, "ig-feed")).toBeNull()
  })
})
