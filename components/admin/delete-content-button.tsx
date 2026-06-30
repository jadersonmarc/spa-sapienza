"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteContentAction } from "@/app/admin/content/actions"

// Exclui um conteúdo com confirmação e feedback de erro (a action retorna
// { error } em vez de falhar em silêncio).
export function DeleteContentButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onClick() {
    if (!window.confirm(`Excluir "${title}"? Esta ação é irreversível.`)) return
    setError(null)
    startTransition(async () => {
      const res = await deleteContentAction(id)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={onClick}
      >
        {pending ? "Excluindo…" : "Excluir"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}
