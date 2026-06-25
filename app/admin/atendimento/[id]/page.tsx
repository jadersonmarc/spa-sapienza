import { getConversation, listContacts, listMessages } from "@/lib/agent/client"
import type { Message } from "@/lib/agent/types"
import { ConversationThread } from "../conversation-thread"

type Loaded = { name: string; messages: Message[]; mode: "bot" | "human" }

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data: Loaded | null = null
  try {
    const conv = await getConversation(id)
    const [contacts, messages] = await Promise.all([
      listContacts({ limit: 200 }),
      listMessages(id, { limit: 50 }),
    ])
    const contact = contacts.find((c) => c.id === conv.contact_id)
    data = {
      name: contact?.name || contact?.phone || "Contato",
      messages,
      mode: conv.mode,
    }
  } catch {
    data = null
  }

  if (!data) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Não foi possível carregar a conversa (motor indisponível ou conversa de outro tenant).
      </div>
    )
  }

  return (
    <ConversationThread
      conversationId={id}
      contactName={data.name}
      initialMessages={data.messages}
      initialMode={data.mode}
    />
  )
}
