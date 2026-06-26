"use server"

import { revalidatePath } from "next/cache"
import { sendMessage, handoff, suggest } from "@/lib/agent/client"
import type { Message } from "@/lib/agent/types"

export async function sendMessageAction(conversationId: string, content: string): Promise<Message> {
  const msg = await sendMessage(conversationId, content)
  revalidatePath(`/admin/atendimento/${conversationId}`)
  return msg
}

export async function handoffAction(
  conversationId: string,
  mode: "bot" | "human",
): Promise<"bot" | "human"> {
  const conv = await handoff(conversationId, mode)
  revalidatePath(`/admin/atendimento/${conversationId}`)
  return conv.mode
}

export async function suggestAction(conversationId: string): Promise<string> {
  const { suggestion } = await suggest(conversationId)
  return suggestion
}
