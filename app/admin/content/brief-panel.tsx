"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { briefDraftAction, briefProposalAction } from "./brief-actions"
import type { BriefDraft } from "@/lib/ai/brief"

const field =
  "rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"

// Assistente "gerar com IA a partir do brief". Em artigo novo, preenche o editor
// (onFill); em artigo com conteúdo (itemId), cria uma revisão proposta com diff.
export function BriefPanel({
  vertenteKey,
  itemId,
  onFill,
}: {
  vertenteKey: string
  itemId?: string
  onFill: (draft: BriefDraft) => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [objetivo, setObjetivo] = useState("")
  const [pontosChave, setPontosChave] = useState("")
  const [publico, setPublico] = useState("")
  const [tom, setTom] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function generate() {
    setError(null)
    setOk(null)
    const input = { vertenteKey, objetivo, pontosChave, publico, tom }
    startTransition(async () => {
      if (itemId) {
        const res = await briefProposalAction(itemId, input)
        if (res.error) return setError(res.error)
        setOk("Proposta criada — veja em “Propostas pendentes” abaixo.")
        router.refresh()
      } else {
        const res = await briefDraftAction(input)
        if (res.error) return setError(res.error)
        if (res.draft) {
          onFill(res.draft)
          setOk("Rascunho gerado — revise os campos abaixo.")
        }
      }
    })
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
      >
        <span>✨ Gerar com IA a partir do brief</span>
        <span className="text-muted-foreground">{open ? "–" : "+"}</span>
      </button>

      {open ? (
        <div className="flex flex-col gap-3 border-t border-border p-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Objetivo / expectativa *</span>
            <textarea
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              rows={2}
              placeholder="O que este artigo precisa alcançar?"
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Pontos-chave</span>
            <textarea
              value={pontosChave}
              onChange={(e) => setPontosChave(e.target.value)}
              rows={2}
              placeholder="Tópicos que não podem faltar"
              className={field}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted-foreground">Público</span>
              <input value={publico} onChange={(e) => setPublico(e.target.value)} className={field} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted-foreground">Tom (opcional)</span>
              <input value={tom} onChange={(e) => setTom(e.target.value)} className={field} />
            </label>
          </div>

          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
          {ok ? <p className="text-sm text-primary">{ok}</p> : null}

          <div>
            <Button type="button" onClick={generate} disabled={pending}>
              {pending ? "Gerando…" : itemId ? "Gerar proposta" : "Gerar rascunho"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {itemId
              ? "Em artigo com conteúdo, a IA cria uma revisão proposta (você vê o diff antes de aceitar)."
              : "A IA preenche o editor abaixo — nada é salvo até você criar o artigo."}
          </p>
        </div>
      ) : null}
    </div>
  )
}
