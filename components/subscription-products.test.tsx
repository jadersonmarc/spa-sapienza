import { afterEach, describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import type { Transparencia } from "@/lib/products-config"

// Texto visível (sem tags/atributos), p/ as guardas não pegarem href/classe/svg.
const visibleText = (html: string) => html.replace(/<[^>]*>/g, " ")
// brl() usa NBSP (U+00A0) entre R$ e o número; normaliza p/ comparar com espaço comum.
const norm = (s: string) => s.replace(/ /g, " ")

// Renderiza a seção com uma dada flag de transparência (env override), sempre com
// módulos frescos (as flags são const lidas no import). `combo` liga/desliga a seção.
async function renderWith(mode?: Transparencia, combo = true): Promise<string> {
  vi.resetModules()
  if (mode) process.env.NEXT_PUBLIC_TRANSPARENCIA = mode
  else delete process.env.NEXT_PUBLIC_TRANSPARENCIA
  if (combo) delete process.env.NEXT_PUBLIC_MOSTRAR_COMBO
  else process.env.NEXT_PUBLIC_MOSTRAR_COMBO = "false"
  const { SubscriptionProducts } = await import("./subscription-products")
  return renderToStaticMarkup(<SubscriptionProducts />)
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_TRANSPARENCIA
  delete process.env.NEXT_PUBLIC_MOSTRAR_COMBO
  vi.resetModules()
})

describe("SubscriptionProducts — modo hibrido (default)", () => {
  it("renderiza os preços 400/700/1200 vindos do JSON (não chumbados)", async () => {
    const text = norm(visibleText(await renderWith()))
    expect(text).toContain("R$ 400")
    expect(text).toContain("R$ 700")
    expect(text).toContain("R$ 1.200")
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

  it("não vaza número comercial: setup, portas, excedente, Degrau 13", async () => {
    // "sem entrada" é copy honesta (sem número); o proibido são os VALORES/estruturas.
    // O combo agora é EXPOSTO de propósito (de/por/economia) — fora desta guarda.
    const text = visibleText(await renderWith()).toLowerCase()
    for (const termo of ["setup", "degrau", "excedente", "3.000", "6.000", "porta de pagamento"]) {
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
    // 3 tiers × 2 produtos = 6 CTAs de plano (os cards de combo não têm wa.me).
    expect(ctas.length).toBe(6)
    // produto + tier codificados no texto da mensagem.
    expect(html).toContain("Margot%20Atendente%20Pro")
    expect(html).toContain("Margot%20Editora%20Premium")
  })
})

describe("SubscriptionProducts — flag alterna os modos", () => {
  it("sob_consulta oculta os valores mensais", async () => {
    const text = norm(visibleText(await renderWith("sob_consulta")))
    expect(text).not.toContain("R$ 400")
    expect(text).not.toContain("R$ 700")
    expect(text.toLowerCase()).toContain("a combinar")
  })

  it("a seção de combo aparece por padrão e some com a flag desligada", async () => {
    const semCombo = visibleText(await renderWith("hibrido", false))
    expect(semCombo).not.toContain("Sistema Sapienza")
    expect(semCombo).not.toContain("Combo Start")

    const comCombo = visibleText(await renderWith("hibrido", true))
    expect(comCombo).toContain("Sistema Sapienza")
    expect(comCombo).toContain("Combo Start")
    expect(comCombo).toContain("Combo Pro")
  })

  it("cada combo mostra de/por/economia", async () => {
    const text = norm(visibleText(await renderWith()))
    expect(text).toContain("R$ 800") // Combo Start: de (soma dos avulsos)
    expect(text).toContain("R$ 2.400") // Combo Scale: de
    expect(text).toContain("R$ 2.000") // Combo Scale: por
    expect(text.toLowerCase()).toContain("economize")
  })

  it("CTA do combo leva ao checkout self-service do console", async () => {
    // renderToStaticMarkup codifica & como &amp; nos atributos href.
    const html = await renderWith()
    expect(html).toContain("/assinar?produto=combo&amp;tier=start")
    expect(html).toContain("/assinar?produto=combo&amp;tier=pro")
    expect(html).toContain("/assinar?produto=combo&amp;tier=scale")
  })
})
