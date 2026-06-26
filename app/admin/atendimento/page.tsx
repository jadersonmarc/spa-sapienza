import Link from "next/link"
import { cn } from "@/lib/utils"
import { listConversations, listContacts } from "@/lib/agent/client"
import type { Conversation, Contact } from "@/lib/agent/types"

export default async function InboxPage() {
  let conversations: Conversation[] = []
  let contacts: Contact[] = []
  let failed = false
  try {
    ;[conversations, contacts] = await Promise.all([
      listConversations({ limit: 100 }),
      listContacts({ limit: 200 }),
    ])
  } catch {
    failed = true
  }

  const byId = new Map(contacts.map((c) => [c.id, c]))

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="font-display text-xl font-semibold">Atendimento</h1>
        <p className="text-sm text-muted-foreground">Conversas do WhatsApp do tenant ativo.</p>
      </header>

      {failed ? (
        <p className="text-sm text-red-500">
          Não foi possível carregar as conversas. Verifique se o motor está acessível para este tenant.
        </p>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {conversations.map((c) => {
            const contact = byId.get(c.contact_id)
            const name = contact?.name || contact?.phone || "Contato"
            return (
              <li key={c.id}>
                <Link
                  href={`/admin/atendimento/${c.id}`}
                  className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-foreground/[0.04]"
                >
                  <div className="min-w-0">
                    <span className="block truncate font-medium">{name}</span>
                    {contact?.name && (
                      <span className="block truncate font-mono text-xs text-muted-foreground">
                        {contact.phone}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                      c.mode === "human"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-foreground/[0.06] text-muted-foreground",
                    )}
                  >
                    {c.mode}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
