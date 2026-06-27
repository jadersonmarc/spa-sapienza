"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { MediaPicker } from "./media-picker"
import { setContentCoverAction } from "@/app/admin/content/actions"

// Define a capa editorial do artigo a partir da biblioteca (pasta `article`).
// Persiste via server action; a OG do blog e o topo do post usam essa URL.
export function CoverSelector({
  itemId,
  initialUrl,
}: {
  itemId: string
  initialUrl?: string | null
}) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null)
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function persist(next: string | null) {
    setError(null)
    startTransition(async () => {
      const res = await setContentCoverAction(itemId, next)
      if (res?.error) {
        setError(res.error)
        return
      }
      setUrl(next)
      setPicking(false)
    })
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold text-foreground">Capa do artigo</h2>
        <span className="font-mono text-xs text-muted-foreground">articles/</span>
      </div>

      {url ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Capa do artigo"
            className="max-h-48 w-full rounded-md border border-border object-cover"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => setPicking((v) => !v)}>
              {picking ? "Fechar biblioteca" : "Trocar capa"}
            </Button>
            <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={() => persist(null)}>
              Remover capa
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Sem capa — a OG do blog usa o layout tipográfico da marca.
          </p>
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => setPicking((v) => !v)}>
            {picking ? "Fechar" : "Definir capa"}
          </Button>
        </div>
      )}

      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}

      {picking ? (
        <MediaPicker folder="article" onSelect={persist} selectedUrl={url ?? undefined} />
      ) : null}
    </section>
  )
}
