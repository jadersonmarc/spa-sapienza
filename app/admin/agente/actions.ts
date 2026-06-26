"use server"

import { revalidatePath } from "next/cache"
import { putConfig } from "@/lib/agent/client"

export type ConfigState = { error?: string; ok?: boolean }

export async function saveConfigAction(_prev: ConfigState, formData: FormData): Promise<ConfigState> {
  const system_prompt = String(formData.get("system_prompt") ?? "")
  const tone = String(formData.get("tone") ?? "").trim()
  const fallback = String(formData.get("fallback") ?? "")
  const ai_model = String(formData.get("ai_model") ?? "").trim()
  const whatsapp_number = String(formData.get("whatsapp_number") ?? "").trim()
  const max_tokens = Number(formData.get("max_tokens") ?? 0)

  if (!system_prompt.trim()) return { error: "O system prompt é obrigatório." }
  if (!Number.isFinite(max_tokens) || max_tokens <= 0) return { error: "max_tokens inválido." }

  try {
    await putConfig({ system_prompt, tone, fallback, ai_model, whatsapp_number, max_tokens })
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao salvar a configuração." }
  }

  revalidatePath("/admin/agente")
  return { ok: true }
}
