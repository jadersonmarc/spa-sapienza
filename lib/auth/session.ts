import { redirect } from "next/navigation"
import { auth } from "@/auth"
import type { Role } from "@/lib/auth/permissions"

export type SessionUser = { id: string; role: Role }

// Exige sessão; redireciona ao login se ausente. Server-only (usa @/auth).
export async function requireUser(): Promise<SessionUser> {
  const session = await auth()
  if (!session?.user?.id) redirect("/admin/login")
  return { id: session.user.id, role: session.user.role }
}

export { isAdmin, transitionRequiresAdmin, socialStatusRequiresAdmin } from "@/lib/auth/permissions"
export type { Role } from "@/lib/auth/permissions"
