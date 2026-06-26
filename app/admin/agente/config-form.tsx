"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { saveConfigAction, type ConfigState } from "./actions"
import type { TenantConfig } from "@/lib/agent/types"

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const MODELS = ["claude-haiku-4-5", "claude-sonnet-4-6"]

export function ConfigForm({ config }: { config: TenantConfig }) {
  const [state, action, pending] = useActionState<ConfigState, FormData>(saveConfigAction, {})

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">System prompt (o “cérebro” do bot)</label>
        <textarea
          name="system_prompt"
          required
          rows={14}
          defaultValue={config.system_prompt}
          className={`${inputCls} font-mono text-xs leading-relaxed`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tom</label>
          <input name="tone" defaultValue={config.tone} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Modelo (auto-reply)</label>
          <select name="ai_model" defaultValue={config.ai_model} className={inputCls}>
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Número WhatsApp</label>
          <input name="whatsapp_number" defaultValue={config.whatsapp_number ?? ""} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">max_tokens</label>
          <input
            name="max_tokens"
            type="number"
            min={1}
            defaultValue={config.max_tokens}
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Mensagem de fallback</label>
        <textarea name="fallback" rows={2} defaultValue={config.fallback} className={inputCls} />
      </div>

      <p className="text-xs text-muted-foreground">
        Instância Evolution: <span className="font-mono">{config.evolution_instance}</span> (fixa — chave de
        roteamento do webhook).
      </p>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-600">Configuração salva.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  )
}
