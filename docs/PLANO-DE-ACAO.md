# Plano de Ação — Backlog das Auditorias (SPEC-13 a SPEC-30)

> Consolida os backlogs de `analises/UX-2026-06-10.md` (SPEC-13..18),
> `analises/BRANDING-2026-06-10.md` (SPEC-19..25) e
> `analises/DESIGN-2026-06-10.md` (SPEC-26..30) em fases de execução.
> Cada fase fecha com `pnpm lint && pnpm build` limpos, commits por spec e
> push na `main` (deploy via Coolify pelo fundador).

## Princípios de ordenação

1. **Estancar perda antes de melhorar**: links quebrados e mensagens erradas
   ao Google saem na frente de qualquer estética.
2. **Quick wins agrupados por arquivo**: specs que tocam o mesmo arquivo
   (footer, layout) executam juntas para minimizar conflito.
3. **Decisões de marca não bloqueiam código**: onde a spec depende de
   decisão do fundador (fonte display, paleta), implementa-se a versão
   mínima reversível e registra-se a pendência no brand book.

---

## Fase 1 — Estancar (críticos de funil e marca) ⏸️ EM ESPERA

> Decisão do fundador (2026-06-10): não executar por enquanto. A execução
> do plano começa pela Fase 2.

| Spec | Origem | Entrega |
|---|---|---|
| SPEC-13 | UX | Criar rota `/contato` (CTA WhatsApp + e-mail + localização); destino estável para os 5 links dos posts que hoje dão 404 |
| SPEC-19 | Branding | Title/description/OG globais com o posicionamento real (`app/layout.tsx`) |
| SPEC-21 | Branding | Footer: `mailto:` = `jadersonmarc@sapienzalabs.com.br` (e-mail exibido); localização "Duque de Caxias — Baixada Fluminense, RJ" |
| SPEC-20 | Branding | Tagline única pt-BR no header e footer (aposentar "Product Studio") |
| SPEC-14 | UX | Unificar os 5 CTAs na oferta "Diagnóstico gratuito — 30 minutos", mensagem de WhatsApp parametrizada por origem (depende da SPEC-13 existir para o link do blog) |

**Status:**
- [ ] SPEC-13 — Rota /contato
- [ ] SPEC-19 — Metadata global
- [ ] SPEC-21 — Higiene de contato no footer
- [ ] SPEC-20 — Tagline pt-BR
- [ ] SPEC-14 — CTAs unificados

## Fase 2 — Performance e fundamentos visuais (quick wins medidos)

| Spec | Origem | Entrega |
|---|---|---|
| SPEC-18 | UX/Design | `marc.png` 592 KB → ≤ 40 KB (256 px); og-image dedicada 1200×630 leve com o logo oficial; corrigir `<Link>` externo em /sobre e itens BAIXO do relatório UX |
| SPEC-26 | Design | Token `--font-display` no `@theme` (versão mínima: Geist com peso/tracking próprios) — destrava a classe usada em todos os títulos |
| SPEC-27 | Design | `.glass`/`.glow-*` derivados dos tokens oklch via `color-mix` (fim do rgba hardcoded) |

**Status:**
- [x] SPEC-18 — Imagens otimizadas + ajustes baixos
- [x] SPEC-26 — Token de tipografia display
- [x] SPEC-27 — Efeitos derivados dos tokens

## Fase 3 — Confiança e conversão (coração comercial)

| Spec | Origem | Entrega |
|---|---|---|
| SPEC-15 | UX | Seção de confiança na home: garantias do modelo (escopo fechado, prazo, suporte), SEBRAE Dev Empreendedor; estrutura pronta para depoimentos futuros |
| SPEC-24 | Branding | Bloco do fundador na home (foto, nome, credencial — integra a seção da SPEC-15) + logo oficial otimizada no footer |
| SPEC-16 | UX | Seção "Como funciona" (diagnóstico → proposta de escopo fechado → desenvolvimento com entregas → suporte) |
| SPEC-17 | UX | Nav do header com âncoras Serviços/Portfólio, Contato reativado, `#sobre` da home → `#diferenciais` |

**Status:**
- [x] SPEC-15 — Seção de confiança
- [x] SPEC-24 — Fundador na home + logo no footer
- [x] SPEC-16 — Seção "Como funciona"
- [x] SPEC-17 — Navegação com âncoras

## Fase 4 — Identidade e consistência

| Spec | Origem | Entrega |
|---|---|---|
| SPEC-23 | Branding | Reordenar `/sobre`: quem somos/para quem → fundador → como trabalhamos → impacto social como visão (conteúdo preservado) |
| SPEC-28 | Design | Componente `Tag`/`Pill` unificado com variantes (substitui as 5 implementações); normalizar raios (CTA do header `rounded-full`) |
| SPEC-25 | Branding | `docs/MARCA.md` — mini brand book: paleta (com decisão pendente registrada), tipografia, tom de voz, mensagens-chave, glossário (termos a evitar) |

**Status:**
- [x] SPEC-23 — /sobre reordenada
- [x] SPEC-28 — Tag/Pill unificado
- [x] SPEC-25 — Brand book

## Fase 5 — Higiene técnica

| Spec | Origem | Entrega |
|---|---|---|
| SPEC-29 | Design | Remover componentes `components/ui/` sem uso e deps órfãs (`next-themes`, `recharts`, `react-hook-form`, `embla-carousel-react`, `react-day-picker`, `vaul`…), remover `theme-provider.tsx`; medir CSS antes/depois (baseline: 128,3 KB) |
| SPEC-30 | Design | `transition-all` → transições específicas nos componentes de seção; testar remoção do `overflow-x: hidden` global |

**Status:**
- [x] SPEC-29 — Limpeza de bundle (CSS de produção 127,4 KB → 50,5 KB; 54 componentes `ui/` removidos, mantidos `button`/`card`/`breadcrumb`; `theme-provider.tsx` e `hooks/` órfãos removidos; 40 dependências órfãs removidas)
- [x] SPEC-30 — Micro-polish (`transition-all` → transições específicas nas seções; `overflow-x: hidden` global removido sem regressão)

---

## Verificação de fechamento (após Fase 5)

1. `pnpm lint && pnpm build` limpos; smoke test das rotas (200 + conteúdo).
2. Re-rodar as três skills (`/ux-review`, `/branding-review`,
   `/design-review`) — os achados CRÍTICO/ALTO dos relatórios de
   2026-06-10 devem aparecer como resolvidos; comparar medições de
   performance (CSS, peso por rota, `marc.png`).
3. Atualizar os checkboxes deste arquivo a cada spec concluída.

## Fora deste plano (pendências conhecidas)

- **SPEC-22 — promessa geográfica**: removida do plano por decisão do
  fundador (2026-06-10) — a âncora geográfica é parte da estratégia e será
  trabalhada de outra forma, em outro momento. Não explorar por enquanto.
- **Analytics** (decisão adiada pelo fundador — Umami/Plausible vs GA4).
- **Migração MDX do blog** (`docs/BLOG_MIGRATION.md` — gatilho: 3 clientes
  pagantes).
- **Decisão formal de paleta/fonte de marca** (registrada na SPEC-25 como
  pendência; não bloqueia as fases).
