import { getConfig } from "@/lib/agent/client"
import type { TenantConfig } from "@/lib/agent/types"
import { ConfigForm } from "./config-form"

export default async function AgentePage() {
  let config: TenantConfig | null = null
  try {
    config = await getConfig()
  } catch {
    config = null
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="font-display text-xl font-semibold">Agente</h1>
        <p className="text-sm text-muted-foreground">
          Comportamento do bot do tenant ativo (sem RAG: o conhecimento é o system prompt).
        </p>
      </header>

      {config ? (
        <ConfigForm config={config} />
      ) : (
        <p className="text-sm text-red-500">
          Não foi possível carregar a configuração. Verifique se o motor está acessível.
        </p>
      )}
    </div>
  )
}
