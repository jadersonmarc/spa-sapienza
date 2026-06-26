"use server"

import { revalidatePath } from "next/cache"
import { patchContact, deleteContact } from "@/lib/agent/client"

export async function updateContactAction(
  id: string,
  body: { name?: string; stage_id?: string; consent?: boolean },
) {
  await patchContact(id, body)
  revalidatePath("/admin/crm")
  revalidatePath("/admin/funil")
}

// LGPD — direito ao esquecimento: remove contato + conversas/mensagens (cascata no motor).
export async function deleteContactAction(id: string) {
  await deleteContact(id)
  revalidatePath("/admin/crm")
  revalidatePath("/admin/funil")
}
