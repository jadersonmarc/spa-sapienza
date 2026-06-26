// Server-only de fato: usa next/headers + @/auth + node:crypto (via crypto.ts).
import { cookies } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"
import { db, schema } from "@/lib/db"
import { decryptToken } from "./crypto"

export const ACTIVE_TENANT_COOKIE = "active_tenant"

export type TenantOption = { id: string; name: string }

export type ActiveTenant = {
  id: string
  name: string
  agentApiUrl: string
  motorTenantId: string
  token: string // descriptografado — só use server-side
}

// Tenants que o usuário logado pode acessar (superadmin = todos).
export async function accessibleTenants(): Promise<TenantOption[]> {
  const session = await auth()
  if (!session?.user) return []

  if (session.user.isSuperadmin) {
    return db
      .select({ id: schema.agentTenants.id, name: schema.agentTenants.name })
      .from(schema.agentTenants)
      .orderBy(schema.agentTenants.name)
  }

  return db
    .select({ id: schema.agentTenants.id, name: schema.agentTenants.name })
    .from(schema.memberships)
    .innerJoin(schema.agentTenants, eq(schema.memberships.tenantId, schema.agentTenants.id))
    .where(eq(schema.memberships.userId, session.user.id))
}

// Tenant ativo (cookie `active_tenant`, com fallback no primeiro acessível).
// Retorna o token JÁ descriptografado — nunca exponha ao client.
export async function getActiveTenant(): Promise<ActiveTenant | null> {
  const options = await accessibleTenants()
  if (options.length === 0) return null

  const wanted = (await cookies()).get(ACTIVE_TENANT_COOKIE)?.value
  const chosen = options.find((o) => o.id === wanted) ?? options[0]

  const [row] = await db
    .select()
    .from(schema.agentTenants)
    .where(eq(schema.agentTenants.id, chosen.id))
    .limit(1)
  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    agentApiUrl: row.agentApiUrl,
    motorTenantId: row.motorTenantId,
    token: decryptToken(row.agentTokenEnc),
  }
}
