# AGENTS.md — Sapienza Labs (spa-sapienza)

Guia rápido para agentes. Detalhes em `CLAUDE.md` (estrutura/stack) e `SPEC.md`
(CMS, fases e contratos). Backlog de melhorias em `docs/MELHORIAS-CMS.md`.

## Stack
Next.js 16 (App Router) + React 19 + TS, Tailwind 4, shadcn/ui, pnpm.
CMS: Postgres na VPS + Drizzle; Auth.js v5 (Credentials/JWT); Cloudflare R2;
CodeMirror 6; `@anthropic-ai/sdk` (claude-opus-4-8). Deploy via Coolify (não Vercel).

## Comandos
```bash
pnpm dev | build | start | lint | test
pnpm db:generate | db:push | db:seed | db:import-mdx
```
`build` lê o Postgres (exige `DATABASE_URL`). Testes: vitest (lógica pura).

## Convenções
- **pt-BR** em toda copy (acentuação correta).
- Conteúdo é dado em Postgres, lido em runtime; **publicar não dispara deploy**.
- Toda transição de status passa por `lib/content/transition.ts` (audita + revalida).
- `role`: publicar/agendar/arquivar e excluir exigem **admin**.
- Segredos só em env/Coolify; nunca colar no chat (rotacionar se vazar).

## Automação (sem n8n)
- **GitHub Actions** acionam `/api/generate-draft` (cron seg/qua/sex) e
  `/api/publish-scheduled` (~15 min) com `x-webhook-secret`.
- **Postagem social** (Instagram via Facebook Graph EAA; LinkedIn) é **por botão**
  no admin, após aprovar o post — `lib/social/*`.

## Antes de mexer
- Não quebrar rotas do site (`/`, `/sobre`, `/blog`, `/blog/[slug]`) — slugs têm SEO.
- Manter dark mode permanente e o glass do header; sem imagens de stock.
- Rodar `pnpm lint && pnpm exec tsc --noEmit && pnpm test` antes de commitar.
