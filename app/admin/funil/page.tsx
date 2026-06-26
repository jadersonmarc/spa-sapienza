import { listContacts, listPipeline } from "@/lib/agent/client"
import type { Contact, Stage } from "@/lib/agent/types"
import { FunnelBoard } from "./funnel-board"

export default async function FunnelPage() {
  let contacts: Contact[] = []
  let stages: Stage[] = []
  let failed = false
  try {
    ;[contacts, stages] = await Promise.all([listContacts({ limit: 500 }), listPipeline()])
  } catch {
    failed = true
  }

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="font-display text-xl font-semibold">Funil</h1>
        <p className="text-sm text-muted-foreground">Contatos por estágio do tenant ativo.</p>
      </header>

      {failed ? (
        <p className="text-sm text-red-500">
          Não foi possível carregar o funil. Verifique se o motor está acessível.
        </p>
      ) : stages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum estágio configurado para este tenant.
        </p>
      ) : (
        <FunnelBoard stages={stages} contacts={contacts} />
      )}
    </div>
  )
}
