import { afterEach, describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import type { Transparencia } from "@/lib/products-config"

// Texto visível (sem tags/atributos), p/ as guardas não pegarem href/classe/svg.
const visibleText = (html: string) => html.replace(/<[^>]*>/g, " ")

// Renderiza a seção com uma dada flag de transparência (env override), sempre com
// módulos frescos (as flags são const lidas no import).
async function renderWith(mode?: Transparencia, comboTeaser = false): Promise<string> {
  vi.resetModules()
  if (mode) process.env.NEXT_PUBLIC_TRANSPARENCIA = mode
  else delete process.env.NEXT_PUBLIC_TRANSPARENCIA
  if (comboTeaser) process.env.NEXT_PUBLIC_MOSTRAR_COMBO_TEASER = "true"
  else delete process.env.NEXT_PUBLIC_MOSTRAR_COMBO_TEASER
  const { SubscriptionProducts } = await import("./subscription-products")
  return renderToStaticMarkup(<SubscriptionProducts />)
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_TRANSPARENCIA
  delete process.env.NEXT_PUBLIC_MOSTRAR_COMBO_TEASER
  vi.resetModules()
})

describe("SubscriptionProducts — modo hibrido (default)", () => {
  it("renderiza os preços 400/700/1200 vindos do JSON (não chumbados)", async () => {
    const html = await renderWith()
    const text = visibleText(html)
    // brl() usa NBSP entre R$ e o número; normalizamos pra comparar.
    const norm = text.replace(/ /g, " ")
    expect(norm).toContain("R$ 400")
    expect(norm).toContain("R$ 700")
    expect(norm).toContain("R$ 1.200")
  })

  it("rotula a unidade a partir do metric: respostas (Margot) e peças (Motor)", async () => {
    const text = visibleText(await renderWith())
    expect(text).toContain("respostas")
    expect(text).toContain("peças")
  })

  it("nunca usa a palavra 'conversa' (métrica descontinuada)", async () => {
    const text = visibleText(await renderWith())
    expect(text.toLowerCase()).not.toContain("conversa")
  })

  it("não vaza número comercial: setup, portas, combo, excedente, Degrau 13", async () => {
    // "sem entrada" é copy honesta (sem número); o proibido são os VALORES/estruturas.
    const text = visibleText(await renderWith()).toLowerCase()
    for (const termo of ["setup", "degrau", "combo", "excedente", "3.000", "6.000", "porta de pagamento"]) {
      expect(text).not.toContain(termo)
    }
  })

  it("destaca o Pro como 'mais escolhido'", async () => {
    const text = visibleText(await renderWith())
    expect(text.toLowerCase()).toContain("mais escolhido")
  })

  it("cada tier tem CTA de WhatsApp com produto + tier pré-preenchidos", async () => {
    const html = await renderWith()
    const ctas = html.match(/href="https:\/\/wa\.me\/5521984185606/g) ?? []
    // 3 tiers × 2 produtos = 6 CTAs de plano.
    expect(ctas.length).toBe(6)
    // produto + tier codificados no texto da mensagem.
    expect(html).toContain("Margot%20Atendente%20Pro")
    expect(html).toContain("Margot%20Editora%20Premium")
  })
})

describe("SubscriptionProducts — flag alterna os modos", () => {
  it("sob_consulta oculta os valores mensais", async () => {
    const text = visibleText(await renderWith("sob_consulta")).replace(/ /g, " ")
    expect(text).not.toContain("R$ 400")
    expect(text).not.toContain("R$ 700")
    expect(text.toLowerCase()).toContain("a combinar")
  })

  it("teaser do combo aparece só com a flag ligada, sem preço", async () => {
    const semTeaser = visibleText(await renderWith("hibrido", false))
    expect(semTeaser).not.toContain("Sistema Sapienza")

    const comTeaser = visibleText(await renderWith("hibrido", true)).replace(/ /g, " ")
    expect(comTeaser).toContain("Sistema Sapienza")
    // teaser não expõe o preço do combo.
    expect(comTeaser).not.toContain("R$ 1.600")
    expect(comTeaser).not.toContain("R$ 1.000")
  })
})
