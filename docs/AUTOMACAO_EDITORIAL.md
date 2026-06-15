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

### GitHub (Settings → Secrets and variables → Actions)

| Secret | Descrição |
|---|---|
| `N8N_SOCIAL_WEBHOOK_URL` | URL do webhook do Fluxo B (path `editorial-social`) |
| `N8N_WEBHOOK_SECRET` | Mesmo valor configurado no n8n |

## Pré-requisitos — Instagram (conta Business obrigatória)

1. Converter o perfil do Instagram em **conta Business** e vinculá-lo a uma
   **Página do Facebook**.
2. No [Meta for Developers](https://developers.facebook.com/), criar um app
   (tipo *Business*) e adicionar o produto **Instagram Graph API**.
3. Obter o **`INSTAGRAM_ACCOUNT_ID`**: via Graph API Explorer,
   `GET /me/accounts` → pegue o `id` da página → `GET /{page-id}?fields=instagram_business_account`.
4. Gerar um **token de longa duração** (60 dias): troque o token de curta
   duração em `GET /oauth/access_token?grant_type=fb_exchange_token&...`.
   Programe a renovação antes de expirar.
5. Permissões necessárias: `instagram_basic`, `instagram_content_publish`,
   `pages_read_engagement`.

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
| `JSON.parse` falha em *Build MDX* | Claude devolveu texto fora do JSON. O nó já remove cercas ```` ``` ````; se persistir, use `output_config.format`. |
| Instagram 400 `media_type`/`image_url` | `image_url` precisa ser HTTPS público. O default `/og-image.png` resolve; confirme que o domínio responde. |
| Instagram falha sem erro claro | Conta não é Business, ou token sem `instagram_content_publish`. |
| LinkedIn 401 | Token expirado — renove via `refresh_token`. |
| LinkedIn 422 `author` | `LINKEDIN_AUTHOR_URN` ausente ou mal formado (`urn:li:person:...`). |
| Action não dispara | O push precisa **adicionar** arquivo em `app/blog/posts/*.mdx`; edição de arquivo existente também dispara, mas a detecção usa `--diff-filter=A` (apenas adições). |
| GitHub API 409/422 | Arquivo já existe (slug repetido) ou `branch` inválida. |
