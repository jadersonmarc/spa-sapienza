# Automação Editorial — Guia de Configuração

Pipeline editorial sem intervenção manual: o n8n gera artigos por pilar 3x por
semana, commita o MDX direto na `main` (Coolify faz redeploy), e uma GitHub
Action dispara a publicação no Instagram e LinkedIn.

## Arquitetura

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  FLUXO A — Geração (n8n, seg/qua/sex 08h BRT)                       │
  └──────────────────────────────────────────────────────────────────┘
   Cron ─▶ Set Pilar Context ─▶ RSS Google News ─▶ Parse Tendências
        ─▶ Build Claude Request ─▶ Claude API (claude-sonnet-4-6)
        ─▶ Build MDX ─▶ GitHub API: PUT contents (commit na main)
                                          │
                                          ▼
              Coolify detecta push ─▶ redeploy do site (build estático)
                                          │
                                          ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  FLUXO B — Publicação (GitHub Action → n8n webhook)                 │
  └──────────────────────────────────────────────────────────────────┘
   Action publish-social.yml (push em app/blog/posts/**.mdx)
        ─▶ extract-post-meta.mjs ─▶ POST webhook n8n (X-Webhook-Secret)
              │
              ▼
   Webhook ─▶ Valida secret ─▶ Build Captions ─▶ Instagram (container+publish)
                                              └▶ LinkedIn (ugcPosts) ─▶ Log
```

Pilares por dia: **segunda = engenharia**, **quarta = pme**, **sexta = bastidores**.

## Componentes no repositório

| Arquivo | Função |
|---|---|
| `app/blog/posts/*.mdx` | Posts (frontmatter + corpo Markdown) |
| `lib/blog.ts` | Lê os MDX no build e expõe `getAllPosts` / `getPostBySlug` |
| `scripts/extract-post-meta.mjs` | Extrai o frontmatter em JSON (usado pela Action) |
| `.github/workflows/publish-social.yml` | Detecta post novo e dispara o webhook do n8n |
| `docs/n8n-workflows/editorial-automation.json` | Workflow n8n importável (Fluxos A e B) |

### Frontmatter obrigatório

```yaml
---
title: "Título do artigo"
slug: "slug-do-artigo"
excerpt: "Resumo de 2-3 linhas para SEO e redes sociais."
pillar: "pme"            # pme | engenharia | bastidores
publishedAt: "2026-06-11"
author: "Marc Jaderson"
tags: ["tag1", "tag2", "tag3"]
coverImage: "/og-image.png"
---
```

> O arquivo é nomeado `YYYY-MM-DD-slug-do-artigo.mdx`. `readingTime` e os campos
> de autor (role/avatar) são derivados automaticamente em `lib/blog.ts` — não vão
> no frontmatter.

## Variáveis de ambiente

### n8n (Settings → Environment Variables)

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da Claude API |
| `GITHUB_TOKEN` | PAT com `contents:write` no repo `jadersonmarc/spa-sapienza` |
| `INSTAGRAM_ACCOUNT_ID` | ID da conta Instagram Business |
| `INSTAGRAM_ACCESS_TOKEN` | Token de longa duração do Facebook Graph API |
| `LINKEDIN_ACCESS_TOKEN` | Token OAuth 2.0 (escopo `w_member_social`) |
| `LINKEDIN_AUTHOR_URN` | `urn:li:person:XXXX` do autor |
| `N8N_WEBHOOK_SECRET` | Token compartilhado com a GitHub Action |

> ⚠️ **`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` (obrigatório).** A partir do n8n 2.x
> essa trava vem **ligada por padrão** e bloqueia o acesso a `$env.*` dentro de
> expressões de nós. Como **todo** o workflow lê credenciais via `$env`
> (`Validar X-Webhook-Secret`, `Claude API`, `GitHub`, `Instagram`, `LinkedIn`),
> sem essa flag o fluxo quebra logo no `IF` com `ExpressionError: access to env
> vars denied`. Defina `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` no serviço do n8n
> (Coolify → Environment Variables) e **reinicie o container** — a variável só
> passa a valer após o restart.

### GitHub (Settings → Secrets and variables → Actions)

| Secret | Descrição |
|---|---|
| `N8N_SOCIAL_WEBHOOK_URL` | URL do webhook do Fluxo B (path `editorial-social`) |
| `N8N_WEBHOOK_SECRET` | Mesmo valor configurado no n8n |

## Pré-requisitos — Instagram (conta Business obrigatória)

1. Converter o perfil do Instagram em **conta Business** (ou Creator) e vinculá-lo
   a uma **Página do Facebook**.
2. No [Meta for Developers](https://developers.facebook.com/), criar um app
   (tipo *Business*) e adicionar o produto **Instagram Graph API**.
3. **Permissões (escopos) obrigatórias** — todas precisam aparecer como
   `granted` em `GET /me/permissions`:
   - `instagram_basic` — ler a conta IG (sem isso, não acha o account id)
   - `instagram_content_publish` — publicar no feed (sem isso, 400 ao publicar)
   - `pages_show_list`, `pages_read_engagement`, `business_management`
   > Confirme com:
   > `GET https://graph.facebook.com/v19.0/me/permissions?access_token=TOKEN`.
   > Faltando `instagram_basic`/`instagram_content_publish`, **regere o token**
   > marcando esses escopos no consentimento.
4. **Descobrir o `INSTAGRAM_ACCOUNT_ID` (NÃO é o id da Página):**
   ```bash
   curl -s -G "https://graph.facebook.com/v19.0/me/accounts" \
     --data-urlencode "fields=name,id,instagram_business_account{id,username}" \
     --data-urlencode "access_token=TOKEN"
   ```
   Use o `instagram_business_account.id` retornado (ex.: `17841425750226538`) —
   **não** o `id` da Página. Se `data` vier vazio (`[]`), nenhuma Página foi
   selecionada no consentimento: refaça o OAuth e marque a Página.
5. **Gerar um token que não expira** (recomendado para produção). O token do
   Graph API Explorer dura ~1-2h; troque-o por um **Page token** permanente:
   ```bash
   # a) short-lived -> long-lived user token (~60 dias)
   curl -s -G "https://graph.facebook.com/v19.0/oauth/access_token" \
     --data-urlencode "grant_type=fb_exchange_token" \
     --data-urlencode "client_id=APP_ID" \
     --data-urlencode "client_secret=APP_SECRET" \
     --data-urlencode "fb_exchange_token=SHORT_LIVED_TOKEN"

   # b) com o long-lived, pegar o Page token (expires_at: 0 = nunca expira)
   curl -s -G "https://graph.facebook.com/v19.0/me/accounts" \
     --data-urlencode "fields=name,access_token,instagram_business_account{id}" \
     --data-urlencode "access_token=LONG_LIVED_USER_TOKEN"
   ```
   Use o `access_token` da Página (item *b*) como `INSTAGRAM_ACCESS_TOKEN`.
   Confirme a validade com
   `GET /debug_token?input_token=PAGE_TOKEN&access_token=APP_ID|APP_SECRET` —
   o Page token deve vir `expires_at: 0`.
   > O `data_access_expires_at` (~90 dias) é uma janela separada do Meta: o token
   > não expira, mas se um dia o IG voltar a dar erro de auth, refaça a troca
   > acima. **Nunca commite App Secret ou tokens** — só no env do Coolify.

## Pré-requisitos — LinkedIn

1. Criar um app no [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
   vinculado a uma Página da empresa.
2. Solicitar o produto **Share on LinkedIn** / **Sign In with LinkedIn** para
   obter o escopo **`w_member_social`**.
3. Rodar o fluxo OAuth 2.0 (authorization code) e guardar o `access_token`.
   **O token expira (~60 dias)** — documente a renovação via `refresh_token`.
4. Obter o **`LINKEDIN_AUTHOR_URN`**: `GET /v2/userinfo` (ou `/v2/me`) →
   monte `urn:li:person:{sub}`.

## Como gerar o `GITHUB_TOKEN`

Fine-grained PAT com acesso **apenas** ao repo `jadersonmarc/spa-sapienza` e
permissão **Contents: Read and write**. Nada além disso é necessário (o commit
via API na `main` já dispara Coolify e Action).

## Como importar o workflow no n8n

n8n → menu (canto superior direito) → **Import from File** →
`docs/n8n-workflows/editorial-automation.json`. Depois configure as variáveis de
ambiente acima e ative o workflow. O webhook do Fluxo B ficará em
`https://SEU-N8N/webhook/editorial-social` — use essa URL no secret
`N8N_SOCIAL_WEBHOOK_URL`.

> O arquivo traz os dois fluxos no mesmo workflow. Se preferir, separe em dois
> workflows (um por trigger) — basta exportar cada grupo de nós.

## Como testar sem publicar (dry run)

- **Fluxo A**: abra o workflow e execute manualmente até o nó *Build MDX +
  GitHub Payload* (desabilite *GitHub: criar arquivo*). Inspecione o MDX montado.
- **Fluxo B**: desabilite os nós *Instagram* e *LinkedIn* e dispare o webhook
  com um payload de exemplo; confira *Build Captions*.
- **Script local**:
  `node scripts/extract-post-meta.mjs app/blog/posts/<arquivo>.mdx`.

## Robustez opcional

No nó *Claude API*, adicionar `output_config.format` (json_schema) ao body
garante JSON válido independentemente do prompt — recomendado se houver falhas
de parse no nó *Build MDX*.

## Troubleshooting

| Sintoma | Causa provável / solução |
|---|---|
| `ExpressionError: access to env vars denied` (qualquer nó com `$env`) | Trava `N8N_BLOCK_ENV_ACCESS_IN_NODE` ligada. Defina `=false` no env do n8n e reinicie o container. |
| `JSON.parse` falha em *Build MDX* | Claude devolveu texto fora do JSON. O nó já remove cercas ```` ``` ````; se persistir, use `output_config.format`. |
| Instagram 400 `Cannot parse access token` (code 190) | Tipo de token errado. O endpoint `graph.facebook.com` exige token do Facebook (`EAA…`); tokens `IGAA…` (Instagram Login) só funcionam em `graph.instagram.com`. |
| Instagram 400 `Object with ID … does not exist` (code 100) | `INSTAGRAM_ACCOUNT_ID` errado (provavelmente o id da Página). Use o `instagram_business_account.id` — ver passo 4 dos pré-requisitos. |
| Instagram 400 `media_type`/`image_url` | `image_url` precisa ser HTTPS público. O default `/og-image.png` resolve; confirme que o domínio responde. |
| Instagram falha sem erro claro | Conta não é Business, ou token sem `instagram_content_publish`. Cheque `GET /me/permissions`. |
| LinkedIn 401 | Token expirado — renove via `refresh_token`. |
| LinkedIn 422 `author` | `LINKEDIN_AUTHOR_URN` ausente ou mal formado (`urn:li:person:...`). |
| Webhook 404 `"... is not registered"` (produção ou teste) | No **n8n 2.x** ativar o toggle não basta: é preciso **Publicar** o workflow. Draft não registra o webhook de produção e o boot loga `0 published workflows`. Clique em **Publish** no editor. |
| Webhook 500 `{"code":0,"message":"No item to return was found"}` | `X-Webhook-Secret` não bate com `N8N_WEBHOOK_SECRET` → IF cai no ramo *false* (sem nós) e o `responseMode: lastNode` não tem item pra retornar. Confira se o secret enviado = env do n8n. Resposta 200 com `urn:li:share:...` = ciclo OK. |
| Action não dispara | O push precisa **adicionar** arquivo em `app/blog/posts/*.mdx`; edição de arquivo existente também dispara, mas a detecção usa `--diff-filter=A` (apenas adições). |
| GitHub API 409/422 | Arquivo já existe (slug repetido) ou `branch` inválida. |
