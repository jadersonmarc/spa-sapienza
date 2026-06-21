"use server"

import bcrypt from "bcryptjs"
import { requireUser } from "@/lib/auth/session"
import { validatePasswordStrength } from "@/lib/auth/password"
import { getUserCredById, updateUserPassword } from "@/lib/content/queries"

export type AccountFormState = { error?: string; ok?: boolean }

export async function changePasswordAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await requireUser()
  const current = String(formData.get("current") ?? "")
  const next = String(formData.get("next") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (next !== confirm) return { error: "A confirmação não bate com a nova senha." }
  const weak = validatePasswordStrength(next)
  if (weak) return { error: weak }

  const cred = await getUserCredById(user.id)
  if (!cred) return { error: "Usuário não encontrado." }

  const ok = await bcrypt.compare(current, cred.passwordHash)
  if (!ok) return { error: "Senha atual incorreta." }
  if (await bcrypt.compare(next, cred.passwordHash)) {
    return { error: "A nova senha deve ser diferente da atual." }
  }

  const hash = await bcrypt.hash(next, 12)
  await updateUserPassword(user.id, hash) // também invalida sessões antigas (session_version++)
  return { ok: true }
}
