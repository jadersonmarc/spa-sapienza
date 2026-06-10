# Roadmap de Refatoração — Sapienza Labs Site

## Contexto

Este documento orienta a análise e refatoração do repositório
`jadersonmarc/spa-sapienza` — site institucional da Sapienza Labs, atualmente
um experimento gerado via v0.dev e provisionado em VPS Hostinger via Coolify.

O objetivo não é uma reescrita completa. É um alinhamento estratégico:
conteúdo, identidade visual e estrutura de blog devem refletir o posicionamento
real da empresa — estúdio de software sob medida para PMEs da Baixada
Fluminense, com foco comercial imediato em clientes pagantes.

---

## Status de execução

Marcar cada spec ao concluir (ordem de execução sugerida ao final do documento):

- [x] SPEC-06 — Limpeza de assets e imports mortos
- [x] SPEC-01 — Logo real no Header
- [x] SPEC-05 — Acentuação em `/sobre`
- [x] SPEC-02 — Hero com posicionamento real
- [x] SPEC-03 — Serviços reais
- [x] SPEC-04 — Differentials com substância
- [x] SPEC-07 — Seção Portfólio na Home
- [x] SPEC-08 — Campos `pilar`/`coverImage` na interface Post
- [x] SPEC-09 — Badge de pilar no ArticleCard
- [x] SPEC-10 — Autor real nos posts
- [ ] SPEC-12 — Filtro por pilar no blog
- [ ] SPEC-11 — Criar `docs/BLOG_MIGRATION.md` (planejamento MDX)

---

## Estado atual — diagnóstico

### Identidade visual

- **Paleta experimental**: dark mode com `primary: oklch(0.65 0.25 265)` —
  azul/roxo neon. Não há decisão de marca formalizada. A paleta deve ser mantida
  como ponto de partida mas documentada como variável, não como definitiva.
- **Tipografia**: Geist + Geist Mono (Google Fonts). Adequada para estúdio
  técnico. Manter.
- **Logo**: dois arquivos relevantes em `/public`:
  - `logo-sapienza.png` (1.1 MB) — logo principal, **usar esta**
  - `icon.svg` — símbolo isolado com letras "SL" em formato geométrico
  - `icon-dark-32x32.png` / `icon-light-32x32.png` — variantes 32px
  - **Problema**: o Header renderiza "SL" como texto hardcoded em vez de usar
    o `icon.svg`. O `logo-sapienza.png` não é usado em nenhum componente.
  - `placeholder-logo.png`, `placeholder-logo.svg`, `placeholder-user.jpg`,
    `placeholder.jpg`, `placeholder.svg` — **assets orphans do v0.dev, remover**.

### Conteúdo e posicionamento

- **Hero**: copy genérica — "Transformamos complexidade técnica em ativos
  digitais de alto valor" — fala para ninguém específico. Não menciona PME,
  não menciona Baixada Fluminense, não ancora em dor concreta.
- **Serviços**: três cards com "Landing Pages", "E-commerce" e "Automação" —
  dissonância total com portfólio real (LexWatch, OracleTalk, sistemas sob
  medida). Nenhum dos serviços reflete o que a empresa de fato oferece.
- **Differentials**: seção "Por que Sapienza Labs?" com 3 badges genéricos
  (Inteligência de Dados, Compliance Fiscal, Arquitetura Escalável) sem
  substância. `FiscalMonitor` está comentado mas deixou traço no código.
- **Sobre (`/sobre`)**: conteúdo com caracteres sem acento ("Nao", "missao",
  "estudio") — encoding problem ou omissão de acentuação. Seção de impacto
  social menciona agronegócio/saúde pública/transparência cívica — correto para
  track institucional, mas fora do foco comercial imediato (PME). Manter como
  visão, mas não como pitch principal.
- **Footer**: email hardcoded `jadersonmarc@sapienzalabs.com.br` — verificar
  se é o endereço de contato oficial.

### Blog

- **Estrutura atual**: posts embutidos em `lib/posts.ts` como array de strings.
  Funciona para MVP mas não escala. Sem imagem de capa, sem categoria/pilar,
  sem autor real (usa "Sapienza Labs" como autor genérico).
- **5 posts existentes**: bom conteúdo SEO. Dois posts sobre Sapienza University
  (estratégia de SEO por associação de marca) + três posts sobre software para
  PME. Estrutura de conteúdo alinhada com Pilar 2.
- **Parsing de markdown**: implementado via regex manual em
  `app/blog/[slug]/page.tsx`. Funcional mas frágil — não suporta tabelas,
  blocos de código, imagens inline.
- **Sem paginação**: todos os posts renderizam na mesma página. Sem filtro por
  pilar/categoria.

### Assets e dependências

- `styles/globals.css` — arquivo duplicado com tema padrão shadcn (claro).
  Existe `app/globals.css` com o tema real (dark). Conflito de imports.
- `FiscalMonitor` — componente importado em `app/page.tsx` mas comentado.
  Gera import morto.
- `@vercel/analytics` — importado no layout mas site roda em VPS Hostinger,
  não Vercel. Analytics não vai capturar nada. Remover ou substituir.
- Tailwind 4 + shadcn/ui instalados. Stack correta, manter.

---

## Especificações de melhoria — prioridade alta

### SPEC-01: Substituir placeholder "SL" por logo real no Header

**Arquivo**: `components/header.tsx`

**Problema**: Logo area renderiza `<span>SL</span>` hardcoded.

**Solução**:

```tsx
// Antes
<span className="flex h-9 w-9 items-center justify-center rounded-full ...">
  SL
</span>

// Depois — usar icon.svg como Image para preservar tema claro/escuro
import Image from "next/image"

<div className="flex h-9 w-9 items-center justify-center">
  <Image
    src="/icon.svg"
    alt="Sapienza Labs"
    width={36}
    height={36}
    priority
  />
</div>
```

O `icon.svg` já usa `@media (prefers-color-scheme)` internamente — vai
adaptar automaticamente. Testar em light mode (forçar via devtools) e dark mode.

---

### SPEC-02: Atualizar Hero para posicionamento real

**Arquivo**: `components/hero.tsx`

**Copy atual** (genérica, desalinhada):

```
"Transformamos complexidade técnica em ativos digitais de alto valor."
"Especialistas em desenvolvimento de software, automações inteligentes e
soluções RegTech sob medida."
```

**Copy nova** (ancorada em dor + público + diferencial):

```tsx
// Badge
"Software sob medida · Baixada Fluminense"

// H1
"Seu negócio merece sistema feito para ele —{" "}
<span className="text-primary glow-text">não template comprado de fora.</span>"

// Subtítulo
"Desenvolvemos software sob medida para escritórios de advocacia, 
contabilidade e clínicas da Baixada Fluminense. Levantamento de 
requisitos conduzido por engenheiro, entrega com qualidade de produção."

// CTA primário
"Diagnóstico gratuito — 30 minutos"
// href: "https://wa.me/5521986537054?text=Olá! Quero agendar um diagnóstico gratuito de 30 minutos."
```

**Remover**: segundo blur circle de fundo (deixar apenas um — simplifica visual).

---

### SPEC-03: Reescrever seção de Serviços com oferta real

**Arquivo**: `components/services.tsx`

**Problema**: "Landing Pages", "E-commerce", "Automação via Chatbot" não
refletem o portfólio real. Confunde visitante e gera desconfiança se ele
pesquisar os projetos da empresa.

**Serviços reais a comunicar**:

```ts
const services = [
  {
    icon: Scale, // lucide-react
    title: "Automação para Escritórios Jurídicos",
    description:
      "Monitoramento automático de processos (PJe, e-SAJ, Projudi), " +
      "onboarding de cliente via WhatsApp e alertas de prazo. " +
      "Devolve horas faturáveis toda semana.",
  },
  {
    icon: Bot,
    title: "Integração e Automação de Fluxos",
    description:
      "Conectamos seus sistemas atuais e eliminamos a digitação duplicada. " +
      "WhatsApp, ERP, planilha e sistema fiscal conversando de forma automática.",
  },
  {
    icon: Layers,
    title: "Sistema de Gestão Sob Medida",
    description:
      "Para quando SaaS genérico não cabe na sua operação. " +
      "Desenvolvemos o sistema exato que sua empresa precisa — " +
      "com escopo fechado, prazo definido e suporte incluso.",
  },
]
```

Importar `Scale` e `Layers` de `lucide-react` (já disponíveis no projeto).

---

### SPEC-04: Reescrever seção Differentials com substância

**Arquivo**: `components/differentials.tsx`

**Problema**: três badges genéricos sem conteúdo de apoio.

**Substituir por estrutura de 3 diferenciais reais**:

```tsx
const features = [
  {
    icon: ClipboardCheck, // lucide
    label: "Requisitos antes de código",
    description:
      "Todo projeto começa com diagnóstico da operação real — não com formulário.",
  },
  {
    icon: Wrench, // lucide
    label: "Stack escolhida pelo problema",
    description:
      "Go, Rust, PostgreSQL — tecnologia pela necessidade, não pela moda.",
  },
  {
    icon: ShieldCheck, // lucide
    label: "Entrega de produção desde o MVP",
    description:
      "Sem retrabalho disfarçado de v2. O que entregamos funciona na vida real.",
  },
]
```

Layout: transformar de `flex-wrap` de badges para grid 3 colunas com card
leve (sem glass pesado — usar `bg-secondary/30 border border-border/40`).

---

### SPEC-05: Corrigir acentuação em `/sobre`

**Arquivo**: `app/sobre/page.tsx`

**Problema**: texto sem acentos em múltiplos lugares — "Nao trabalhamos",
"missao", "estudio", "Conheca", "adicoes", etc. Encoding issue ou gerado sem
acentos propositalmente.

**Ação**: varredura completa do arquivo e correção de todos os termos sem
acento. Não alterar estrutura ou copy — apenas normalizar acentuação.

Termos a corrigir (lista parcial):
- `Nao` → `Não`
- `missao` → `missão`
- `estudio` → `estúdio`
- `Conheca` → `Conheça`
- `tecnologica` → `tecnológica`
- `propria` → `própria`
- `tenue` → `tênue`
- `publicoes` → `publicações`
- Varrer o arquivo completo — há mais ocorrências.

---

### SPEC-06: Limpeza de assets e imports mortos

**Arquivos afetados**: `app/page.tsx`, `app/layout.tsx`, `public/`

**Ações**:

1. `app/page.tsx`: remover import de `FiscalMonitor` (componente comentado):
   ```diff
   - import { FiscalMonitor } from "@/components/fiscal-monitor"
   ```

2. `app/layout.tsx`: remover `@vercel/analytics` — site não está em Vercel:
   ```diff
   - import { Analytics } from '@vercel/analytics/next'
   - {process.env.NODE_ENV === 'production' && <Analytics />}
   ```

3. `public/` — remover assets orphans do v0.dev:
   - `placeholder-logo.png`
   - `placeholder-logo.svg`
   - `placeholder-user.jpg`
   - `placeholder.jpg`
   - `placeholder.svg`
   
   **Antes de remover**: verificar com `grep -r "placeholder" app/ components/ lib/`
   para confirmar que nenhum componente referencia esses arquivos.

4. `styles/globals.css` — arquivo duplicado com tema shadcn padrão (claro).
   Verificar se é importado em algum lugar. Se não, remover. O tema real está
   em `app/globals.css`.

---

### SPEC-07: Adicionar seção Portfólio na Home

**Arquivo novo**: `components/portfolio.tsx`
**Integração**: `app/page.tsx`

Criar seção entre `<Services />` e `<Differentials />` exibindo os projetos
com tração comercial do portfólio real.

**Projetos a exibir**:

```ts
const projects = [
  {
    name: "LexWatch",
    tag: "Em desenvolvimento",
    tagColor: "blue",
    sector: "Jurídico",
    description:
      "Monitoramento de processos por simulação comportamental em PJe, " +
      "e-SAJ e Projudi. Alerta automático, sem scraping frágil.",
    stack: ["Go", "Redis Streams", "PostgreSQL", "chromedp"],
  },
  {
    name: "OracleTalk",
    tag: "Roadmap",
    tagColor: "yellow",
    sector: "Gestão de Conhecimento",
    description:
      "Consulta de bibliotecas documentais via linguagem natural e áudio " +
      "do WhatsApp. RAG com PostgreSQL + pgvector.",
    stack: ["Go", "PostgreSQL", "pgvector", "Redis"],
  },
  {
    name: "Sapienza OncoCare",
    tag: "Submetido ao Hackathon SUS",
    tagColor: "purple",
    sector: "Saúde Pública",
    description:
      "Triagem clínica point-of-care para monitoramento de toxicidade em " +
      "quimioterapia no SUS. Offline-first, criptografia local.",
    stack: ["Go", "Rust", "Flutter", "XGBoost"],
  },
]
```

**Design**: cards com borda lateral colorida por setor. Stack como badges
pequenos. Sem imagem — o card se sustenta no texto.

---

## Especificações de melhoria — blog

### SPEC-08: Adicionar campo `pilar` e `categoria` ao Post

**Arquivo**: `lib/posts.ts`

**Problema**: posts não têm categorização por pilar de conteúdo. Sem isso,
não é possível filtrar ou sinalizar visualmente o tipo de conteúdo.

**Extensão da interface**:

```ts
export type Pilar =
  | "engenharia-ia"       // Pilar 1 — Engenharia + IA
  | "negocio-pme"         // Pilar 2 — Negócio/PME
  | "bastidores"          // Pilar 3 — Bastidores

export interface Post {
  title: string
  slug: string
  excerpt: string
  content: string
  date: string
  readingTime: string
  pilar: Pilar             // NOVO
  coverImage?: string      // NOVO — opcional, path relativo a /public
  author: {
    name: string
    avatarUrl?: string     // NOVO — opcional
    role: string
  }
  keywords: string[]
}
```

**Atribuir pilar aos posts existentes**:

| slug | pilar |
|---|---|
| `software-personalizado-vs-sistema-pronto` | `negocio-pme` |
| `automacao-de-processos-pequenas-empresas` | `negocio-pme` |
| `o-que-e-uma-api-integracao-de-sistemas` | `negocio-pme` |
| `sapienza-university-famosa-inovacao-tecnologia` | `negocio-pme` |
| `cursos-sapienza-university-qualidade-produtos-digitais` | `negocio-pme` |

---

### SPEC-09: Adicionar label de pilar no ArticleCard

**Arquivo**: `components/article-card.tsx`

Adicionar badge de pilar no card do blog com cor e label correspondente:

```tsx
const pilarConfig: Record<Pilar, { label: string; color: string }> = {
  "engenharia-ia":  { label: "Engenharia + IA",    color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  "negocio-pme":    { label: "Negócio / PME",      color: "bg-green-500/15 text-green-400 border-green-500/20" },
  "bastidores":     { label: "Bastidores",         color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
}
```

Badge fica acima do título no card. Tamanho `text-[10px] uppercase tracking-wider`.

---

### SPEC-10: Substituir autor genérico pelo autor real

**Arquivo**: `lib/posts.ts`

**Problema**: todos os posts têm `author.name: "Sapienza Labs"` — impessoal,
perde autenticidade.

**Substituição**:

```ts
author: {
  name: "Marc Jaderson",
  role: "Fundador, Sapienza Labs",
  avatarUrl: "/marc.png",  // imagem já existe em /public
},
```

No template de post (`app/blog/[slug]/page.tsx`), na seção de autor, usar
`Image` com `src={post.author.avatarUrl}` quando disponível, com fallback
para o monograma "SL".

---

### SPEC-11: Estrutura de blog escalável — migração para MDX (planejamento)

**Observação**: esta spec é de planejamento, não de execução imediata.
O Claude Code deve criar o arquivo `docs/BLOG_MIGRATION.md` descrevendo
a arquitetura target.

**Problema atual**: posts como array de strings em `lib/posts.ts` não escala.
A cada post novo, o arquivo cresce e o build time aumenta. Sem suporte a
imagens inline, tabelas, blocos de código com syntax highlight.

**Arquitetura target**:

```
/content/
  blog/
    negocio-pme/
      software-personalizado-vs-sistema-pronto.mdx
      automacao-de-processos-pequenas-empresas.mdx
    engenharia-ia/
      spec-driven-development-na-pratica.mdx
    bastidores/
      por-que-escolhi-pme-da-baixada.mdx
```

**Stack para migração**:
- `next-mdx-remote` ou `contentlayer` para parsing
- `rehype-highlight` para syntax highlight de código
- `remark-gfm` para tabelas e GFM extras
- Frontmatter YAML substituindo os campos da interface `Post`

**Preservar**: URLs existentes (`/blog/[slug]`) para não quebrar SEO.
`generateStaticParams` vai varrer `/content/blog/**/*.mdx`.

**Quando migrar**: após primeiros 3 clientes pagantes — prioridade agora é
conteúdo, não infraestrutura de blog.

---

### SPEC-12: Página de blog com filtro por pilar

**Arquivo**: `app/blog/page.tsx`

Adicionar filtro por pilar acima do grid de posts. Funciona como tabs ou
botões de filtro client-side (sem recarregamento de página).

```tsx
// Client component — extrair para components/blog-filter.tsx
"use client"
const [activeFilter, setActiveFilter] = useState<Pilar | "todos">("todos")
const filtered = activeFilter === "todos"
  ? posts
  : posts.filter(p => p.pilar === activeFilter)
```

**Opções de filtro**:
- Todos
- Negócio / PME (verde)
- Engenharia + IA (azul)
- Bastidores (laranja)

---

## Ordem de execução sugerida

Execute as specs nesta ordem — cada uma é independente mas esta sequência
minimiza conflito e maximiza impacto visual rápido:

1. **SPEC-06** — Limpeza (remove ruído antes de qualquer mudança)
2. **SPEC-01** — Logo no header (impacto visual imediato, baixo risco)
3. **SPEC-05** — Acentuação em /sobre (zero risco, correção pura)
4. **SPEC-02** — Hero copy (alto impacto comercial)
5. **SPEC-03** — Serviços reais (alto impacto comercial)
6. **SPEC-04** — Differentials com substância
7. **SPEC-07** — Seção Portfólio na home
8. **SPEC-08** — Extensão interface Post
9. **SPEC-09** — Badge de pilar no ArticleCard
10. **SPEC-10** — Autor real nos posts
11. **SPEC-12** — Filtro de pilar na página de blog
12. **SPEC-11** — Criar `docs/BLOG_MIGRATION.md` (planejamento futuro)

---

## Restrições

- **Não usar imagens externas** ou de stock. Apenas assets em `/public`.
- **Imagens de logo permitidas**: `logo-sapienza.png`, `icon.svg`,
  `icon-dark-32x32.png`, `icon-light-32x32.png`. Não criar novos assets —
  usar o que existe.
- **Não alterar stack**: Next.js 15+ App Router, Tailwind 4, shadcn/ui.
  Manter `pnpm` como gerenciador.
- **Não quebrar rotas existentes**: `/`, `/sobre`, `/blog`, `/blog/[slug]`.
- **Não alterar estrutura de glassmorphism** do header — está bem resolvida.
- **Manter dark mode permanente**: não adicionar toggle de tema.

---

## Verificação pós-implementação

Após executar todas as specs, verificar:

```bash
# Build limpo
pnpm build

# Checagem de links internos (não quebrar slug do blog)
pnpm lint

# Verificar referências a placeholder removidos
grep -r "placeholder" app/ components/ lib/ public/

# Verificar referências a FiscalMonitor
grep -r "FiscalMonitor" app/ components/

# Verificar referências a Vercel Analytics
grep -r "vercel/analytics" app/
```

Se `pnpm build` passar sem erro, as specs foram implementadas corretamente.
