import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { colors } from "./tokens"

// Amarração: tokens.ts é a fonte única, mas o site usa as CSS vars OKLCH em
// globals.css. Este teste falha se algum OKLCH divergir da var ancorada —
// impede que a marca bifurque entre o renderer (sRGB) e o site (OKLCH).

const cssPath = fileURLToPath(new URL("../../app/globals.css", import.meta.url))
const css = readFileSync(cssPath, "utf8")

/** Extrai `--name: <valor>;` de dentro de um bloco `scope { ... }`. */
function readVar(scope: ":root" | ".dark", name: string): string | null {
  const block = css.match(new RegExp(`${scope.replace(".", "\\.")}\\s*\\{([^}]*)\\}`))
  if (!block) return null
  const decl = block[1].match(new RegExp(`--${name}:\\s*([^;]+);`))
  return decl ? decl[1].trim() : null
}

describe("amarração tokens.ts ↔ globals.css", () => {
  for (const [token, { oklch, cssVar }] of Object.entries(colors)) {
    it(`${token} bate com ${cssVar.scope} --${cssVar.name}`, () => {
      expect(readVar(cssVar.scope, cssVar.name)).toBe(oklch)
    })
  }
})
