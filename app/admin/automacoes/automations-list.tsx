"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { deleteAutomationAction, setEnabledAction } from "./actions"
import type { Automation } from "@/lib/agent/types"

type KeywordTrigger = { keywords?: string[] }
type OffHoursTrigger = { timezone?: string; weekdays?: number[]; start?: string; end?: string }
type ActionShape = { reply?: string; handoff?: boolean }

const TYPE_LABEL: Record<string, string> = {
  keyword: "Palavra-chave",
  off_hours: "Fora de horário",
  welcome: "Boas-vindas",
}

function triggerSummary(a: Automation): string {
  if (a.type === "keyword") {
    const t = a.trigger as KeywordTrigger
    return (t.keywords ?? []).join(", ")
  }
  if (a.type === "off_hours") {
    const t = a.trigger as OffHoursTrigger
    return `${t.start ?? "?"}–${t.end ?? "?"} · dias ${(t.weekdays ?? []).join(",")} · ${t.timezone ?? ""}`
  }
  return "primeira mensagem do contato"
}

function actionSummary(a: Automation): string {
  const ac = a.action as ActionShape
  const parts: string[] = []
  if (ac.reply) parts.push("responde")
  if (ac.handoff) parts.push("handoff")
  return parts.join(" + ") || "—"
}

function Row({ a }: { a: Automation }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const toggle = (enabled: boolean) =>
    startTransition(async () => {
      await setEnabledAction(a, enabled)
      router.refresh()
    })

  const remove = () => {
    if (!confirm("Excluir esta automação?")) return
    startTransition(async () => {
      await deleteAutomationAction(a.id)
      router.refresh()
    })
  }

  return (
    <li className="flex items-center justify-between gap-3 p-3">
      <div className="min-w-0">
        <span className="block text-sm font-medium">
          {TYPE_LABEL[a.type] ?? a.type}{" "}
          <span className="font-mono text-xs text-muted-foreground">#{a.position}</span>
        </span>
        <span className="block truncate text-xs text-muted-foreground">{triggerSummary(a)}</span>
        <span className="block text-xs text-muted-foreground">ação: {actionSummary(a)}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={a.enabled}
            disabled={pending}
            onChange={(e) => toggle(e.target.checked)}
          />
          ativa
        </label>
        <Button size="sm" variant="outline" onClick={remove} disabled={pending}>
          Excluir
        </Button>
      </div>
    </li>
  )
}

export function AutomationsList({ automations }: { automations: Automation[] }) {
  if (automations.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma automação ainda.</p>
  }
  return (
    <ul className="divide-y divide-border rounded-md border border-border">
      {automations.map((a) => (
        <Row key={a.id} a={a} />
      ))}
    </ul>
  )
}
