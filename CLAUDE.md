# CLAUDE.md — Sapienza Labs (spa-sapienza)

## O que é este projeto

Site institucional da **Sapienza Labs** — estúdio de software sob medida para
PMEs da Baixada Fluminense (escritórios de advocacia, contabilidade e clínicas).
O site apresenta a empresa, seus serviços e produtos, e funciona como canal de
comunicação direta com clientes.

- **Canal de conversão**: WhatsApp — `https://wa.me/5521986537054`. Não há
  formulário de contato; todos os CTAs apontam para o WhatsApp.
- **Origem**: experimento gerado via v0.dev, em processo de alinhamento
  estratégico (ver roadmap abaixo).

## Roadmap ativo

- **`docs/PLANO-DE-ACAO.md`** — plano vigente: SPEC-13 a SPEC-30 (backlog
  das auditorias de UX, branding e design) organizadas em 5 fases, com
  status por checkbox. Consultar antes de alterar conteúdo, copy ou
  estrutura do site.
- `docs/REFATORACAO.md` — primeira rodada (SPEC-01 a SPEC-12), concluída;
  mantém o diagnóstico original e as restrições.
- `docs/analises/` — relatórios das auditorias que originaram as specs.

## Skills e análises

- **`/ux-review`**, **`/branding-review`** e **`/design-review`** (em
  `.claude/skills/`) — skills de auditoria profissional que geram
  relatórios priorizados em `docs/analises/` (UX- / BRANDING- /
  DESIGN-AAAA-MM-DD.md). Os relatórios propõem specs numeradas continuando
  a sequência do roadmap (SPEC-13+). Rodar novamente após cada rodada de
  mudanças.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (tokens em oklch, dark mode **permanente** — sem toggle)
- shadcn/ui (estilo New York) + Radix UI + lucide-react
- Gerenciador de pacotes: **pnpm**

## Comandos

```bash
pnpm dev     # desenvolvimento em http://localhost:3000
pnpm build   # build de produção
pnpm start   # serve a build
pnpm lint    # análise estática
```

## Estrutura

- `app/` — rotas: `/`, `/sobre`, `/blog`, `/blog/[slug]`. Tema real em
  `app/globals.css`.
- `components/` — seções da home (`hero.tsx`, `services.tsx`,
  `differentials.tsx`, `header.tsx`, `footer.tsx`, `whatsapp-button.tsx`) e
  `components/ui/` (shadcn).
- `lib/posts.ts` — posts do blog hardcoded como array (interface `Post`).
  Parsing de markdown via regex em `app/blog/[slug]/page.tsx`.
- `public/` — assets permitidos: `logo-sapienza.png` (logo principal),
  `icon.svg`, `icon-dark-32x32.png`, `icon-light-32x32.png`, `marc.png`.

## Deploy

VPS Hostinger via Coolify — **não é Vercel**. Por isso:

- `images: { unoptimized: true }` no `next.config.mjs` é intencional.
- `@vercel/analytics` está instalado mas não funciona neste ambiente
  (remoção prevista na SPEC-06).

## Restrições

- **Não alterar a stack**: Next.js App Router, Tailwind 4, shadcn/ui, pnpm.
- **Não quebrar rotas existentes**: `/`, `/sobre`, `/blog`, `/blog/[slug]`
  (slugs do blog têm valor de SEO).
- **Manter dark mode permanente** — não adicionar toggle de tema.
- **Não alterar o glassmorphism do header** — está bem resolvido.
- **Não usar imagens externas ou de stock** — apenas assets já em `/public`.
- Conteúdo do site é **pt-BR** — atenção à acentuação correta em toda copy.
