import { listAutomations } from "@/lib/agent/client"
import type { Automation } from "@/lib/agent/types"
import { AutomationsList } from "./automations-list"
import { AutomationForm } from "./automation-form"

export default async function AutomacoesPage() {
  let automations: Automation[] = []
  let failed = false
  try {
    automations = await listAutomations()
  } catch {
    failed = true
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header className="space-y-1">
        <h1 className="font-display text-xl font-semibold">Automações</h1>
        <p className="text-sm text-muted-foreground">
          Regras avaliadas no inbound (em ordem de posição); a primeira que casa dispara e
          interrompe o bot.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Ativas e inativas</h2>
        {failed ? (
          <p className="text-sm text-red-500">
            Não foi possível carregar as automações. Verifique se o motor está acessível.
          </p>
        ) : (
          <AutomationsList automations={automations} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Nova automação</h2>
        <AutomationForm />
      </section>
    </div>
  )
}
