import type { SocialStatus } from "@/lib/content/queries"

export type Role = "admin" | "editor"

export function isAdmin(role: Role): boolean {
  return role === "admin"
}

// Transições de status que mexem no site/são destrutivas → exigem admin.
// draft/in_review = fluxo autoral, liberado a qualquer usuário autenticado.
const ADMIN_ONLY_TARGETS = new Set(["published", "scheduled", "archived"])

export function transitionRequiresAdmin(to: string): boolean {
  return ADMIN_ONLY_TARGETS.has(to)
}

// Envio efetivo do post social → admin.
export function socialStatusRequiresAdmin(to: SocialStatus): boolean {
  return to === "sent"
}
