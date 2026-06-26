"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db, schema } from "@/lib/db"
import { encryptToken } from "@/lib/agent/crypto"

export type CreateTenantState = { error?: string; ok?: boolean }

export async function createTenant(
  _prev: CreateTenantState,
  formData: FormData,
): Promise<CreateTenantState> {
  const session = await auth()
  if (!session?.user?.isSuperadmin) return { error: "apenas superadmin" }

  const name = String(formData.get("name") ?? "").trim()
  const agentApiUrl = String(formData.get("agent_api_url") ?? "").trim()
  const motorTenantId = String(formData.get("motor_tenant_id") ?? "").trim()
  const token = String(formData.get("token") ?? "").trim()

  if (!name || !agentApiUrl || !motorTenantId || !token) {
    return { error: "preencha nome, URL, id do tenant no motor e token" }
  }

  try {
    await db.insert(schema.agentTenants).values({
      name,
      agentApiUrl,
      motorTenantId,
      agentTokenEnc: encryptToken(token),
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : "falha ao criar tenant" }
  }

  revalidatePath("/admin/tenants")
  revalidatePath("/admin")
  return { ok: true }
}
