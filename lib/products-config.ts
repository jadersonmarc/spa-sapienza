import type { ProdutoId } from "@/lib/pricing"

// Estratégia de transparência da seção de produtos por assinatura.
// - hibrido (default): VALOR exposto (tiers/inclusos), NEGÓCIO conversado. Esconde
//   setup, portas de pagamento, Degrau 13, combo e excedente — isso é conversa pessoal.
// - sob_consulta: nem os valores mensais aparecem (só inclusos + CTA).
// - total: mostra também o bloco comercial — SÓ funciona com o JSON gerado --full.
// Override em runtime por NEXT_PUBLIC_TRANSPARENCIA (útil pra teste/preview).

export type Transparencia = "hibrido" | "total" | "sob_consulta"

function readTransparencia(): Transparencia {
  const raw = process.env.NEXT_PUBLIC_TRANSPARENCIA
  if (raw === "total" || raw === "sob_consulta" || raw === "hibrido") return raw
  return "hibrido"
}

export const TRANSPARENCIA: Transparencia = readTransparencia()

// Seção do Combo (assine Margot + Motor juntos, COM preço e assinatura self-service).
// Ligada por padrão; desligável por env em preview/teste.
export const MOSTRAR_COMBO: boolean =
  process.env.NEXT_PUBLIC_MOSTRAR_COMBO !== "false"

// Copy da seção de combos.
export const COMBO_COPY = {
  eyebrow: "Sistema Sapienza",
  titulo: "Combo: os dois trabalhando juntos, por menos",
  promessa:
    "Um atendimento que responde e um conteúdo que atrai — assine Margot Atendente e Margot Editora juntos e economize todo mês.",
} as const

// Copy editorial por produto. `promessa`/`entrada`/`resolve` ancoram valor na home
// e nos tiers; `oQueE`/`paraQuem`/`comoFunciona` alimentam a página de detalhe
// (/margot/atendente, /margot/editora) — sem revelar o negócio (preço/setup).
export const PRODUTO_COPY: Record<
  ProdutoId,
  {
    promessa: string
    entrada: string
    resolve: string
    oQueE: string
    paraQuem: string
    comoFunciona: string[]
  }
> = {
  margot: {
    promessa: "Atende seu WhatsApp 24h e não deixa lead esfriar durante a noite.",
    entrada: "Para quem está começando a não perder mensagem.",
    resolve: "O plano que dá conta do movimento de verdade.",
    oQueE:
      "A Margot Atendente é uma agente de IA que cuida do WhatsApp da sua empresa 24 horas por dia. Ela responde na hora, entende o contexto da conversa e só chama uma pessoa quando realmente precisa.",
    paraQuem:
      "Para quem vive de captação e atendimento — advocacia, contabilidade, clínicas — e não pode deixar mensagem sem resposta, nem de madrugada.",
    comoFunciona: [
      "Você conecta o número de WhatsApp da empresa e descreve, em linguagem simples, como a agente deve falar.",
      "A Margot responde os clientes na hora, qualifica o lead e organiza tudo num funil.",
      "Quando a conversa precisa de você, ela passa o bastão — com o histórico pronto.",
      "Você acompanha as métricas e ajusta o tom quando quiser.",
    ],
  },
  motor: {
    promessa: "Conteúdo publicado toda semana, no seu tom — sem você escrever.",
    entrada: "Para manter presença constante em um canal.",
    resolve: "O plano que sustenta a presença em mais canais.",
    oQueE:
      "A Margot Editora cria e publica o conteúdo da sua marca automaticamente — artigos, posts e peças em movimento — no seu tom, sem você precisar escrever.",
    paraQuem:
      "Para quem precisa manter presença constante em blog e redes sociais, mas não tem tempo (nem equipe) para produzir conteúdo toda semana.",
    comoFunciona: [
      "Você define o tom, os temas e conecta seus canais (blog, Instagram, LinkedIn).",
      "A Margot gera as peças no seu tom — texto e imagem on-brand — e deixa para você aprovar.",
      "Aprovou (ou deixou passar a janela), ela publica sozinha nos canais certos.",
      "Você vê o desempenho de cada peça e ajusta a rota.",
    ],
  },
}

// Enquadramento por tier (sem números): Start = porta de entrada; Pro = o que resolve.
export const TIER_ENQUADRAMENTO: Record<string, string> = {
  start: "entrada",
  pro: "resolve",
}

// O tier destacado como "mais escolhido".
export const TIER_DESTAQUE = "pro"
