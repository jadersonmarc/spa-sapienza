# SPEC — Admin de Gestão de Conteúdo (spa-sapienza)

Documento vivo. Guia a construção do admin de conteúdo (CMS próprio) e a migração
do conteúdo de MDX para Postgres. Atualizar ao fim de cada fase junto com
`CLAUDE.md` e `AGENTS.md`.

## Decisões confirmadas

- **Next.js 16** (App Router, Server Components/Actions, `ImageResponse`).
- **Instagram via Facebook Graph** (`graph.facebook.com`, Page token `EAA` de longa
  duração já validado). **Não** usar Instagram Login / IGAA.
- **Postgres standalone na VPS** (Coolify) como banco. Dev local alcança pelo host
  público (`2.24.82.211:5432`); em produção o app usa o host interno do Docker.
- **Auth.js v5** (next-auth, App Router) com **Credentials provider** (e-mail + senha,
  hash argon2/bcrypt) e **sessão via JWT** — sem Supabase Auth.
- **Storage S3-compatível (Cloudflare R2)** para imagens do editor — sem Supabase Storage.
- **Drizzle ORM + drizzle-kit** como camada de dados (SQL explícito, migrations versionadas)
  sobre o Postgres (`DATABASE_URL`).
- LinkedIn permanece como hoje.
- Esta direção **supera** a antiga restrição "não alterar a stack" do `CLAUDE.md`.

## Princípios invioláveis

1. **Publicar conteúdo NÃO dispara deploy.** Conteúdo é dado em Postgres, lido em
   runtime. Deploy é só para mudança de código.
2. Toda transição de status passa por **um único serviço** (`lib/content/transition.ts`);
   efeito colateral (revalidação do site) só quando muda a visibilidade pública.
3. TypeScript estrito; dependências mínimas e justificadas; segredos só em env/Secrets.
4. **Auth por tipo de chamador:**
   - **Humano** (`/admin` UI + Server Actions) → **Auth.js** (Credentials, sessão JWT;
     `role` checado nas actions; publicar/excluir exigem admin).
   - **Máquina/externo** (GitHub Actions → `/api/generate-draft`, `/api/publish-scheduled`) →
     **webhook secret** no header (`x-webhook-secret` vs env; 401 se difere; compare em
     tempo constante). Toda rota acionável por máquina sem sessão verifica o secret.
   - **Postagem social** (IG/LinkedIn) → **por botão** no admin (não há webhook de saída).

## Arquitetura

```
GitHub Actions cron (seg/qua/sex 08h BRT) → POST /api/generate-draft (x-webhook-secret)
  → admin chama Claude API (prompt por pilar) → grava content_item (draft) + revision

Pessoa em /admin: revisa/edita (editor + versionamento/diff + análises/propostas de IA)
  → published: contentTransition revalida o site (sem deploy)
  → posts sociais: gerar → aprovar → botão "Publicar no IG/LinkedIn" (com imagem OG)

Deploy (separado): PR → GitHub Actions (build/lint/typecheck/test) → merge → Coolify
```

## Modelo de dados (Drizzle)

Enums: `content_type`(post|page), `content_status`(draft|in_review|scheduled|published|archived),
`pilar`(p1|p2|p3), `analysis_type`(quality|seo|emotional|thematic), `platform`(instagram|linkedin),
`social_status`(draft|approved|sent), `user_role`(admin|editor).

- **users** — id (uuid, defaultRandom), email (unique), password_hash (argon2/bcrypt),
  role, created_at, updated_at. Criados por script de seed (sem auto-cadastro).
- **content_items** — id, type, slug (unique), pilar (null p/ page), status (default draft),
  current_revision_id (fk → content_revisions, null), scheduled_at (null), published_at (null),
  author_id (fk users), created_at, updated_at. Índices: slug, (type,status), pilar.
- **content_revisions** — id, content_item_id (fk, on delete cascade), title, body_markdown,
  excerpt, seo (jsonb: {title,description,keywords[]}), author_id, created_at. Snapshot
  **completo** por save; histórico = todas as revisions; diff entre snapshots.
- **ai_analyses** — id, content_item_id, revision_id (fk), type, payload (jsonb), model,
  created_at. Sempre atada à revisão em que rodou.
- **social_drafts** — id, content_item_id, revision_id, platform, body, hashtags (jsonb),
  status (default draft), created_at.
- **audit_log** — id, content_item_id, actor_id, from_status, to_status, note, created_at.

Métricas de analytics ficam **fora do Postgres** (provedor externo, lidas via API).

## Máquina de estados

```
draft → in_review → scheduled → published → archived
  ↑__________│___________│___________│  (volta a draft em edição)
```

- `scheduled` exige `scheduled_at` futuro (job publica no horário).
- Só `→ published` dispara revalidação + webhook social.
- Toda transição grava `audit_log`. Transições válidas centralizadas em
  `contentTransition(itemId, to, actor, opts)`.

## Entrega de conteúdo no site (runtime, sem deploy)

- Páginas/posts em Server Components lendo Postgres. `app/blog` lista só `published`;
  filtro `?pilar=p1|p2|p3` (sitelinks do Google Ads).
- ISR + on-demand: `revalidateTag('content')` / `revalidatePath` na transição.
- `app/blog/[slug]/opengraph-image.tsx` passa a ler título/pilar do banco.
- `body_markdown` renderizado em runtime (substitui o parse de MDX).

## Contratos de endpoint

- `POST /api/generate-draft` — header `x-webhook-secret`; body `{ pilar }`. Gera via Claude,
  cria item `draft` + revision. `200 { itemId }`; `401` se secret inválido. (GitHub Actions)
- `POST /api/publish-scheduled` — header `x-webhook-secret`. Publica os `scheduled` vencidos.
  `200 { published, failed }`. (GitHub Actions)
- Server Actions do admin (sessão): CRUD content, saveRevision, runAnalysis(type),
  applyRecommendation, generateSocialDrafts(platform), **postSocial(platform)**, transition(to),
  savePage, changePassword.

## Fases

### Passo 0 — Provisionamento (concluído)
- Postgres standalone provisionado na VPS (Coolify); schema aplicado (`pnpm db:push`):
  6 tabelas + 7 enums. Supabase removido do código e das deps.
- Envs: `DATABASE_URL`, `AUTH_SECRET`, S3 (Cloudflare R2: `S3_ENDPOINT`, `S3_REGION`,
  `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`), `ANTHROPIC_API_KEY`,
  `WEBHOOK_SECRET`, `INSTAGRAM_ACCESS_TOKEN` (Page token longo).
- Drizzle + drizzle-kit configurados; schema escrito; migrations aplicadas no Postgres.

### Fase 1 — Fundação + Gestão de Conteúdo ✅ (concluída)
schema+migrations (incl. `users.password_hash`); Auth.js (Credentials) + middleware `/admin`
(roles) + seed do admin; CRUD; editor markdown (CodeMirror 6 + preview, toolbar, upload p/
Cloudflare R2); versionamento + diff; máquina de estados + revalidação; `/api/generate-draft` +
ponte social; migração dos 10 MDX → DB; blog público lendo do Postgres. Testes (vitest):
transições, versionamento/diff, autorização, geração (slug) — 16 testes + CI gate
(lint+tsc+test). **(checkpoint atingido)**

Pendências operacionais (fora de código): branch protection na `main` com o gate de CI;
re-seedar admin com senha real; rotacionar senha do Postgres; envs no Coolify; secrets do
GitHub Actions (`SITE_URL`, `WEBHOOK_SECRET`) para os workflows agendados.

### Fase 2 — Recursos com IA (módulos plugáveis) ✅ (concluída)

Camada de IA estruturada como **registry de módulos**, para novos recursos entrarem sem
refatorar (a lista vai crescer — §12).

**Requisitos obrigatórios — todos contemplados:**
- [x] Cada recurso é uma **server action** chamando a Claude API com **prompt dedicado**
  (`lib/ai/client.ts` → `callStructured`); resultado em `ai_analyses` / `social_drafts`,
  **vinculado à revisão** (`revision_id`).
- [x] **Análise de Conteúdo** (`quality`) — score + pontos fortes + recomendações.
- [x] **Otimização de SEO** (`seo`) — título, meta, keywords, headings, densidade.
- [x] **Análise de Impacto Emocional** (`emotional`) — tom dominante, impacto, sugestões.
- [x] **Análise Temática** (`thematic`) — tópicos + áreas relacionadas (calendário editorial).
- [x] **Geração de posts sociais** — `social_drafts` por plataforma (Instagram/LinkedIn),
  **revisáveis** (draft→approved→sent) em `lib/content/social-status.ts`.
- [x] Reuso de `claude-opus-4-8` + structured output e dos enums/tabelas do schema.

Implementação: `lib/ai/{client,analyzers,social}.ts`, server actions
`app/admin/content/{ai-actions,social-actions}.ts`, UI `analysis-panel.tsx` /
`social-panel.tsx` no editor. Testes das máquinas de status (state-machine, social-status).

**Contrato do módulo (analisador):**
```ts
interface Analyzer<TPayload> {
  type: AnalysisType            // quality | seo | emotional | thematic | ...
  label: string                 // rótulo na UI
  buildPrompt(input: AnalyzerInput): ClaudeRequest   // prompt dedicado
  parse(raw: string): TPayload  // valida/normaliza a saída do Claude
}
// registry: Record<AnalysisType, Analyzer>; novos módulos só registram aqui.
```
`AnalyzerInput` = snapshot da revisão (title, body_markdown, excerpt, seo, pilar).
`runAnalysis(itemId, revisionId, type)` (server action) → busca o módulo no registry →
chama Claude → grava em `ai_analyses` (payload jsonb + model), **atado à revisão**.

**Analisadores da Fase 2 (§8):**
- **quality** — qualidade, legibilidade e estrutura; `payload`: score + recomendações acionáveis.
- **seo** — recomendações de visibilidade: título, meta, headings, keywords, densidade.
- **emotional** — tom emocional e impacto do texto.
- **thematic** — tópicos principais + áreas de conteúdo relacionadas (alimenta calendário editorial).

**Geração de posts sociais** — registry análogo por `platform` (instagram|linkedin):
gera `social_drafts` (body + hashtags) a partir da revisão; **revisáveis antes do envio**
(status draft→approved→sent). Postagem por botão no admin (IG/LinkedIn).

**UI** — painel no editor lista os módulos disponíveis, botão "rodar", e renderiza o
resultado a partir do `payload`. Histórico de análises por revisão.

**Extensibilidade** — adicionar um recurso novo = criar um módulo (prompt + parser) e
registrá-lo; sem mexer no resto. Os recursos adicionais que o dono revelar entram assim.

### Fase 3 — Analytics (Análise e Inteligência)
Provedor self-hosted (Umami no Coolify; PostHog se precisar funil/sessão). Métricas **lidas
via API do provedor em runtime** — **não** ficam no Postgres (ver §Modelo de dados).

**Requisitos obrigatórios (devem ser contemplados):**
- [ ] **Métricas de desempenho** consumidas do provedor de analytics (§10): **visualizações**,
  **engajamento** e **comportamento do usuário**.
- [ ] **Dashboard no admin** exibindo essas métricas **por conteúdo** (por post/slug) e
  **agregado** (visão geral do site).
- [ ] Dados lidos da **API do provedor** em runtime (sem persistir métricas no banco);
  mapear cada post (slug) à sua métrica.

## Lote 01 — Refatorações (em andamento)
Ordem: **R4 → R3 → R1 → R2**. Migration `0002` adiciona as colunas abaixo.

- **Schema**: `content_revisions.{blocks jsonb, is_proposed bool, proposed_from jsonb}`,
  `social_drafts.{image_url, post_url}`, `users.session_version`.
- **R4 — troca de senha** (self-service): `/admin/conta`; `changePasswordAction` valida senha
  atual (bcrypt), força da nova, atualiza hash; opcional bump `session_version` (desloga outras).
- **R3 — páginas DB-driven**: `content_items.type='page'` com `revision.blocks` (blocos nomeados
  por seção). Começa pela **home**; componentes viram Server Components com **fallback** ao texto
  hardcoded até publicar; `revalidatePath('/')` no publish. Workflow draft→published.
- **R1 — aplicar recomendação**: botão por recomendação → Claude gera **revisão proposta**
  (`is_proposed`, `proposed_from`) → diff proposta×current → aceitar (vira current) / descartar.
  `listRevisions` exclui propostas.
- **R2 — remover n8n + social por botão**:
  - **n8n eliminado**; agendamento via **GitHub Actions** (gerar rascunho seg/qua/sex; `publish-scheduled`).
  - **Social por botão** no admin (não no `→published`): gerar → aprovar → "Publicar no IG/LinkedIn"
    (`postSocialAction`) → grava `post_url`, marca `sent`. IG via **Facebook Graph (EAA)**.
  - **Imagem**: OG PNG do artigo → R2 → `social_drafts.image_url`.
  - Remover `notifySocialWebhook`, workflows/scripts/docs/env do n8n.

## Sistema de design (Lote Design — UX/UI)
Tese: **precisão que vira confiança**. Assinatura = **monospace** em números, eyebrows e
metadados (encoda "engenharia" sem dizer). Site e admin usam o **mesmo** sistema de tokens.

**Anti-clichê:** nada de creme+serifa+terracota; nada de preto+verde-ácido; nada de broadsheet.

**Tokens** (CSS vars **OKLCH**, semânticas, valor p/ light e dark; Tailwind consome):
`--bg, --fg, --muted, --accent, --accent-soft, --border, --card, --ring, --signal`.
Paleta-fonte: `ink #0E1116`, `surface #F7F8FA`, `petrol #0E6E73`, `petrol-soft #3A9BA0`,
`line #D7DCE2`, `line-dark #222833`, `signal #C9683A` (parcimônia). Escala única de
espaçamento, radii e elevação (sombras suaves).

**Tipografia (3 papéis, `next/font`):** Display **Bricolage Grotesque** (títulos, tracking
apertado); Corpo/UI **IBM Plex Sans**; Mono **IBM Plex Mono** (assinatura).

**Dark/Light:** **next-themes** (class, default system, persistido, sem FOUC); toggle
acessível no site e no admin; AA nos dois temas. (Supera a antiga regra de "dark mode
permanente" do CLAUDE.md.)

**Copy (texto = material):** voz ativa, sentence case; o controle diz o que faz; erros dizem
o que houve e como resolver; tela vazia é convite à ação.

## Lote Imagens — Sistema de imagens de marca (auditoria, **não iniciado**)

Objetivo: capas de blog, OG e imagens sociais (IG/LinkedIn) passam a ser **renderizadas
pelo próprio app**, on-brand, derivando do mesmo sistema de design. Renderer tipográfico
(`next/og`/Satori), **fonte única de tokens**, presets de formato e arquétipos. Regra dura:
o sistema deve **tornar impossível** sair da marca (só `ink`/`surface`, um acento petrol, sem
gradiente, assinatura mono obrigatória). **Fora do lote:** geração de imagem por modelo.

### Estado atual (o que existe hoje)
- **Único renderer:** `app/blog/[slug]/opengraph-image.tsx` — `next/og` `ImageResponse` 1200×630,
  **gerado estático no build** (`generateStaticParams`; comentário "sem runtime no Coolify").
- **Render IG/LinkedIn:** não existe. `lib/social/image.ts` (`getSocialImageUrl`) **reusa o PNG
  da OG do blog** (busca `/blog/{slug}/opengraph-image`, re-hospeda no R2 como `social/{slug}.png`).
- **Composer do admin:** `app/admin/content/social-panel.tsx` + `social-actions.ts` geram só a
  **legenda** (texto via Claude). **Sem imagem, sem preview, sem escolha de canal/aspecto.**
- **Tokens:** só em **OKLCH** no `app/globals.css` (`:root`/`.dark`); comentários já citam os hex
  da marca. **Não há** `tailwind.config` (Tailwind 4 CSS-first) nem módulo TS de tokens.
- **Fontes:** site usa `next/font/google` (Bricolage/Plex). Vendorizado em `assets/fonts/` há
  **só `Geist-Regular.ttf`** — e é o que o OG usa hoje.
- **R2:** `lib/storage/s3.ts` `uploadObject(key, body, contentType) → URL pública`. Funciona.
- **Pilar:** `lib/blog.ts` → `pme | engenharia | bastidores` (map do enum `p1/p2/p3`).
- **Next 16.2.0** → `next/og` disponível (não precisa `@vercel/og`).

### Achados priorizados
- **[P0] Falta a fonte única de tokens.** Satori não lê CSS vars. Criar `lib/brand/tokens.ts`
  (sRGB resolvido + OKLCH de referência) e **amarrar** ao `globals.css` para não divergir.
- **[P0] Faltam as fontes da marca em TTF.** Satori não aceita `.woff2`/CSS; precisa de TTF de
  Bricolage Grotesque + IBM Plex Sans + IBM Plex Mono vendorizados (peso embutido, sem FOUT).
- **[P0] A OG atual está FORA da marca.** `opengraph-image.tsx` usa **Geist**, cores antigas
  (`#0a0a0b`, azul/verde/laranja `#60a5fa/#4ade80/#fb923c`) e **`radial-gradient`** — viola §0
  (gradiente proibido; acento único petrol). Refatorar p/ tokens + arquétipo `capa-editorial`.
- **[P1] Sociais com aspecto errado.** IG/LinkedIn herdam 1.91:1 da OG; faltam 4:5, 1:1, 9:16 e
  carrossel. Trocar `getSocialImageUrl` por render por `canal × aspecto` (`formats.ts`) + nomes §6.
- **[P1] Composer sem imagem/preview.** Adicionar escolha de canal/aspecto/arquétipo + preview
  renderizado (rota de render) antes de publicar; só então gravar no R2 e seguir o fluxo atual.
- **[P2] Floor verificável.** Não há guarda de contraste AA, guarda anti-cor-solta, nem snapshots.

### Reaproveitar vs. refatorar
- **Reusar:** `uploadObject` (R2); pipeline de publicação IG/LinkedIn (`instagram.ts`/`linkedin.ts`);
  `next/og`; vocabulário `Pilar` (`lib/blog.ts`); vitest (`vitest.config.mts`) p/ os testes do floor.
- **Refatorar:** `opengraph-image.tsx` (passa a consumir o renderer/arquétipo); `lib/social/image.ts`
  (deixa de copiar a OG e passa a renderizar o aspecto certo).

### Decisões (resolvidas)
1. **Render:** OG do blog **continua estática no build**; **route handler on-demand** serve preview
   do composer e os aspectos sociais. (`pnpm start`/node no Coolify serve rotas dinâmicas.)
2. **Fontes:** **vendorizar TTFs** de Bricolage Grotesque + IBM Plex Sans/Mono em `assets/fonts/`.
3. **Amarração tokens.ts ↔ globals.css:** **teste vitest** que falha se os OKLCH divergirem do TS.
4. **Vocabulário de pilar:** seguir o código (`engenharia`, tag `ENG/AI`), **não** `engai`.
5. **LinkedIn:** **upload de imagem dedicada** (UGC image share) — `linkedin.ts` muda para subir o
   binário do card social (deixa de depender só da OG do artigo).
6. **Pendência do usuário:** enviar `guia-identidade-visual-imagens.html` p/ commitar em `docs/`.

### Plano de execução (commits curtos, nesta ordem)
1. `tokens.ts` + `formats.ts` + amarração com `globals.css` (sem regressão visual nos 2 temas).
2. Vendorizar TTFs + renderer base com 1 arquétipo (`capa-editorial`) nos 2 campos/2 aspectos.
3. Demais arquétipos + presets de todos os canais/aspectos (stories com zona segura; bastidores-overlay).
4. Integração: capa+OG no publish do blog; composer com preview + nomes R2 §6.
5. Floor: contraste AA, guarda anti-cor-solta, fontes embutidas, snapshots por arquétipo.

## Itens a confirmar
1. (resolvido) Banco = Postgres standalone na VPS; Auth = Auth.js (Credentials);
   Storage = S3-compatível (Cloudflare R2). Supabase descontinuado.
2. (resolvido) Editor: **CodeMirror 6 + preview**.
3. Analytics: **Umami** (rec.) vs Plausible vs PostHog. (Fase 3)
4. Aposentar `app/blog/posts/*.mdx`: conteúdo migrado e site lê do DB; os `.mdx`
   continuam no repo como origem do import (não são mais lidos). Remoção definitiva pendente.
5. Branch protection na `main` com o gate de CI (`.github/workflows/ci.yml`) — pendente (GitHub).

## Fora de escopo
IA adicional (Fase 2+); permissões finas; agendamento avançado; i18n.
