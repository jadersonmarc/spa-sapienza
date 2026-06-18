# SPEC — Admin de Gestão de Conteúdo (spa-sapienza)

Documento vivo. Guia a construção do admin de conteúdo (CMS próprio) e a migração
do conteúdo de MDX para Postgres. Atualizar ao fim de cada fase junto com
`CLAUDE.md` e `AGENTS.md`.

## Decisões confirmadas

- **Next.js 16** (App Router, Server Components/Actions, `ImageResponse`).
- **Instagram via Facebook Graph** (`graph.facebook.com`, Page token `EAA` de longa
  duração já validado). **Não** usar Instagram Login / IGAA.
- **Supabase** provisionado do zero — recomendado **Supabase Cloud** (Postgres + Auth +
  Storage). Self-host no Coolify é alternativa.
- **Drizzle ORM + drizzle-kit** (SQL explícito, migrations versionadas).
- LinkedIn permanece como hoje.
- Esta direção **supera** a antiga restrição "não alterar a stack" do `CLAUDE.md`.

## Princípios invioláveis

1. **Publicar conteúdo NÃO dispara deploy.** Conteúdo é dado em Postgres, lido em
   runtime. Deploy é só para mudança de código.
2. Toda transição de status passa por **um único serviço** (`lib/content/transition.ts`);
   efeitos colaterais (revalidação + webhook social) só em `→ published`.
3. TypeScript estrito; dependências mínimas e justificadas; segredos só em env/Secrets.
4. **Auth por tipo de chamador:**
   - **Humano** (`/admin` UI + Server Actions) → **Supabase Auth** (sessão + role no middleware).
   - **Máquina/externo** (n8n cron → `/api/generate-draft`, webhooks de entrada) →
     **webhook secret** no header (`x-webhook-secret` vs env; 401 se difere; compare em
     tempo constante). Toda rota acionável por máquina sem sessão verifica o secret.
   - Webhook de **saída** (admin → n8n no publish) → admin envia o secret; n8n valida.

## Arquitetura

```
n8n cron (seg/qua/sex 08h BRT) → POST /api/generate-draft (x-webhook-secret)
  → admin chama Claude API (prompt por pilar) → grava content_item (draft) + revision

Pessoa em /admin: revisa/edita (editor markdown + versionamento/diff) → muda status
  → published: contentTransition dispara revalidateTag/Path + POST webhook → n8n → IG + LinkedIn

Deploy (separado): PR → GitHub Actions (build/lint/typecheck/test) → merge → Coolify
```

## Modelo de dados (Drizzle)

Enums: `content_type`(post|page), `content_status`(draft|in_review|scheduled|published|archived),
`pilar`(p1|p2|p3), `analysis_type`(quality|seo|emotional|thematic), `platform`(instagram|linkedin),
`social_status`(draft|approved|sent), `user_role`(admin|editor).

- **users** — id (uuid = Supabase auth.uid), email (unique), role, created_at, updated_at.
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
  cria item `draft` + revision. `200 { itemId }`; `401` se secret inválido.
- Webhook de saída → n8n (na transição → published): `{ slug, title, excerpt, url, pilar,
  image_url: "{url}/opengraph-image" }` + header `x-webhook-secret`.
- Server Actions do admin (sessão): CRUD content, saveRevision, runAnalysis(type),
  generateSocialDrafts(platform), transition(to).

## Fases

### Passo 0 — Provisionamento (em andamento)
- Supabase (Cloud) + envs: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `WEBHOOK_SECRET`,
  `INSTAGRAM_ACCESS_TOKEN` (Page token longo).
- Drizzle + drizzle-kit configurados; schema escrito; migrations geradas após DB existir.

### Fase 1 — Fundação + Gestão de Conteúdo
schema+migrations; Supabase Auth + middleware `/admin` (roles); CRUD; editor markdown
(CodeMirror 6 + preview, toolbar, upload Storage); versionamento + diff; máquina de estados +
revalidação; `/api/generate-draft` + ponte social; migração dos 10 MDX → DB. Testes:
transições, versionamento/diff, autorização, geração. **(checkpoint)**

### Fase 2 — Recursos com IA (módulos plugáveis)

Camada de IA estruturada como **registry de módulos**, para novos recursos entrarem sem
refatorar (a lista vai crescer — §12).

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
(status draft→approved→sent). Automatiza o que hoje é feito à mão no n8n.

**UI** — painel no editor lista os módulos disponíveis, botão "rodar", e renderiza o
resultado a partir do `payload`. Histórico de análises por revisão.

**Extensibilidade** — adicionar um recurso novo = criar um módulo (prompt + parser) e
registrá-lo; sem mexer no resto. Os recursos adicionais que o dono revelar entram assim.

### Fase 3 — Analytics
Provedor self-hosted (Umami no Coolify; PostHog se precisar funil/sessão). Dashboard no admin
via API, por conteúdo e agregado.

## Itens a confirmar
1. Supabase **Cloud** (rec.) vs self-host.
2. Editor: **CodeMirror 6 + preview** (rec.) vs Milkdown vs TipTap.
3. Analytics: **Umami** (rec.) vs Plausible vs PostHog.
4. Aposentar `app/blog/posts/*.mdx` após migrar (slugs preservados).
5. Branch protection na `main` com o gate de Actions.

## Fora de escopo
IA adicional (Fase 2+); permissões finas; agendamento avançado; i18n.
