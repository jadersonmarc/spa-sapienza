"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MediaGrid, type MediaObject } from "./media-grid"
import { R2_PURPOSES, type R2Purpose } from "@/lib/storage/keys"

const FOLDER_LABEL: Record<R2Purpose, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  article: "Artigos",
  page: "Páginas",
  editor: "Editor",
  geral: "Geral",
}

export function MediaLibrary() {
  const [folder, setFolder] = useState<R2Purpose>(R2_PURPOSES[0])
  const [objects, setObjects] = useState<MediaObject[]>([])
  const [nextToken, setNextToken] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
    let active = true
    void Promise.resolve().then(() => {
      if (active) load()
    })
    return () => {
      active = false
    }
  }, [load])

  function changeFolder(f: R2Purpose) {
    if (f === folder) return
    setObjects([])
    setNextToken(undefined)
    setLoading(true)
    setError(null)
    setFolder(f)
  }

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
    } catch {
      setError("Falha no upload.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(url)
      setTimeout(() => setCopied((c) => (c === url ? null : c)), 1500)
    } catch {
      /* clipboard indisponível */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Pastas">
        {R2_PURPOSES.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={p === folder}
            onClick={() => changeFolder(p)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              p === folder
                ? "bg-foreground/[0.06] font-medium text-foreground"
                : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
            )}
          >
            {FOLDER_LABEL[p]}
          </button>
        ))}
      </div>

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
        <span className="font-mono text-xs text-muted-foreground">{FOLDER_LABEL[folder]}</span>
      </div>

      {warning ? <p className="text-xs text-amber-700 dark:text-amber-300">{warning}</p> : null}
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}

      {loading && objects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Carregando imagens…</p>
      ) : objects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma imagem nesta pasta ainda.</p>
      ) : (
        <>
          <MediaGrid
            objects={objects}
            actions={(o) => (
              <Button type="button" variant="outline" size="sm" onClick={() => copyUrl(o.url)}>
                {copied === o.url ? "Copiado!" : "Copiar URL"}
              </Button>
            )}
          />
          {nextToken ? (
            <div>
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
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
