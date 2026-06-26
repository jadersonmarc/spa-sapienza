import { listContacts, listPipeline } from "@/lib/agent/client"
import type { Contact, Stage } from "@/lib/agent/types"
import { ContactsTable } from "./contacts-table"

export default async function CrmPage() {
  let contacts: Contact[] = []
  let stages: Stage[] = []
  let failed = false
  try {
    ;[contacts, stages] = await Promise.all([listContacts({ limit: 200 }), listPipeline()])
  } catch {
    failed = true
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="font-display text-xl font-semibold">Contatos</h1>
        <p className="text-sm text-muted-foreground">Leads e clientes do tenant ativo.</p>
      </header>

      {failed ? (
        <p className="text-sm text-red-500">
          Não foi possível carregar os contatos. Verifique se o motor está acessível.
        </p>
      ) : (
        <ContactsTable contacts={contacts} stages={stages} />
      )}
    </div>
  )
}
