// Tipos e defaults dos blocos da home — dados puros, sem dependência de banco,
// para poder ser importado por componentes e testes sem carregar o Drizzle.
// As queries (DB) ficam em ./pages.ts.

export type SectionHeader = { eyebrow?: string; title: string; subtitle: string }
export type HeroBlock = {
  badge: string
  titleLead: string
  titleHighlight: string
  subtitle: string
  ctaLabel: string
}
export type DiffBlock = {
  eyebrow: string
  titleLead: string
  titleHighlight: string
  subtitle: string
}

// Card de plano de serviço. Sem preço — valores são tratados em conversa privada.
export type PlanCard = {
  name: string // ex.: "Essencial — Presença digital com credibilidade"
  audience: string // texto do "Para:"
  features: string[] // itens do "Inclui:" / "O que faz:"
  ctaLabel: string // ex.: "Consultar valores"
  addon?: boolean // marca add-on (destaque petrol)
}
export type PlansBlock = SectionHeader & { items: PlanCard[] }

export type HomeBlocks = {
  hero: HeroBlock
  services: SectionHeader
  howItWorks: SectionHeader
  portfolio: PlansBlock
  trust: SectionHeader
  differentials: DiffBlock
}

// Fonte de verdade dos textos da home. Fallback enquanto a page não é publicada
// no admin — garante que o site nunca quebra.
export const DEFAULT_HOME: HomeBlocks = {
  hero: {
    badge: "Software sob medida · Baixada Fluminense",
    titleLead: "Seu negócio merece sistema feito para ele —",
    titleHighlight: "não template comprado de fora.",
    subtitle:
      "Desenvolvemos software sob medida para escritórios de advocacia, contabilidade e clínicas da Baixada Fluminense. Levantamento de requisitos conduzido por engenheiro, entrega com qualidade de produção.",
    ctaLabel: "Diagnóstico gratuito — 30 minutos",
  },
  services: {
    eyebrow: "O que fazemos",
    title: "Nossos Serviços",
    subtitle: "Soluções tecnológicas sob medida para impulsionar seu negócio",
  },
  howItWorks: {
    eyebrow: "Como funciona",
    title: "Da conversa inicial ao sistema em produção.",
    subtitle:
      "Um processo simples para transformar necessidade de negócio em software com escopo claro.",
  },
  portfolio: {
    eyebrow: "O que oferecemos",
    title: "Portfólio",
    subtitle: "Planos sob medida para tirar seu negócio do papel — escolha por onde começar.",
    items: [
      {
        name: "Essencial — Presença digital com credibilidade",
        audience: "Para quem precisa existir online com cara profissional.",
        features: [
          "Site institucional sob medida (home, sobre, contato)",
          "Responsivo no celular",
          "Otimizado para o Google",
          "Tema claro/escuro",
          "Botões de WhatsApp",
          "Painel para você mesmo editar os textos",
          "Hospedagem gerenciada",
        ],
        ctaLabel: "Consultar valores",
      },
      {
        name: "Profissional — Presença + máquina de conteúdo",
        audience: "Para quem quer aparecer no Google e ter marketing de conteúdo rodando sozinho.",
        features: [
          "Tudo do Essencial",
          "Blog completo",
          "SEO avançado",
          "Produção de artigos e posts automatizada por IA",
          "Publicação automática no Instagram e LinkedIn",
          "Análise de qualidade e SEO do conteúdo por IA",
        ],
        ctaLabel: "Consultar valores",
      },
      {
        name: "Premium — Presença + conteúdo + relacionamento",
        audience: "Para quem vive de captação e atendimento — advogados, contadores, clínicas.",
        features: [
          "Tudo do Profissional",
          "WhatsApp/CRM (central de atendimento, funil de leads, automações e sugestão de resposta por IA)",
          "Métricas de desempenho",
          "Suporte prioritário",
        ],
        ctaLabel: "Consultar valores",
      },
      {
        name: "Add-on — WhatsApp/CRM",
        audience:
          "Capta, organiza e responde os leads do seu WhatsApp num só lugar. Nenhum contato se perde.",
        features: [
          "Funil de vendas",
          "Automações de atendimento",
          "Sugestão de resposta por IA",
        ],
        ctaLabel: "Consultar valores",
        addon: true,
      },
    ],
  },
  trust: {
    eyebrow: "Confiança",
    title: "Engenharia com rosto, processo e responsabilidade.",
    subtitle:
      "A Sapienza Labs combina execução técnica com combinados claros para reduzir risco na contratação.",
  },
  differentials: {
    eyebrow: "Por que Sapienza Labs?",
    titleLead: "Porque não entregamos apenas código; entregamos",
    titleHighlight: "inteligência",
    subtitle:
      "Nossa abordagem vai além do desenvolvimento tradicional. Combinamos expertise técnica com visão estratégica de negócio.",
  },
}

// Mescla blocos salvos sobre os defaults (por seção) — campos ausentes caem no default.
export function mergeHome(saved: unknown): HomeBlocks {
  const s = (saved ?? {}) as Partial<HomeBlocks>
  return {
    hero: { ...DEFAULT_HOME.hero, ...(s.hero ?? {}) },
    services: { ...DEFAULT_HOME.services, ...(s.services ?? {}) },
    howItWorks: { ...DEFAULT_HOME.howItWorks, ...(s.howItWorks ?? {}) },
    portfolio: { ...DEFAULT_HOME.portfolio, ...(s.portfolio ?? {}) },
    trust: { ...DEFAULT_HOME.trust, ...(s.trust ?? {}) },
    differentials: { ...DEFAULT_HOME.differentials, ...(s.differentials ?? {}) },
  }
}
