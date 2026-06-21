# Melhorias do CMS — backlog priorizado

Origem: revisão por agente avaliador (2026-06-19) do CMS (Fases 1 e 2, branch
`feat/admin-cms`). Itens marcados `[x]` foram implementados nesta rodada; os demais
ficam para próximas sessões. Prioridades: **P0** crítico/segurança · **P1** importante ·
**P2** melhoria.

## P0 — crítico / segurança
- [x] **Aplicar papéis `admin`/`editor`.** Antes, `role` era declarado (schema, tipos, UI)
  mas **não aplicado** em nenhuma action/middleware. Modelo adotado: publicar/agendar/
  arquivar e excluir conteúdo exigem **admin**; criar/editar/submeter a revisão/rodar IA/
  gerar social são permitidos a qualquer usuário autenticado. Helper `lib/auth/session.ts`.
- [x] **Tratar `stop_reason` do Claude** (`refusal`/`max_tokens`) antes do `JSON.parse`
  em `lib/ai/client.ts` e `lib/ai/draft.ts` — evita 500 opaco em recusa/truncamento.
- [ ] **Postgres exposto publicamente** (`2.24.82.211:5432`). Fechar a porta pública;
  acesso de dev via túnel SSH/WireGuard ou firewall por IP no Coolify; forçar TLS
  (`sslmode=require`); **rotacionar a senha** (circulou no chat). *(operacional — VPS)*

## P1 — importante
- [x] **Agendamento sem publicação automática.** Criado `POST /api/publish-scheduled`
  (protegido por `x-webhook-secret`): publica itens `scheduled` com `scheduled_at <= now()`
  via `contentTransition`. **Pendência operacional:** apontar o cron do n8n para ele
  (ex.: a cada 5–15 min).
- [x] **`notifySocialWebhook` sem timeout** → adicionado `AbortSignal.timeout` ao `fetch`.
- [x] **`deleteContentAction`** sem gate de papel e sem proteção de `published` → exige
  admin e bloqueia excluir conteúdo `published` (arquivar antes); revalida o blog.
- [x] **Markdown via regex + `dangerouslySetInnerHTML`** (XSS) → trocado por
  `react-markdown` + `remark-gfm` + `rehype-sanitize` no blog público.

## P2 — melhorias
- [x] **Upload aceitava `image/svg+xml`** (vetor XSS) → removido da allowlist.
- [x] **`scheduledAt` no fuso do servidor** → interpretado como **BRT (-03:00)**.
- [x] **Acentuação** em `app/blog/[slug]/page.tsx` ("eficiência e inovação").
- [x] **Avatar `/marc.webp`** — verificado: existe em `public/` (falso positivo).
- [ ] **Upload sem checagem de magic bytes** (confia no `file.type` declarado). Validar
  o conteúdo real do arquivo. *(futuro)*
- [ ] **Permissões mais finas** (ex.: editor submeter a revisão; aprovação social por
  admin) — modelo atual é grosso; refinar se o time crescer. *(futuro)*

## Rotação de segredos (radar)
Vários segredos circularam no histórico de chat → tratar como comprometidos e trocar o valor.
- [x] `AUTH_SECRET` — regenerado no `.env.local` local. **Pendente:** rotacionar no Coolify
  se o valor de produção for o mesmo.
- [ ] **Senha do Postgres** — rotacionar (apareceu várias vezes) + fechar porta pública.
- [ ] **Senha do admin** (`Teste@123`) — re-seedar com senha forte.
- [ ] Senhas do **Postgres do Supabase** (testes) — só se aquela instância ainda existir.
- [ ] R2 / `ANTHROPIC_API_KEY` / `WEBHOOK_SECRET` — não foram colados no chat (baixo risco);
  rotacionar só por precaução.

## Pendências operacionais (produção — fora de código)
- Rotacionar senha do Postgres; fechar porta pública (ver P0).
- Re-seedar admin com senha real (trocar `Teste@123`).
- Envs no Coolify: `DATABASE_URL` (host interno), `AUTH_SECRET`, `WEBHOOK_SECRET`,
  `ANTHROPIC_API_KEY`, `N8N_PUBLISH_WEBHOOK_URL`, `SITE_URL`, `S3_*` (R2); garantir
  `DATABASE_URL` também no build.
- Apontar n8n cron para `/api/generate-draft` e `/api/publish-scheduled`.
- Branch protection na `main` com o gate de CI.
