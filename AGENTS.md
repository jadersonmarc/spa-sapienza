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
- **WhatsApp é o único canal de conversão**: CTAs usam `lib/contact.ts`
  (`whatsappUrl`). A seção "Portfólio" da home são **planos de serviço** (DB-driven,
  `blocks.portfolio.items`, editáveis no admin) — **nunca renderizar preço** no site.
- Toda transição de status passa por `lib/content/transition.ts` (audita + revalida).
- `role`: publicar/agendar/arquivar e excluir exigem **admin**.
- Segredos só em env/Coolify; nunca colar no chat (rotacionar se vazar).

## Automação (sem n8n)
- **GitHub Actions** acionam `/api/generate-draft` (cron seg/qua/sex) e
  `/api/publish-scheduled` (~15 min) com `x-webhook-secret`.
- **Postagem social** (Instagram via Facebook Graph EAA; LinkedIn) é **por botão**
  no admin, após aprovar o post — `lib/social/*`. Na revisão, **legenda, hashtags e
  imagem são editáveis** em rascunho: imagem padrão = card da IA (persistido em
  `social/<plataforma>/`), trocável pelo `MediaPicker` (upload ou seleção via
  `GET /api/admin/media?folder=`); a publicação usa o `image_url` salvo. As imagens são
  **renderizadas pelo app** via `lib/brand/*` — ver "Sistema de imagens" no `CLAUDE.md`.
  Templates só consomem `lib/brand/tokens.ts` (testes travam contraste AA, cor literal e
  divergência com `globals.css`).
- **Biblioteca de Mídia** (`/admin/midia`): gerencia o R2 por **pasta/finalidade** (copiar URL,
  renomear, mover, excluir, upload). Os seletores (post social, capa de artigo, editor) leem dela
  via `MediaPicker`. Mover/renomear/excluir de imagem **em uso** (`findImageReferences`) avisa e
  exige confirmação — v1 **não reescreve** referências.
- **Capa de artigo**: `content_items.cover_image_url` definida pela biblioteca (`articles/`); o
  blog mostra no topo e a OG usa **full-bleed** quando há capa, senão o layout da marca.
- **Chaves do R2**: sempre por `lib/storage/keys.ts` (`R2_PURPOSES`/`mediaUploadKey`; finalidades
  `articles/`, `social/<plataforma>/`, `editor/`, `pages/`, `geral/`) — nunca montar caminho à mão.

## Antes de mexer
- Não quebrar rotas do site (`/`, `/sobre`, `/blog`, `/blog/[slug]`) — slugs têm SEO.
- Dark/light com toggle (next-themes, default `system`): estilizar só com tokens
  semânticos (`bg-background`, `border-border`, `text-destructive`…); nunca `white/x`
  ou cores fixas que quebram no claro. Sem imagens de stock. Ver "Sistema de design"
  no `CLAUDE.md` (tipografia display/sans/mono, `components/eyebrow.tsx`, paleta petrol).
- Rodar `pnpm lint && pnpm exec tsc --noEmit && pnpm test` antes de commitar.
