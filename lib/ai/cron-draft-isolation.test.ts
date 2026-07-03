import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

// Não-regressão (crítico): a geração por brief é um produtor SEPARADO. O caminho
// do cron editorial (route + gerador do cron) NÃO pode depender do módulo de
// brief nem da taxonomia de vertentes — o cron continua criando draft por pilar.
// Só as linhas de import (ignora comentários/prosa que citem os módulos).
function importsOf(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8")
    .split("\n")
    .filter((l) => /^\s*import\b/.test(l))
    .join("\n")
}
function fullText(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8")
}

describe("isolamento do cron editorial", () => {
  it("o route do cron não importa o módulo de brief nem vertentes", () => {
    const imports = importsOf("app/api/generate-draft/route.ts")
    expect(imports).not.toMatch(/lib\/ai\/brief/)
    expect(imports).not.toMatch(/vertentes/)
    // Continua criando post por pilar.
    const route = fullText("app/api/generate-draft/route.ts")
    expect(route).toContain("createContentItem")
    expect(route).toMatch(/pilar/)
  })

  it("o gerador do cron (draft.ts) não importa o módulo de brief", () => {
    expect(importsOf("lib/ai/draft.ts")).not.toMatch(/lib\/ai\/brief/)
  })

  it("o gerador por brief não importa o gerador do cron (draft.ts)", () => {
    expect(importsOf("lib/ai/brief.ts")).not.toMatch(/lib\/ai\/draft/)
  })
})
