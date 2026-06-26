"use client"

import { useActionState } from "react"
import { createTenant, type CreateTenantState } from "./actions"
import { Button } from "@/components/ui/button"

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function TenantForm() {
  const [state, action, pending] = useActionState<CreateTenantState, FormData>(createTenant, {})

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium">Nome</label>
        <input name="name" required className={inputCls} placeholder="Sapienza Labs" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">URL da API do motor</label>
        <input name="agent_api_url" required className={inputCls} placeholder="https://motor.exemplo.com" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">ID do tenant no motor</label>
        <input name="motor_tenant_id" required className={inputCls} placeholder="uuid do tenant no motor" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Token do motor</label>
        <input name="token" type="password" required className={inputCls} placeholder="cole o token gerado no motor" />
        <p className="text-xs text-muted-foreground">Salvo criptografado; não será exibido depois.</p>
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-600">Tenant criado.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Criar tenant"}
      </Button>
    </form>
  )
}
