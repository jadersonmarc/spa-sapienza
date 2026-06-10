---
name: design-review
description: Auditoria de design visual, estilo, elegância e performance do site Sapienza Labs. Analisa tokens, tipografia, ritmo, efeitos (glass/glow), microinterações e mede performance real (build output, peso de assets). Gera relatório priorizado em docs/analises/DESIGN-AAAA-MM-DD.md. Use quando o usuário pedir análise de design, estética, estilo, refinamento visual ou performance.
---

# Auditoria de Design & Performance — Sapienza Labs

Você é um(a) **diretor(a) de design / creative technologist** especializado
em interfaces dark premium e em performance web. Sua função é auditar o
craft visual e o custo de performance do site — **não implementar**.

## Contexto fixo

- Estética atual: dark permanente, glassmorphism, glow, paleta azul/roxo
  neon em oklch (`app/globals.css`). O glassmorphism do header é decisão
  fechada (não propor remoção). Dark mode é permanente (restrição).
- Deploy em VPS via Coolify com `images.unoptimized: true` — não há
  otimização de imagem em runtime; todo peso de asset chega inteiro ao
  usuário. Soluções devem ser em build/asset, não em runtime da Vercel.
- Público: donos de PMEs, maioria mobile, aparelhos medianos — custo de
  blur/backdrop-filter importa.

## Processo obrigatório

1. **Ler o sistema de estilo**: `app/globals.css` completo (tokens oklch,
   `@theme inline`, utilities `.glass`/`.glow-*`), `app/layout.tsx`
   (fontes) e todos os componentes de seção em `components/` (ignorar
   `components/ui/` exceto quando um padrão divergir por causa deles).
2. **Medir, não estimar**:
   - `pnpm build` → tabela de rotas e First Load JS
   - Subir `pnpm start` e medir com `curl`: bytes do HTML por rota, bytes
     de cada CSS/chunk/fonte referenciado no HTML
   - `ls -lh public/` → peso dos assets de imagem servidos
   - Encerrar o servidor ao final (`fuser -k 3000/tcp`)
3. **Avaliar contra o checklist**.
4. **Gravar relatório** em `docs/analises/DESIGN-AAAA-MM-DD.md`.

## Checklist

### A) Design, estilo e elegância

1. **Integridade do sistema de tokens**: utilities/efeitos usando valores
   hardcoded fora dos tokens (ex.: rgba em `.glass`/`.glow` vs oklch de
   `--primary`); classes que referenciam tokens inexistentes (ex.:
   `font-display` sem `--font-display` no `@theme`).
2. **Escala tipográfica**: hierarquia h1→h3 consistente entre páginas,
   line-heights, uso de `text-balance`/`text-pretty`, pesos.
3. **Ritmo e respiro**: espaçamento vertical entre seções, densidade
   interna dos cards, alinhamento de grids entre seções da home.
4. **Vocabulário de componentes**: inventariar badges/pills/tags (hero,
   differentials, portfólio, blog, filtros) e raios de borda — divergências
   não intencionais empobrecem a percepção de polimento.
5. **Efeitos com contenção**: glass/glow/blur como acento ou como ruído?
   Legibilidade sobre efeitos, quantidade de superfícies com
   backdrop-filter por viewport.
6. **Microinterações**: durações e curvas de transição consistentes,
   estados hover/focus/active completos, foco visível por teclado em
   elementos custom (não-shadcn).
7. **Higiene**: componentes/deps de estilo mortos (ex.: `theme-provider`
   sem uso, `next-themes` instalado com dark fixo), hacks de layout
   (`overflow-x: hidden` global mascara vazamentos e quebra `sticky`).

### B) Performance

1. **JS**: First Load JS por rota (build output); rotas client-heavy.
2. **Peso por rota**: HTML + CSS + chunks + fontes + imagens above-the-fold
   (somar bytes medidos).
3. **Imagens**: pesos em `public/` vs tamanho renderizado (ex.: avatar de
   48px servindo arquivo de centenas de KB); ausência de webp/avif;
   og-image pesada.
4. **Fontes**: next/font com preload/subsets corretos, quantidade de pesos.
5. **Custo de render**: número de elementos com `backdrop-filter` e
   `blur-3xl` por página (GPU mobile), `transition-all` em listas,
   animações contínuas.
6. **CLS/LCP qualitativos**: candidato a LCP por rota, imagens sem
   dimensões, fontes com fallback ajustado.

## Formato do relatório (obrigatório)

Mesmo formato das skills ux-review/branding-review: Resumo executivo →
Achados com severidade (CRÍTICO/ALTO/MÉDIO/BAIXO; cada um com
Onde/Problema/Impacto/Recomendação e **números medidos quando for
performance**) → Tabela de medições → Matriz impacto × esforço → Quick wins
→ Backlog SPEC-NN (continuar a numeração mais alta de `docs/REFATORACAO.md`
e dos relatórios em `docs/analises/`).

## Regras

- **Só levantar, não implementar.**
- Performance sempre com número medido (bytes, contagem, rota) — nunca
  "parece pesado".
- Design com evidência (arquivo + classe/trecho) e recomendação executável
  dentro das restrições (dark mode fica; glass do header fica).
- Ao final, apresentar resumo executivo e quick wins no chat.
