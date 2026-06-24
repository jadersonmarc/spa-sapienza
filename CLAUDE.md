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
- Tailwind CSS 4 (tokens semânticos em oklch; **dark/light via next-themes**,
  default `system`, com toggle — ver Sistema de design)
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
- `components/` — seções da home (`hero.tsx`, `services.tsx`, `plans.tsx` (planos de
  serviço da seção "Portfólio"), `differentials.tsx`, `header.tsx`, `footer.tsx`,
  `whatsapp-button.tsx`) e `components/ui/` (shadcn).
- `lib/contact.ts` — número do WhatsApp (`WHATSAPP_PHONE`) e `whatsappUrl(text)` (canal
  único de conversão; ver Restrições).
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
  transição, máquina de estados, diff, slug, `pages` [queries DB] e `home-blocks` [tipos +
  defaults puros da home, incl. planos]), `lib/ai/*` (client, analyzers, social,
  draft), `lib/social/*` (instagram, linkedin, image), `lib/storage/s3.ts`. Migrations em `drizzle/`.
- **Sistema de imagens**: `lib/brand/*` — renderer tipográfico (`next/og`/Satori) que gera
  OG do blog e cards sociais on-brand. Rota on-demand `app/api/og` (preview do composer);
  OG do blog (`app/blog/[slug]/opengraph-image.tsx`) é estática no build. Ver "Sistema de imagens".
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
- **Dark/light com toggle** (next-themes, default `system`). Ao estilizar, use
  **tokens semânticos** (`bg-background`, `text-foreground`, `border-border`,
  `bg-card`, `text-muted-foreground`, `bg-primary`…). **Nunca** usar tints fixos
  como `white/x`, `bg-black`, `text-red-400` direto — quebram no tema claro;
  prefira `foreground/[x]`, `border-border`, `text-destructive`, ou pares
  `*-700 dark:*-300`. AA nos dois temas.
- **Não usar imagens externas ou de stock** — apenas assets já em `/public`.
- Conteúdo do site é **pt-BR** — atenção à acentuação correta em toda copy.

## Sistema de design (Lote Design)

Tese: *precisão que vira confiança* — engenharia sinalizada por estrutura e
**monospace** (números, rótulos, metadados), mas calorosa e legível para dono de PME.

- **Tipografia (3 papéis, `next/font`)**: Bricolage Grotesque (`font-display`,
  títulos), IBM Plex Sans (`font-sans`, corpo/UI), IBM Plex Mono (`font-mono`,
  assinatura: números, eyebrows, metadados, código).
- **Eyebrows**: usar `components/eyebrow.tsx` (mono, caixa-alta, dot petrol) —
  unifica hero, seções e páginas. No admin, headers em `font-display`.
- **Paleta** (tokens em `app/globals.css`, `:root` = light, `.dark` = dark):
  petrol/petrol-soft (`--primary`), ink/surface (`--background`/`--foreground`),
  line (`--border`), `--signal` (#C9683A, só destaque/alerta pontual).
- **Anti-clichê**: nada de creme+serifa+terracota, nem quase-preto+verde-ácido,
  nem broadsheet. Acento é petrol; ousadia só na assinatura mono.
- **A11y**: `prefers-reduced-motion` respeitado globalmente; foco visível (ring);
  status do admin com cor semântica.

## Sistema de imagens (Lote Imagens)

Capas/OG do blog e cards sociais (IG/LinkedIn) são **renderizados pelo app** (`next/og`/
Satori), derivando do mesmo sistema de design. Regra dura (impossível sair da marca):
só campo `ink`/`surface`, **um** acento petrol, **sem gradiente**, assinatura mono
obrigatória (trilho + crop mark). Referência de aparência: `docs/guia-identidade-visual-imagens.html`.

- **Fonte única**: `lib/brand/tokens.ts` (sRGB p/ Satori + OKLCH de referência; `tokens.test.ts`
  falha se divergir do `globals.css`). Presets em `lib/brand/formats.ts` (canal × aspecto).
- **Renderer/arquétipos**: `lib/brand/render.tsx` + `lib/brand/templates/*` (capa-editorial,
  card-conceito, diagrama, carrossel-slide, bastidores; assinatura em `signature.tsx`).
  `compose.ts` mapeia entrada→arquétipo e monta a chave R2 (`sapienza_{pilar}_{slug}_{canal}_{aspecto}`).
- **Fontes**: TTFs em `assets/fonts/` (Bricolage Grotesque + IBM Plex Sans/Mono) — Satori
  não aceita woff2/CSS; embutidas no PNG sem FOUT.
- **Floor (testes)**: contraste AA, guarda anti-cor-solta (templates só usam `tokens.ts`),
  determinismo do PNG. Rodar `pnpm test` ao mexer em `lib/brand/*`.
