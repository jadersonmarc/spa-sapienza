"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { transitionAction } from "./actions"
import type { ContentStatus } from "@/lib/content/queries"

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  scheduled: "Agendado",
  published: "Publicado",
  archived: "Arquivado",
}

const VARIANT: Partial<
  Record<ContentStatus, "default" | "outline" | "destructive" | "secondary">
> = {
  published: "default",
  archived: "destructive",
}

export function StatusControls({
  itemId,
  status,
  allowed,
}: {
  itemId: string
  status: ContentStatus
  allowed: ContentStatus[]
}) {
  const [state, formAction, pending] = useActionState(transitionAction, {})
  const [scheduledAt, setScheduledAt] = useState("")

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Status:</span>
        <span className="rounded-full bg-foreground/[0.08] px-2.5 py-0.5 text-xs font-medium uppercase">
          {STATUS_LABEL[status]}
        </span>
      </div>

      {allowed.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sem transições disponíveis.</p>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          {allowed.map((to) =>
            to === "scheduled" ? (
              <form key={to} action={formAction} className="flex items-end gap-2">
                <input type="hidden" name="itemId" value={itemId} />
                <input type="hidden" name="to" value={to} />
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Data/hora
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </label>
                <Button type="submit" variant="outline" size="sm" disabled={pending}>
                  Agendar
                </Button>
              </form>
            ) : (
              <form key={to} action={formAction}>
                <input type="hidden" name="itemId" value={itemId} />
                <input type="hidden" name="to" value={to} />
                <Button
                  type="submit"
                  variant={VARIANT[to] ?? "outline"}
                  size="sm"
                  disabled={pending}
                >
                  {to === "draft" && status !== "draft"
                    ? "Voltar a rascunho"
                    : STATUS_LABEL[to]}
                </Button>
              </form>
            ),
          )}
        </div>
      )}

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  )
}
