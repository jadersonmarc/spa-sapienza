import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { Plans } from "./plans"
import { DEFAULT_HOME } from "@/lib/content/home-blocks"

// Texto visível (sem tags/atributos), p/ a guarda anti-preço não pegar svg/classes.
const visibleText = (html: string) => html.replace(/<[^>]*>/g, " ")

// Qualquer sinal de preço é proibido no site público.
const PRICE = /R\$|\bpre[çc]os?\b|\bvalor(es)?\b.*\d|\d+[.,]\d{3}|\/m[êe]s/i

describe("Plans (seção de planos)", () => {
  const html = renderToStaticMarkup(<Plans block={DEFAULT_HOME.portfolio} />)

  it("renderiza os 4 planos dos defaults", () => {
    for (const plan of DEFAULT_HOME.portfolio.items) {
      expect(html).toContain(plan.name)
    }
    expect(DEFAULT_HOME.portfolio.items).toHaveLength(4)
  })

  it("cada CTA aponta para o WhatsApp padrão", () => {
    const ctas = html.match(/href="https:\/\/wa\.me\/5521984185606/g) ?? []
    expect(ctas.length).toBe(DEFAULT_HOME.portfolio.items.length)
  })

  it("não renderiza nenhum preço", () => {
    expect(visibleText(html)).not.toMatch(PRICE)
  })
})

describe("DEFAULT_HOME.portfolio (dados dos planos)", () => {
  const { items } = DEFAULT_HOME.portfolio

  it("tem 4 planos, todos com CTA e itens", () => {
    expect(items).toHaveLength(4)
    for (const plan of items) {
      expect(plan.ctaLabel.trim()).not.toBe("")
      expect(plan.features.length).toBeGreaterThan(0)
    }
  })

  it("nenhum campo contém preço", () => {
    for (const plan of items) {
      const blob = [plan.name, plan.audience, ...plan.features].join(" ")
      expect(blob).not.toMatch(PRICE)
    }
  })

  it("marca o WhatsApp/CRM como add-on", () => {
    expect(items.filter((p) => p.addon)).toHaveLength(1)
  })
})
