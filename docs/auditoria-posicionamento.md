# Auditoria de posicionamento — Sapienza Labs

> **Fase 1** do reposicionamento "de presença digital a estúdio de engenharia".
> Este documento inventaria como o site se descreve hoje, classifica cada
> ocorrência e propõe a arquitetura de informação alvo. **Nada é implementado
> aqui** — a implementação (Fase 2) só começa após aprovação desta auditoria.
>
> Data: 2026-07-13 · Base: `origin/main` (`c4d611e`).

---

## 1. Diagnóstico em uma frase

O site **comunica** a Sapienza como fornecedora de **presença digital** (site +
WhatsApp). Não é um erro de texto: é a inferência correta a partir do que o site
**mostra**. A Sapienza é um estúdio de **engenharia de software** (ERP, CRM,
mobile, SaaS, distribuídos, embarcados, Web3). A vitrine é a porta de entrada,
não o teto.

**Achado central:** a *copy* já foi majoritariamente reposicionada numa rodada
anterior — hero, serviços, diferenciais, confiança, `/sobre`, metadata e JSON-LD
já falam a língua da engenharia. O que ainda sustenta a percepção de "agência de
sites" é, sobretudo:

1. **Os 4 planos da seção "Portfólio"** (`lib/content/home-blocks.ts`), escritos
   como *"Presença digital"* / *"máquina de conteúdo"* — **PRESENÇA-ONLY**.
2. **A ausência de prova de engenharia** — não há projetos reais no site, nem
   escada de capacidade, nem rota `/engenharia`. Adjetivo não convence; artefato
   convence.

> Corolário: reescrever só o hero **não** resolve. É preciso adicionar a
> arquitetura de conteúdo que **demonstra** profundidade (escada + projetos) e
> **rebaixar** a vitrine para depois da prova.

---

## 2. Inventário de copy de posicionamento

Classificação: **PRESENÇA-ONLY** (reforça a percepção errada) / **NEUTRO** /
**ENGENHARIA** (já correto).

### 2.1 PRESENÇA-ONLY — o que precisa mudar

| Local | Texto atual | Ação |
|---|---|---|
| `lib/content/home-blocks.ts` → `portfolio.items[0].name` | **"Essencial — Presença digital com credibilidade"** | Reescrever: enquadrar como **Degrau 01 · porta de entrada**, sem "presença digital" como identidade. |
| idem `items[0].audience` | "Para quem precisa existir online com cara profissional." | Reescrever no mesmo enquadramento. |
| idem `items[1].name` | **"Profissional — Presença + máquina de conteúdo"** | Reescrever: remover "Presença + máquina de conteúdo". |
| idem `items[2].name` | **"Premium — Presença + conteúdo + relacionamento"** | Reescrever: remover "Presença +". |
| idem `items[3].name` | "Add-on — WhatsApp/CRM" | Mantém sentido (ferramenta operacional); ajustar rótulo se necessário. |
| `portfolio.eyebrow` / `title` / `subtitle` | "O que oferecemos" / "Portfólio" / "Planos sob medida para tirar seu negócio do papel…" | Ajustar eyebrow/subtítulo para "**Vitrine Sapienza — a porta de entrada**". |

> Observação: os *features* dos planos (blog, SEO, Instagram/LinkedIn, WhatsApp/CRM)
> descrevem produtos reais e podem permanecer — o problema é o **enquadramento de
> topo** (nome + público), que define a categoria da empresa.

### 2.2 ENGENHARIA — já correto, **preservar**

| Local | Texto atual |
|---|---|
| `app/layout.tsx` (`SITE_TITLE`) | "Sapienza Labs \| Product Studio de Inteligência Tecnológica" |
| `app/layout.tsx` (`SITE_DESCRIPTION` / OG) | "Especialistas em desenvolvimento de software, automações inteligentes e soluções RegTech sob medida. Transformamos complexidade técnica em ativos digitais de alto valor." |
| `lib/content/home-blocks.ts` → `hero` | "Seu negócio merece sistema feito para ele — não template comprado de fora." (**será substituído pelo H1 novo — ver §5**) |
| `components/services.tsx` | Automação jurídica (PJe/e-SAJ/Projudi), integração de fluxos, sistema de gestão sob medida. |
| `components/differentials.tsx` | "Requisitos antes de código", "Stack escolhida pelo problema — Go, Rust, PostgreSQL", "Entrega de produção desde o MVP". |
| `components/trust.tsx` | "Engenharia com rosto, processo e responsabilidade." + fundador/engenheiro. |
| `components/how-it-works.tsx` | Diagnóstico → Escopo fechado → Entregas acompanhadas → Suporte. |
| `app/sobre/page.tsx` | Estúdio de software, fundador (Go/Rust), P&D, impacto (agro/SUS/cívico), JSON-LD `Organization`. |
| `app/contato/page.tsx` | "Vamos transformar sua operação em software." + JSON-LD `Organization`. |
| `app/blog/page.tsx` | Eyebrow "Diário de engenharia" + description de desenvolvimento/automação. |

### 2.3 NEUTRO — aceitável, sem ação

Eyebrows e labels de seção ("O que fazemos", "Como funciona", "Confiança"),
CTAs do `header.tsx` ("Solicitar proposta"), `whatsapp-button.tsx`
("Fale conosco!"), títulos de `/campanhas`.

---

## 3. Mapa de rotas e componentes

### 3.1 Rotas públicas atuais

| Rota | Arquivo | Papel |
|---|---|---|
| `/` | `app/page.tsx` | Home — composição: Hero → Services → HowItWorks → **Plans** → Trust → Differentials |
| `/sobre` | `app/sobre/page.tsx` | Institucional (já ENGENHARIA) |
| `/contato` | `app/contato/page.tsx` | Contato (já ENGENHARIA) |
| `/blog`, `/blog/[slug]` | `app/blog/*` | Editorial |
| `/campanhas`, `/campanhas/[slug]` | `app/campanhas/*` | Avulsas |

**A nascer:** `/engenharia`, `/projetos`, `/projetos/[slug]`.

### 3.2 Componentes da home

| Componente | Reaproveitável? | Nota |
|---|---|---|
| `hero.tsx` | Parcial | Recebe H1/subtítulo/CTAs novos (§5). |
| `services.tsx` | **Sim** | Grid de 3 cards genérico. |
| `plans.tsx` | **Sim** | Renderiza `portfolio` — reusar como está; muda só o dado. |
| `how-it-works.tsx` | **Sim** | Já é "como trabalhamos". |
| `trust.tsx` | Parcial | Bloco de garantias + card do fundador. |
| `differentials.tsx` | **Sim** | Já ENGENHARIA. |
| `eyebrow.tsx` / `tag.tsx` | **Sim** | Assinatura mono — usar nas seções novas. |

**A nascer:** `capability-ladder.tsx` (escada de 4 degraus) e
`engineering-proof.tsx` (grid de projetos reais). Constante de dados da escada em
`lib/content/degraus.ts`.

**UI disponível** (`components/ui/`): `button`, `card`, `breadcrumb` + `tag`,
`eyebrow`. Não há Badge/Tabs/Dialog — não são necessários para as seções novas.

---

## 4. Tokens do design system (confirmados)

Fonte de verdade: `lib/brand/tokens.ts` (espelhada por `app/globals.css`, com
`tokens.test.ts` falhando se divergir).

| Token | Hex | Papel |
|---|---|---|
| `ink` | `#0E1116` | Campo escuro (autoridade) |
| `surface` | `#F7F8FA` | Campo claro (clareza) |
| `petrol` | `#0E6E73` | **Único acento** (light) |
| `petrolSoft` | `#3A9BA0` | Acento (dark) |
| `line` / `lineDark` | `#D7DCE2` / `#222833` | Bordas |
| `signal` | `#C9683A` | Só alerta/destaque pontual |

Fontes: **Bricolage Grotesque** (display) · **IBM Plex Sans** (corpo) ·
**IBM Plex Mono** (assinatura: números, eyebrows, stacks).

> **Regra dura (decisão travada):** campo ink/surface + **um** acento petrol,
> **sem gradiente**, **sem índigo**, **sem árvore fractal** (o asset não existe no
> repo). As menções a índigo/gradiente/fractal do briefing original ficam
> **descartadas** — violam `no-literal-color.test.ts`, `tokens.test.ts` e as
> regras do `CLAUDE.md`. O **Degrau 04 "Fronteira"** ganha destaque por **peso
> tipográfico, mono e borda**, não por cor nova.

---

## 5. Copy do hero (decisão travada)

Substituir o hero atual pelo H1 do briefing:

- **H1:** "Software sob medida, feito por quem constrói o difícil."
- **Subtítulo:** "Da vitrine que traz o cliente ao sistema distribuído que
  sustenta a operação."
- **CTA primário:** "Agendar diagnóstico (sem custo)".
- **CTA secundário:** "Ver o que construímos" → âncora `#provas`.

Sem árvore fractal / índigo. Afeta `lib/content/home-blocks.ts` (`hero`) e o
mapeamento de campos em `components/hero.tsx` (hoje `titleLead`+`titleHighlight`).

---

## 6. Modelo de dados

**Não existe** entidade de projetos hoje. Os "planos" vivem como `PlanCard[]` no
bloco `portfolio` de `lib/content/home-blocks.ts` — não servem para estudos de
caso de engenharia.

**Proposta — nova tabela `projects`** (Drizzle, `lib/db/schema.ts`), seguindo as
convenções do schema (uuid PK, `jsonb` para arrays, timestamps `withTimezone`,
índices):

```
projects
  id            uuid PK
  slug          text unique
  nome          text
  resumo        text            -- 1 frase de problema (linguagem de negócio)
  problema      text
  stack         jsonb string[]  -- ex.: ["Go","Rust","gRPC","Ed25519"]
  degrau        enum(presenca|operacao|plataforma|fronteira)
  destaque      bool
  ordem         int
  publicado     bool
  authorId      uuid fk users (nullable)
  -- estudo de caso (opcionais):
  arquitetura   text
  decisoes      text
  resultado     text
  coverImageUrl text            -- biblioteca de mídia
  criadoEm / atualizadoEm  timestamptz
```

- **Migration:** `pnpm db:generate` → `pnpm db:push` (o projeto usa `db:push`,
  **não** `db:migrate`).
- **Queries** (`lib/content/projects.ts`, padrão de `lib/blog.ts`):
  `getPublishedProjects()`, `getProjectBySlug()`, `getProjectsByDegrau()` +
  admin (`listProjectsForAdmin`, `getProjectForAdmin`, `projectSlugExists`).
- **Editável no admin** (`/admin/projects`) e **semeável** via
  `scripts/seed-projects.mjs`.

**Seed inicial (4 projetos autorais / P&D — sem inventar cliente ou métrica):**

| Projeto | Problema | Stack | Degrau |
|---|---|---|---|
| **NexusAgro RJ** | Rastreabilidade alimentar soberana | Go · Rust · gRPC · Ed25519 · Merkle Tree · BadgerDB | `fronteira` |
| **LexWatch** | Monitor de plataformas judiciais (PJe, e-SAJ, Projudi) | Go · chromedp · Redis Streams · PostgreSQL | `operacao` |
| **Margot** | Atendente WhatsApp com RAG, motor próprio | Go · RAG · WhatsApp Cloud API | `plataforma` |
| **Sapienza OncoCare** | Triagem oncológica para o SUS, inferência on-device | Go · Rust · Flutter · ONNX · XGBoost | `fronteira` |

---

## 7. Arquitetura de informação alvo

### 7.1 Home (`/`) — nova ordem (tese acima da dobra; **prova antes dos planos**)

| # | Seção | Origem | Mudança |
|---|---|---|---|
| 1 | **Hero** (a tese) | `hero.tsx` | H1/subtítulo/CTAs novos (§5) |
| 2 | **Escada de capacidade** | **novo** `capability-ladder.tsx` | 4 degraus; Degrau 04 em destaque; linka `/engenharia#degrau-N` |
| 3 | **Prova de engenharia** (`#provas`) | **novo** `engineering-proof.tsx` | Cards dos projetos reais, stack em mono, link `/projetos/[slug]` |
| 4 | **Como trabalhamos** | `how-it-works.tsx` | Reusar |
| 5 | **Serviços** | `services.tsx` | Reusar (detalha capacidades) |
| 6 | **Vitrine Sapienza (planos)** | `plans.tsx` + dados reescritos | **Rebaixada** para depois da prova; reenquadrada como Degrau 01 |
| 7 | **Confiança** | `trust.tsx` | Reusar |
| 8 | **Diferenciais** | `differentials.tsx` | Reusar |
| 9 | **CTA final** | bloco simples | "Qual é o problema que a sua empresa ainda resolve na mão?" |

**Removido/rebaixado:** os planos deixam de ser a 4ª seção (logo após serviços) e
passam para **depois** da prova de engenharia — deixam de **definir** a empresa,
continuam sendo a porta de entrada que mais vende.

### 7.2 Escada de capacidade (a seção-assinatura)

| # | Degrau | Promessa ao cliente | Itens |
|---|---|---|---|
| 01 | **Presença** | Você é encontrado e respondido | Vitrine, Margot (atendente WhatsApp), SEO local |
| 02 | **Operação** | Sua empresa para de rodar em planilha | ERP sob medida, CRM, automação, integrações |
| 03 | **Plataforma** | Quando o sistema vira o negócio | Apps mobile, portais/área do cliente, SaaS |
| 04 | **Fronteira** | O que quase ninguém aqui constrói | Distribuídos, embarcados, criptografia aplicada, Web3 |

### 7.3 Nova rota `/engenharia`

Página de profundidade técnica — um bloco por degrau (`#degrau-1 … #degrau-4`),
cada um com capacidades, "quando faz sentido" e os projetos que **provam** aquele
degrau (`getProjectsByDegrau()`). É a página que se manda ao lead que pergunta
"vocês fazem site, né?".

### 7.4 Rotas `/projetos/[slug]`

Estudo de caso por projeto: problema → arquitetura → decisões → resultado
(campos do schema). Padrão de `/blog/[slug]` (`generateMetadata` +
`generateStaticParams`). Sem inventar cliente/métrica.

### 7.5 SEO / JSON-LD

Preservar o que já é ENGENHARIA; ampliar description/keywords onde genérico,
**mantendo a geografia** (Duque de Caxias / Baixada Fluminense). Adicionar
JSON-LD **Organization + Service** com os 4 degraus.

---

## 8. Critérios de aceite (para a Fase 2)

- [ ] Nenhuma copy PRESENÇA-ONLY sobrevive na home ou no `<head>`.
- [ ] Escada **e** prova de engenharia na home, com a prova **antes** dos planos.
- [ ] `/engenharia` existe, com âncora funcional para os 4 degraus.
- [ ] Os 4 projetos vêm do **banco** (não JSX) e aparecem no admin.
- [ ] `pnpm build` + `lint` + `test` passam. Zero hex arbitrário em componente.
- [ ] Nenhuma métrica, cliente ou depoimento inventado.

---

## 9. ⏸ Ponto de parada

**Esta é a Fase 1.** Aguardando aprovação desta auditoria antes de iniciar a
Fase 2 (implementação), conforme o plano em
`~/.claude/plans/claude-code-reposicionamento-jaunty-rivest.md`.
