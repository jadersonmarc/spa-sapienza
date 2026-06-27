"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MediaGrid, fileNameFromKey, type MediaObject } from "./media-grid"
import { prefixFor, R2_PURPOSES, type R2Purpose } from "@/lib/storage/keys"
import { destKeyForMove, destKeyForRename } from "@/lib/content/media-usage"

const FOLDER_LABEL: Record<R2Purpose, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  article: "Artigos",
  page: "Páginas",
  editor: "Editor",
  geral: "Geral",
}

type Confirm = { key: string; action: "delete" | "move"; destKey?: string; msg: string }

function usageMsg(inUse: { total: number; social: number; markdown: number }): string {
  return `Em uso (${inUse.social} post(s), ${inUse.markdown} no conteúdo). Confirmar mesmo assim?`
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
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [renamingKey, setRenamingKey] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [confirm, setConfirm] = useState<Confirm | null>(null)
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
    setConfirm(null)
    setRenamingKey(null)
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

  async function doDelete(key: string, confirmed = false) {
    setBusyKey(key)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/media?key=${encodeURIComponent(key)}${confirmed ? "&confirm=1" : ""}`,
        { method: "DELETE" },
      )
      const data = (await res.json()) as { ok?: boolean; inUse?: { total: number; social: number; markdown: number }; error?: string }
      if (res.status === 409 && data.inUse) {
        setConfirm({ key, action: "delete", msg: usageMsg(data.inUse) })
        return
      }
      if (!res.ok) {
        setError(data.error ?? "Falha ao excluir.")
        return
      }
      setObjects((prev) => prev.filter((o) => o.key !== key))
      setConfirm(null)
    } catch {
      setError("Falha ao excluir.")
    } finally {
      setBusyKey(null)
    }
  }

  async function doMove(srcKey: string, destKey: string, confirmed = false) {
    setBusyKey(srcKey)
    setError(null)
    try {
      const res = await fetch("/api/admin/media/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ srcKey, destKey, confirm: confirmed }),
      })
      const data = (await res.json()) as { url?: string; key?: string; inUse?: { total: number; social: number; markdown: number }; error?: string }
      if (res.status === 409 && data.inUse) {
        setConfirm({ key: srcKey, action: "move", destKey, msg: usageMsg(data.inUse) })
        return
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Falha ao mover.")
        return
      }
      const stillHere = destKey.startsWith(`${prefixFor(folder)}/`)
      setObjects((prev) =>
        stillHere
          ? prev.map((o) => (o.key === srcKey ? { key: data.key ?? destKey, url: data.url! } : o))
          : prev.filter((o) => o.key !== srcKey),
      )
      setConfirm(null)
      setRenamingKey(null)
    } catch {
      setError("Falha ao mover.")
    } finally {
      setBusyKey(null)
    }
  }

  function cardActions(o: MediaObject) {
    const busy = busyKey === o.key
    return (
      <div className="flex w-full flex-col gap-1">
        {renamingKey === o.key ? (
          <div className="flex flex-wrap items-center gap-1">
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => doMove(o.key, destKeyForRename(o.key, renameValue))}
            >
              Salvar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRenamingKey(null)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            <Button type="button" size="sm" variant="outline" onClick={() => copyUrl(o.url)}>
              {copied === o.url ? "Copiado!" : "Copiar"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setRenamingKey(o.key)
                setRenameValue(fileNameFromKey(o.key))
              }}
            >
              Renomear
            </Button>
            <select
              aria-label="Mover para pasta"
              defaultValue=""
              disabled={busy}
              onChange={(e) => {
                const target = e.target.value as R2Purpose
                e.currentTarget.value = ""
                if (target) doMove(o.key, destKeyForMove(o.key, target))
              }}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="">Mover…</option>
              {R2_PURPOSES.filter((p) => p !== folder).map((p) => (
                <option key={p} value={p}>
                  {FOLDER_LABEL[p]}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() => doDelete(o.key)}
            >
              Excluir
            </Button>
          </div>
        )}
        {confirm?.key === o.key ? (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-amber-700 dark:text-amber-300">{confirm.msg}</span>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() =>
                confirm.action === "delete"
                  ? doDelete(o.key, true)
                  : doMove(o.key, confirm.destKey!, true)
              }
            >
              Confirmar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirm(null)}>
              Cancelar
            </Button>
          </div>
        ) : null}
      </div>
    )
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
          <MediaGrid objects={objects} actions={cardActions} />
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
