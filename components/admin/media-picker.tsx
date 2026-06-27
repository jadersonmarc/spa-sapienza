"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MediaGrid, type MediaObject } from "./media-grid"
import type { R2Purpose } from "@/lib/storage/keys"

// Seletor compartilhado: lê as imagens de uma pasta do R2 (biblioteca) e permite
// enviar uma nova pra mesma pasta. `onSelect(url)` aplica a imagem escolhida.
export function MediaPicker({
  folder,
  onSelect,
  selectedUrl,
}: {
  folder: R2Purpose
  onSelect: (url: string) => void
  selectedUrl?: string
}) {
  const [objects, setObjects] = useState<MediaObject[]>([])
  const [nextToken, setNextToken] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Sem setState síncrono antes do primeiro await (regra set-state-in-effect):
  // o loading é ligado pelo chamador (clique) quando aplicável.
  const load = useCallback(
    async (token?: string) => {
      try {
        const qs = `folder=${folder}${token ? `&token=${encodeURIComponent(token)}` : ""}`
        const res = await fetch(`/api/admin/media?${qs}`)
        const data = (await res.json()) as { objects?: MediaObject[]; nextToken?: string; error?: string }
        if (!res.ok) {
          setError(data.error ?? "Falha ao listar imagens.")
          return
        }
        setError(null)
        setObjects((prev) => (token ? [...prev, ...(data.objects ?? [])] : (data.objects ?? [])))
        setNextToken(data.nextToken)
      } catch {
        setError("Falha ao listar imagens.")
      } finally {
        setLoading(false)
      }
    },
    [folder],
  )

  useEffect(() => {
    // Chamada deferida (microtask): evita setState síncrono no corpo do effect.
    let active = true
    void Promise.resolve().then(() => {
      if (active) load()
    })
    return () => {
      active = false
    }
  }, [load])

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setWarning(null)
    setError(null)
    try {
      const fd = new FormData()
      fd.set("file", file)
      fd.set("folder", folder)
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const data = (await res.json()) as { url?: string; key?: string; warning?: string | null; error?: string }
      if (!res.ok || !data.url || !data.key) {
        setError(data.error ?? "Falha no upload.")
        return
      }
      if (data.warning) setWarning(data.warning)
      setObjects((prev) => [{ key: data.key!, url: data.url! }, ...prev])
      onSelect(data.url)
    } catch {
      setError("Falha no upload.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Enviando..." : "Enviar imagem"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={onFile}
        />
        <span className="font-mono text-xs text-muted-foreground">{folder}</span>
      </div>

      {warning ? <span className="text-xs text-amber-700 dark:text-amber-300">{warning}</span> : null}
      {error ? <span className="text-xs text-destructive" role="alert">{error}</span> : null}

      {loading && objects.length === 0 ? (
        <span className="text-xs text-muted-foreground">Carregando imagens…</span>
      ) : objects.length === 0 ? (
        <span className="text-xs text-muted-foreground">Nenhuma imagem nesta pasta ainda.</span>
      ) : (
        <>
          <MediaGrid objects={objects} onSelect={(o) => onSelect(o.url)} selectedUrl={selectedUrl} />
          {nextToken ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => {
                setLoading(true)
                void load(nextToken)
              }}
            >
              {loading ? "Carregando..." : "Carregar mais"}
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}
