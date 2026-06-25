"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { ACTIVE_TENANT_COOKIE, accessibleTenants } from "@/lib/agent/tenant"

// Define o tenant ativo (cookie), validando que o usuário pode acessá-lo.
export async function setActiveTenant(tenantId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("não autenticado")

  const allowed = await accessibleTenants()
  if (!allowed.some((t) => t.id === tenantId)) {
    throw new Error("tenant não permitido")
  }

  ;(await cookies()).set(ACTIVE_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  revalidatePath("/admin")
}
