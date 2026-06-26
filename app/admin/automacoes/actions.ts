"use server"

import { revalidatePath } from "next/cache"
import { createAutomation, updateAutomation, deleteAutomation } from "@/lib/agent/client"
import type { Automation } from "@/lib/agent/types"

export type AutomationState = { error?: string; ok?: boolean }

export async function createAutomationAction(
  _prev: AutomationState,
  formData: FormData,
): Promise<AutomationState> {
  const type = String(formData.get("type") ?? "")
  const reply = String(formData.get("reply") ?? "")
  const handoff = formData.get("handoff") === "on"
  const enabled = formData.get("enabled") === "on"
  const position = Number(formData.get("position") ?? 0)

  let trigger: unknown = {}
  if (type === "keyword") {
    const keywords = String(formData.get("keywords") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (keywords.length === 0) return { error: "Informe ao menos uma palavra-chave." }
    trigger = { keywords }
  } else if (type === "off_hours") {
    const weekdays = String(formData.get("weekdays") ?? "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
    trigger = {
      timezone: String(formData.get("timezone") ?? "").trim(),
      weekdays,
      start: String(formData.get("start") ?? "").trim(),
      end: String(formData.get("end") ?? "").trim(),
    }
  } else if (type !== "welcome") {
    return { error: "Tipo inválido." }
  }

  if (!reply.trim() && !handoff) return { error: "Defina uma resposta e/ou marque handoff." }

  try {
    await createAutomation({ type, trigger, action: { reply, handoff }, enabled, position })
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao criar automação." }
  }

  revalidatePath("/admin/automacoes")
  return { ok: true }
}

export async function deleteAutomationAction(id: string) {
  await deleteAutomation(id)
  revalidatePath("/admin/automacoes")
}

export async function setEnabledAction(a: Automation, enabled: boolean) {
  await updateAutomation(a.id, {
    type: a.type,
    trigger: a.trigger,
    action: a.action,
    enabled,
    position: a.position,
  })
  revalidatePath("/admin/automacoes")
}
