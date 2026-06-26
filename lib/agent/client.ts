// Server-only de fato: depende de ./tenant (next/headers + node:crypto).
import { getActiveTenant, type ActiveTenant } from "./tenant"
import type { Conversation, Message, Contact, Stage, TenantConfig, Automation } from "./types"

export class AgentError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "AgentError"
  }
}

async function call<T>(tenant: ActiveTenant, path: string, init?: RequestInit): Promise<T> {
  const url = tenant.agentApiUrl.replace(/\/$/, "") + path
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tenant.token}`,
      ...init?.headers,
    },
    cache: "no-store",
  })
  if (!res.ok) {
    let msg = res.statusText
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      msg = body?.error?.message ?? msg
    } catch {
      /* corpo não-JSON */
    }
    throw new AgentError(res.status, msg)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

async function tenantOrThrow(): Promise<ActiveTenant> {
  const t = await getActiveTenant()
  if (!t) throw new AgentError(403, "nenhum tenant ativo para o usuário")
  return t
}

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ""
}

// ── Conversas & mensagens ────────────────────────────────────────────────────

export async function listConversations(params: { mode?: string; status?: string; limit?: number } = {}) {
  const t = await tenantOrThrow()
  return call<Conversation[]>(t, `/api/v1/conversations${qs(params)}`)
}

export async function getConversation(id: string) {
  const t = await tenantOrThrow()
  return call<Conversation>(t, `/api/v1/conversations/${id}`)
}

export async function listMessages(id: string, params: { after?: string; limit?: number } = {}) {
  const t = await tenantOrThrow()
  return call<Message[]>(t, `/api/v1/conversations/${id}/messages${qs(params)}`)
}

export async function sendMessage(id: string, content: string) {
  const t = await tenantOrThrow()
  return call<Message>(t, `/api/v1/conversations/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  })
}

export async function handoff(id: string, mode: "bot" | "human") {
  const t = await tenantOrThrow()
  return call<Conversation>(t, `/api/v1/conversations/${id}/handoff`, {
    method: "POST",
    body: JSON.stringify({ mode }),
  })
}

export async function suggest(id: string) {
  const t = await tenantOrThrow()
  return call<{ suggestion: string }>(t, `/api/v1/conversations/${id}/suggest`, { method: "POST" })
}

// ── Contatos & funil ─────────────────────────────────────────────────────────

export async function listContacts(params: { stage_id?: string; limit?: number } = {}) {
  const t = await tenantOrThrow()
  return call<Contact[]>(t, `/api/v1/contacts${qs(params)}`)
}

export async function patchContact(
  id: string,
  body: { name?: string; stage_id?: string; consent?: boolean },
) {
  const t = await tenantOrThrow()
  return call<Contact>(t, `/api/v1/contacts/${id}`, { method: "PATCH", body: JSON.stringify(body) })
}

export async function deleteContact(id: string) {
  const t = await tenantOrThrow()
  return call<void>(t, `/api/v1/contacts/${id}`, { method: "DELETE" })
}

export async function listPipeline() {
  const t = await tenantOrThrow()
  return call<Stage[]>(t, `/api/v1/pipeline`)
}

// ── Config do tenant (rota usa o id do tenant NO MOTOR) ──────────────────────

export async function getConfig() {
  const t = await tenantOrThrow()
  return call<TenantConfig>(t, `/api/v1/tenants/${t.motorTenantId}/config`)
}

export async function putConfig(body: Partial<TenantConfig>) {
  const t = await tenantOrThrow()
  return call<TenantConfig>(t, `/api/v1/tenants/${t.motorTenantId}/config`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

// ── Automações ───────────────────────────────────────────────────────────────

export async function listAutomations() {
  const t = await tenantOrThrow()
  return call<Automation[]>(t, `/api/v1/tenants/${t.motorTenantId}/automations`)
}

export async function createAutomation(body: {
  type: string
  trigger?: unknown
  action?: unknown
  enabled?: boolean
  position?: number
}) {
  const t = await tenantOrThrow()
  return call<Automation>(t, `/api/v1/tenants/${t.motorTenantId}/automations`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateAutomation(
  id: string,
  body: { type: string; trigger?: unknown; action?: unknown; enabled?: boolean; position?: number },
) {
  const t = await tenantOrThrow()
  return call<Automation>(t, `/api/v1/automations/${id}`, { method: "PUT", body: JSON.stringify(body) })
}

export async function deleteAutomation(id: string) {
  const t = await tenantOrThrow()
  return call<void>(t, `/api/v1/automations/${id}`, { method: "DELETE" })
}
