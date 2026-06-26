"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { createAutomationAction, type AutomationState } from "./actions"

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function AutomationForm() {
  const [type, setType] = useState("keyword")
  const [state, action, pending] = useActionState<AutomationState, FormData>(createAutomationAction, {})

  return (
    <form action={action} className="space-y-4 rounded-md border border-border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo</label>
          <select name="type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            <option value="keyword">Palavra-chave</option>
            <option value="off_hours">Fora de horário</option>
            <option value="welcome">Boas-vindas</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Posição (ordem)</label>
          <input name="position" type="number" defaultValue={0} className={inputCls} />
        </div>
      </div>

      {type === "keyword" && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Palavras-chave (separadas por vírgula)</label>
          <input name="keywords" className={inputCls} placeholder="humano, atendente, pessoa" />
        </div>
      )}

      {type === "off_hours" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Timezone</label>
            <input name="timezone" className={inputCls} defaultValue="America/Sao_Paulo" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Dias úteis (0=dom … 6=sáb)</label>
            <input name="weekdays" className={inputCls} placeholder="1,2,3,4,5" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Início</label>
            <input name="start" className={inputCls} placeholder="08:00" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Fim</label>
            <input name="end" className={inputCls} placeholder="18:00" />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Resposta</label>
        <textarea name="reply" rows={2} className={inputCls} placeholder="Mensagem enviada quando a regra dispara" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="handoff" /> Encaminhar para humano (handoff)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="enabled" defaultChecked /> Ativa
        </label>
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-600">Automação criada.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Criar automação"}
      </Button>
    </form>
  )
}
