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

- **`SPEC.md`** — admin de gestão de conteúdo (CMS próprio). **Fase 1 concluída**
  (auth, CRUD, editor, máquina de estados, blog lendo do Postgres, geração via
  Claude + ponte social, testes). Fases 2 (IA) e 3 (analytics) pendentes.
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
- **CMS (Fase 1)**: Postgres na VPS + Drizzle ORM; Auth.js v5 (Credentials/JWT);
  Cloudflare R2 (imagens); CodeMirror 6 (editor); `@anthropic-ai/sdk` (geração);
  vitest (testes).

## Comandos

```bash
pnpm dev          # desenvolvimento em http://localhost:3000
pnpm build        # build de produção (lê o Postgres — exige DATABASE_URL)
pnpm start        # serve a build
pnpm lint         # análise estática
pnpm test         # testes unitários (vitest)
pnpm db:generate  # gera migration a partir do schema (drizzle-kit)
pnpm db:push      # aplica o schema no banco
pnpm db:seed      # cria/atualiza admin: --email .. --password .. [--role admin]
pnpm db:import-mdx # importa os .mdx para o Postgres (idempotente)
```

## Estrutura

- `app/` — rotas: `/`, `/sobre`, `/blog`, `/blog/[slug]`. Tema real em
  `app/globals.css`.
- `components/` — seções da home (`hero.tsx`, `services.tsx`,
  `differentials.tsx`, `header.tsx`, `footer.tsx`, `whatsapp-button.tsx`) e
  `components/ui/` (shadcn).
- `app/blog/posts/` — posts originais em `.mdx`. **Não são mais lidos pelo site**
  (origem do import para o DB; ver `pnpm db:import-mdx`). Remoção definitiva pendente.
- `lib/blog.ts` — **lê do Postgres** (`getAllPosts` / `getPostBySlug`, interface
  `Post`, só `published`); mapeia o pilar do enum (`p1`→engenharia, `p2`→pme,
  `p3`→bastidores). Corpo renderizado com `react-markdown`+`rehype-sanitize`.
- **Admin/CMS**: `app/admin/*` (login, CRUD, editor, histórico/diff, propostas de IA,
  páginas, conta), `app/api/auth/*` (Auth.js), `app/api/generate-draft` e
  `app/api/publish-scheduled` (acionados por GitHub Actions), `app/api/admin/upload` (R2);
  `middleware.ts` protege `/admin`. `auth.ts`/`auth.config.ts` + `lib/auth/*`
  (sessão, permissões, senha, webhook), `lib/db/*` (Drizzle), `lib/content/*` (queries,
  transição, máquina de estados, diff, slug, pages), `lib/ai/*` (client, analyzers, social,
  draft), `lib/social/*` (instagram, linkedin, image), `lib/storage/s3.ts`. Migrations em `drizzle/`.
- **Automação editorial**: `.github/workflows/generate-draft.yml` (cron seg/qua/sex) e
  `publish-scheduled.yml` chamam os endpoints com `x-webhook-secret`. Postagem social
  (Instagram via Facebook Graph EAA; LinkedIn) é **por botão** no admin, na revisão social.
  (n8n foi removido.)
- `public/` — assets permitidos: `logo-sapienza.png` (logo principal),
  `icon.svg`, `icon-dark-32x32.png`, `icon-light-32x32.png`, `marc.png`.

## Deploy

VPS Hostinger via Coolify — **não é Vercel**. Por isso:

- `images: { unoptimized: true }` no `next.config.mjs` é intencional.
- `@vercel/analytics` está instalado mas não funciona neste ambiente
  (remoção prevista na SPEC-06).

## Restrições

- **Não alterar a stack do front**: Next.js App Router, Tailwind 4, shadcn/ui, pnpm.
  (As adições do CMS — Postgres/Drizzle/Auth.js/R2 etc. — são sancionadas pelo `SPEC.md`.)
- **Não quebrar rotas existentes**: `/`, `/sobre`, `/blog`, `/blog/[slug]`
  (slugs do blog têm valor de SEO).
- **Manter dark mode permanente** — não adicionar toggle de tema.
- **Não alterar o glassmorphism do header** — está bem resolvido.
- **Não usar imagens externas ou de stock** — apenas assets já em `/public`.
- Conteúdo do site é **pt-BR** — atenção à acentuação correta em toda copy.
