"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteProjectAction } from "./actions"

export function DeleteProjectButton({ id, nome }: { id: string; nome: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onDelete() {
    if (!window.confirm(`Excluir o projeto "${nome}"? Esta ação não pode ser desfeita.`)) return
    setError(null)
    startTransition(async () => {
      const res = await deleteProjectAction(id)
      if (res.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={onDelete} disabled={pending}>
        {pending ? "Excluindo…" : "Excluir"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
