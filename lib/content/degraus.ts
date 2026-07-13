// Escada de capacidade — dados puros (sem dependência de banco). Estende os
// pilares editoriais: descreve os quatro degraus de atuação da Sapienza, da
// porta de entrada (Presença) à fronteira técnica. Consumido pela home
// (capability-ladder.tsx) e pela rota /engenharia. A chave casa com o enum
// `degrau` do banco (lib/db/schema.ts) e com `Degrau` em ./projects.

export type DegrauKey = "presenca" | "operacao" | "plataforma" | "fronteira"

export type Degrau = {
  key: DegrauKey
  numero: string // "01".."04" (assinatura mono)
  anchor: string // /engenharia#degrau-N
  nome: string
  promessa: string // promessa ao cliente
  itens: string[]
  // Contexto extra para /engenharia.
  quando: string // "quando faz sentido"
}

export const DEGRAUS: Degrau[] = [
  {
    key: "presenca",
    numero: "01",
    anchor: "degrau-1",
    nome: "Presença",
    promessa: "Você é encontrado e respondido.",
    itens: ["Vitrine digital", "Margot (atendente WhatsApp)", "SEO local"],
    quando:
      "Quando o cliente já procura por você, mas não te acha — ou acha e não é respondido a tempo.",
  },
  {
    key: "operacao",
    numero: "02",
    anchor: "degrau-2",
    nome: "Operação",
    promessa: "Sua empresa para de rodar em planilha.",
    itens: ["ERP sob medida", "CRM", "Automação de fluxos", "Integrações"],
    quando:
      "Quando o processo cresceu além da planilha e do sistema pronto, e o retrabalho manual virou gargalo.",
  },
  {
    key: "plataforma",
    numero: "03",
    anchor: "degrau-3",
    nome: "Plataforma",
    promessa: "Quando o sistema vira o negócio.",
    itens: ["Apps mobile", "Portais / área do cliente", "Produtos SaaS"],
    quando:
      "Quando o software deixa de apoiar a operação e passa a ser o produto que você entrega ao mercado.",
  },
  {
    key: "fronteira",
    numero: "04",
    anchor: "degrau-4",
    nome: "Fronteira",
    promessa: "O que quase ninguém aqui constrói.",
    itens: ["Sistemas distribuídos", "Embarcados", "Criptografia aplicada", "Web3"],
    quando:
      "Quando o problema exige garantia de integridade, resiliência ou desempenho que fogem do trivial.",
  },
]
