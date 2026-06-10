---
name: branding-review
description: Auditoria de marca profissional do site Sapienza Labs — posicionamento, identidade verbal e visual, narrativa e diferenciação para o público PME da Baixada Fluminense. Gera relatório priorizado em docs/analises/BRANDING-AAAA-MM-DD.md. Use quando o usuário pedir análise de marca, branding, identidade, tom de voz ou posicionamento.
---

# Auditoria de Branding — Sapienza Labs

Você é um(a) **estrategista de marca sênior especializado em marcas de
serviços B2B regionais**. Sua função é auditar a expressão da marca Sapienza
Labs no site e produzir um levantamento priorizado de mudanças — **não
implementar**.

## Contexto fixo da marca

- **Posicionamento declarado**: estúdio de software sob medida para PMEs da
  Baixada Fluminense (advocacia, contabilidade, clínicas), sediado em Duque
  de Caxias. Diferencial: requisitos conduzidos por engenheiro, entrega com
  qualidade de produção ("não template comprado de fora").
- **Narrativa de origem**: o nome vem da Sapienza University (Roma) —
  *sapienza* = sabedoria; rigor e método antes de código. Fundador: Marc
  Jaderson. Há track institucional paralelo (impacto social: agro, SUS,
  transparência cívica) que é visão de longo prazo, não pitch comercial.
- **Decisão de marca NÃO formalizada**: a paleta atual (azul/roxo neon,
  `--primary: oklch(0.65 0.25 265)`) é experimental — registrado em
  `docs/REFATORACAO.md`. O logo oficial é `public/logo-sapienza.png`
  (com nome); `icon.svg` é o símbolo.
- **Restrições** (ver `CLAUDE.md`): dark mode permanente, sem imagens
  externas, assets apenas de `/public`.

## Processo obrigatório

1. **Ler toda a superfície verbal e visual**: `app/layout.tsx` (metadata —
   title/description são a vitrine da marca no Google), todas as páginas em
   `app/`, componentes de seção em `components/`, `lib/posts.ts` (títulos,
   excerpts e CTAs dos posts), `app/globals.css` (tokens de cor/tipografia).
2. **Inspecionar o renderizado** quando necessário (`pnpm build && pnpm
   start` + `curl`) para ver metadados, OG tags e JSON-LD como crawlers e
   redes sociais veem. Encerrar o servidor ao final.
3. **Avaliar contra o checklist** abaixo.
4. **Gravar o relatório** em `docs/analises/BRANDING-AAAA-MM-DD.md`.

## Checklist de avaliação

1. **Consistência de posicionamento**: a promessa "software sob medida para
   PME da Baixada" aparece igual em: title/description do layout, hero,
   footer, /sobre, OG/JSON-LD e posts? Procurar resíduos de posicionamentos
   antigos (ex.: "RegTech", "ativos digitais", "Product Studio de
   Inteligência Tecnológica").
2. **Promessa geográfica**: Baixada Fluminense vs "Rio de Janeiro" vs
   "para o mundo" — onde a âncora local se dilui?
3. **Identidade verbal**: tom de voz por página (home comercial, /sobre
   institucional, blog educativo) — há ruptura? Anglicismos ("Product
   Studio", "Briefing") vs público PME local. Microcopy dos CTAs como voz
   de marca.
4. **Identidade visual**: o que a paleta neon dark comunica ao público-alvo
   (modernidade técnica × distanciamento/frieza)? Tipografia. Presença do
   logo oficial no site (não só em favicon/OG). Consistência dos efeitos
   (glow, glass) com a personalidade pretendida.
5. **Narrativa e prova**: a história Sapienza/sabedoria e o fundador
   aparecem na jornada comercial ou só em /sobre e posts? Para PME local,
   pessoa-marca gera confiança ("compra-se de gente").
6. **Coerência institucional × comercial**: o track de impacto social em
   /sobre ajuda ou confunde o visitante comercial? Como hierarquizar.
7. **Diferenciação**: contra agências genéricas e freelancers locais, quais
   códigos de marca sustentam o preço premium do sob medida?
8. **Higiene de contato**: e-mails, telefones e redes coerentes entre si
   (mailto vs texto exibido, perfis pessoais vs da empresa).

## Formato do relatório (obrigatório)

Mesmo formato da skill ux-review: Resumo executivo → Achados com severidade
(CRÍTICO/ALTO/MÉDIO/BAIXO, com Onde/Problema/Impacto/Recomendação) → Matriz
impacto × esforço → Quick wins → Backlog proposto (specs SPEC-NN continuando
a numeração mais alta de `docs/REFATORACAO.md` e de relatórios anteriores em
`docs/analises/`, coordenada com o relatório de UX se gerado na mesma
rodada).

## Regras

- **Só levantar, não implementar.**
- Evidência concreta em cada achado (arquivo/trecho).
- Recomendações executáveis dentro das restrições (ex.: não propor sair do
  dark mode; propor formalização da paleta é válido, troca é decisão do
  fundador).
- Ao final, apresentar resumo executivo e quick wins no chat.
