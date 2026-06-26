# ADMIN_SPEC — Console multi-tenant do motor WhatsApp/CRM

> Spec do console de atendimento/CRM dentro do `spa-sapienza`, consumindo a API do
> motor `rag-agente-go`. Status: **Fase 0 — aguardando revisão.** Não implementar
> Fases 1–5 antes do aceite.

## 1. Visão

O `spa-sapienza` (Next.js 16, App Router, NextAuth v5, Drizzle/Postgres) ganha um
**console multi-tenant** que opera o motor via API REST. O motor é a fonte de verdade
do CRM (schema `agent`); o admin **só fala com a API** (nunca lê o schema `agent` direto).

```
Browser (client components, polling)
  → Server Actions / Route Handlers (BFF, autenticados via NextAuth)
      → resolve tenant ativo → descriptografa o token do tenant
      → fetch no motor com Authorization: Bearer <token-do-tenant>
```

**Invariante de segurança:** o token do motor **nunca** vai ao browser. Fica
criptografado no banco do admin e só é descriptografado em código server-side.

## 2. Decisões

- **Multi-tenant (SaaS)**: usuários NextAuth ligados a tenants via `memberships`; token por-tenant criptografado no banco do admin.
- **v1**: superadmin (equipe Sapienza) opera todos os tenants. Login externo do cliente depois.
- **Tempo real**: polling (`GET .../messages?after=`).
- **UI**: shadcn/ui sob demanda (Tailwind v4 + CVA + radix-slot já presentes).
- **CRM via API**: sem duplicar o schema `agent` no Drizzle.

## 3. Modelo de dados (admin, schema `public`, Drizzle)

```ts
// users: + coluna
isSuperadmin: boolean default false   // equipe Sapienza

// agent_tenants — um cliente operável pelo console
agent_tenants {
  id uuid pk
  name text
  agent_api_url text                  // base do motor (ex.: https://api.../)
  agent_token_enc text                // token do motor, AES-256-GCM
  motor_tenant_id uuid                // id do tenant no motor (informativo)
  created_at timestamptz
}

// memberships — usuário ↔ tenant
memberships {
  user_id uuid → users.id
  tenant_id uuid → agent_tenants.id
  role text   // 'owner' | 'member'
  unique(user_id, tenant_id)
}
```

Migration via `drizzle-kit generate` (admin é dono do schema `public`). **Não** tocar no schema `agent`.

## 4. Token: storage e criptografia

- `lib/agent/crypto.ts`: AES-256-GCM. Chave em `AGENT_TOKEN_ENC_KEY` (env, 32 bytes base64).
  `encrypt(plain) -> "iv:tag:ciphertext"` (base64); `decrypt(enc) -> plain`.
- O token do motor é gerado lá (`scripts/create-token.sh`), colado na tela de Tenants e salvo **criptografado**. Nunca exibido depois.

## 5. Tenant ativo

- `lib/agent/tenant.ts`: `getActiveTenant()` (server) → resolve da sessão + cookie `active_tenant`:
  - usuário comum: primeiro/da membership; superadmin: qualquer tenant.
  - retorna `{ id, agentApiUrl, token }` (token descriptografado, só server-side).
- Tenant switcher no topbar para quem tem mais de um (ou superadmin).

## 6. Client do motor (`lib/agent/client.ts`, server-only)

`agentFetch(path, init)`: injeta `agentApiUrl` + `Authorization: Bearer <token>` do tenant ativo; normaliza erros. Wrappers tipados (`lib/agent/types.ts` espelha os DTOs do motor):

| Função | Método/rota do motor |
|---|---|
| `listConversations({mode,status,limit})` | `GET /api/v1/conversations` |
| `getConversation(id)` | `GET /api/v1/conversations/{id}` |
| `listMessages(id, {after,limit})` | `GET /api/v1/conversations/{id}/messages` |
| `sendMessage(id, content)` | `POST /api/v1/conversations/{id}/messages` |
| `handoff(id, mode)` | `POST /api/v1/conversations/{id}/handoff` |
| `suggest(id)` | `POST /api/v1/conversations/{id}/suggest` |
| `listContacts({stage_id,limit})` | `GET /api/v1/contacts` |
| `patchContact(id, body)` | `PATCH /api/v1/contacts/{id}` |
| `deleteContact(id)` | `DELETE /api/v1/contacts/{id}` |
| `listPipeline()` | `GET /api/v1/pipeline` |
| `getConfig(tenantId)` / `putConfig(tenantId, body)` | `GET|PUT /api/v1/tenants/{id}/config` |
| `listAutomations(tenantId)` / `createAutomation` | `GET|POST /api/v1/tenants/{id}/automations` |
| `updateAutomation(id)` / `deleteAutomation(id)` | `PUT|DELETE /api/v1/automations/{id}` |

> O `{id}` de config/automations-create = `motor_tenant_id` do tenant ativo.

## 7. Mapa de rotas (admin)

| Rota | Tela |
|---|---|
| `/admin/atendimento` | Inbox: lista de conversas + thread (polling), enviar/handoff/sugestão |
| `/admin/crm` | Contatos: tabela, editar, excluir (LGPD) |
| `/admin/funil` | Funil por estágio (mover contato) |
| `/admin/agente` | Editor de `tenant_config` |
| `/admin/automacoes` | CRUD de automações |
| `/admin/tenants` | (superadmin) cadastrar tenant + token, gerenciar memberships |

BFF para polling: `app/api/agent/conversations/[id]/messages/route.ts` (GET `?after=`),
autenticado por sessão, proxy server-side ao motor. Mutations via Server Actions.

## 8. Papéis

- `users.isSuperadmin`: equipe Sapienza — cadastra tenants/tokens, troca de tenant, acessa todos.
- `memberships.role` (`owner|member`): vínculo do usuário a um tenant (para login externo futuro).
- Guard de `/admin` já existe (`auth.config.ts`); adicionar checagem de membership/superadmin nas telas do console.

## 9. Env

```
AGENT_TOKEN_ENC_KEY=   # 32 bytes base64 (openssl rand -base64 32) — cripto do token do motor
```
A URL e o token do motor por-tenant ficam no banco (`agent_tenants`), não em env.

## 10. Plano de fases

1. Fundação: tabelas + migration, cripto, tenant ativo, client, auth, tela Tenants, switcher, seed.
2. Inbox (polling + ações).
3. CRM + Funil.
4. Config do agente.
5. Automações.

## 11. Verificação (E2E)

1. `npm run db:generate && db:migrate` cria as tabelas; `scripts/seed-agent-tenant.mjs` cadastra o tenant Sapienza (token do motor criptografado) + superadmin.
2. `npm run dev`; login → switcher mostra Sapienza.
3. Inbox: mensagem entra por polling; responder chega no WhatsApp (motor→Evolution); handoff pausa o bot; sugestão preenche o campo.
4. CRM/Funil: listar/editar/excluir contato; mover de estágio.
5. Config: editar system_prompt e ver efeito.
6. Automações: criar keyword→handoff e disparar via webhook do motor.
7. `npm run lint && npm test` verdes.
