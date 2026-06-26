"use client"

import { useActionState, useRef, useState } from "react"
import { SubmitButton } from "@/components/admin/submit-button"
import { Button } from "@/components/ui/button"
import { allowedSocialTransitions } from "@/lib/content/social-status"
import type { SocialStatus } from "@/lib/content/queries"
import {
  deleteSocialAction,
  generateSocialAction,
  postSocialAction,
  saveSocialDraftAction,
  setSocialImageAction,
  setSocialStatusAction,
  type SocialFormState,
} from "./social-actions"

const PLATFORM_LABEL: Record<string, string> = { instagram: "Instagram", linkedin: "LinkedIn" }
const STATUS_LABEL: Record<SocialStatus, string> = {
  draft: "Rascunho",
  approved: "Aprovado",
  sent: "Enviado",
}
// "sent" sai via botão Publicar (postagem real), não por mudança manual de status.
const ACTION_LABEL: Partial<Record<SocialStatus, string>> = {
  draft: "Voltar a rascunho",
  approved: "Aprovar",
}

type Draft = {
  id: string
  platform: string
  body: string
  hashtags: unknown
  status: SocialStatus
  imageUrl: string | null
  postUrl: string | null
  createdAt: Date
}

// Aspecto principal por plataforma (espelha lib/social/image.ts).
const FORMAT_BY_PLATFORM: Record<string, string> = { instagram: "ig-feed", linkedin: "li-feed" }

function previewUrl(platform: string, pilar: string, title: string): string {
  const qs = new URLSearchParams({
    archetype: "capa",
    format: FORMAT_BY_PLATFORM[platform] ?? "ig-feed",
    pilar,
    text: title,
  })
  return `/api/og?${qs.toString()}`
}

function SocialDraftCard({ draft, pilar, title }: { draft: Draft; pilar: string; title: string }) {
  const [saveState, saveAction] = useActionState<SocialFormState, FormData>(saveSocialDraftAction, {})
  const [postState, postAction] = useActionState<SocialFormState, FormData>(postSocialAction, {})
  const [imageState, setImageAction] = useActionState<SocialFormState, FormData>(setSocialImageAction, {})

  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerImages, setPickerImages] = useState<{ key: string; url: string }[]>([])
  const [pickerLoading, setPickerLoading] = useState(false)
  const [pickerError, setPickerError] = useState<string | null>(null)

  const tags = Array.isArray(draft.hashtags) ? (draft.hashtags as string[]) : []
  const label = PLATFORM_LABEL[draft.platform] ?? draft.platform
  const editable = draft.status === "draft"

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setWarning(null)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.set("file", file)
      fd.set("platform", draft.platform)
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const data = (await res.json()) as { url?: string; warning?: string | null; error?: string }
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Falha no upload.")
        return
      }
      if (data.warning) setWarning(data.warning)
      const setFd = new FormData()
      setFd.set("id", draft.id)
      setFd.set("imageUrl", data.url)
      setImageAction(setFd)
    } catch {
      setUploadError("Falha no upload.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function togglePicker() {
    const next = !pickerOpen
    setPickerOpen(next)
    if (next && pickerImages.length === 0) {
      setPickerLoading(true)
      setPickerError(null)
      try {
        const res = await fetch(`/api/admin/images?platform=${draft.platform}`)
        const data = (await res.json()) as { images?: { key: string; url: string }[]; error?: string }
        if (!res.ok) {
          setPickerError(data.error ?? "Falha ao listar imagens.")
          return
        }
        setPickerImages(data.images ?? [])
      } catch {
        setPickerError("Falha ao listar imagens.")
      } finally {
        setPickerLoading(false)
      }
    }
  }

  function pickImage(url: string) {
    const fd = new FormData()
    fd.set("id", draft.id)
    fd.set("imageUrl", url)
    setImageAction(fd)
    setPickerOpen(false)
  }

  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {label}
          <span className="ml-2 rounded-full bg-foreground/[0.08] px-2 py-0.5 text-xs uppercase">
            {STATUS_LABEL[draft.status]}
          </span>
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(draft.createdAt).toLocaleString("pt-BR")}
        </span>
      </div>

      {editable ? (
        <form action={saveAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={draft.id} />
          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Legenda
          </label>
          <textarea
            name="body"
            defaultValue={draft.body}
            rows={5}
            className="w-full rounded-md border border-border bg-background p-2 text-sm"
          />
          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Hashtags
          </label>
          <input
            name="hashtags"
            defaultValue={tags.join(" ")}
            placeholder="separadas por espaço (sem #)"
            className="w-full rounded-md border border-border bg-background p-2 font-mono text-xs"
          />
          <div className="flex items-center gap-2">
            <SubmitButton variant="outline" size="sm" pendingLabel="Salvando...">
              Salvar
            </SubmitButton>
            {saveState.ok ? (
              <span className="text-xs text-muted-foreground">Salvo.</span>
            ) : null}
            {saveState.error ? (
              <span className="text-xs text-destructive" role="alert">{saveState.error}</span>
            ) : null}
          </div>
        </form>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm">{draft.body}</p>
          {tags.length ? (
            <p className="mt-2 text-xs text-primary">{tags.map((t) => `#${t}`).join(" ")}</p>
          ) : null}
        </>
      )}

      <div className="mt-3">
        <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Card · {FORMAT_BY_PLATFORM[draft.platform] === "li-feed" ? "1:1" : "4:5"}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={draft.imageUrl ?? previewUrl(draft.platform, pilar, title)}
          alt={`Preview do card para ${label}`}
          loading="lazy"
          className="w-full max-w-[280px] rounded-md border border-border"
        />
        {editable ? (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? "Enviando..." : "Trocar imagem (upload)"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={togglePicker}
              >
                {pickerOpen ? "Fechar seleção" : "Selecionar da pasta"}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={onFile}
              />
            </div>

            {pickerOpen ? (
              pickerLoading ? (
                <span className="text-xs text-muted-foreground">Carregando imagens…</span>
              ) : pickerError ? (
                <span className="text-xs text-destructive" role="alert">{pickerError}</span>
              ) : pickerImages.length === 0 ? (
                <span className="text-xs text-muted-foreground">Nenhuma imagem nesta pasta ainda.</span>
              ) : (
                <div className="grid max-w-[280px] grid-cols-3 gap-2">
                  {pickerImages.map((img) => (
                    <button
                      key={img.key}
                      type="button"
                      onClick={() => pickImage(img.url)}
                      className="overflow-hidden rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt="Imagem da pasta"
                        loading="lazy"
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )
            ) : null}

            {warning ? (
              <span className="text-xs text-amber-700 dark:text-amber-300">{warning}</span>
            ) : null}
            {uploadError ? (
              <span className="text-xs text-destructive" role="alert">{uploadError}</span>
            ) : null}
            {imageState.error ? (
              <span className="text-xs text-destructive" role="alert">{imageState.error}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {draft.status === "sent" && draft.postUrl ? (
        <p className="mt-2 text-xs">
          <a href={draft.postUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Ver post publicado ↗
          </a>
        </p>
      ) : null}

      {postState.error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">{postState.error}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {allowedSocialTransitions(draft.status)
          .filter((to) => to !== "sent")
          .map((to) => (
            <form key={to} action={setSocialStatusAction}>
              <input type="hidden" name="id" value={draft.id} />
              <input type="hidden" name="to" value={to} />
              <SubmitButton variant="outline" size="sm">
                {ACTION_LABEL[to]}
              </SubmitButton>
            </form>
          ))}
        {draft.status === "approved" ? (
          <form action={postAction}>
            <input type="hidden" name="id" value={draft.id} />
            <SubmitButton size="sm" pendingLabel="Publicando...">
              {`Publicar no ${label}`}
            </SubmitButton>
          </form>
        ) : null}
        <form action={deleteSocialAction}>
          <input type="hidden" name="id" value={draft.id} />
          <SubmitButton variant="destructive" size="sm">
            Excluir
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}

export function SocialPanel({
  itemId,
  revisionId,
  platforms,
  drafts,
  pilar,
  title,
}: {
  itemId: string
  revisionId: string
  platforms: { platform: string; label: string }[]
  drafts: Draft[]
  pilar: string
  title: string
}) {
  const [state, formAction] = useActionState<SocialFormState, FormData>(
    generateSocialAction,
    {},
  )

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border p-4">
      <div>
        <h2 className="font-medium">Posts sociais</h2>
        <p className="text-sm text-muted-foreground">
          Gera a partir da revisão atual; revise e aprove antes do envio.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <form key={p.platform} action={formAction}>
            <input type="hidden" name="itemId" value={itemId} />
            <input type="hidden" name="revisionId" value={revisionId} />
            <input type="hidden" name="platform" value={p.platform} />
            <SubmitButton variant="outline" size="sm" pendingLabel="Gerando...">
              {`Gerar ${p.label}`}
            </SubmitButton>
          </form>
        ))}
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">{state.error}</p>
      ) : null}

      {drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum post gerado nesta revisão ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {drafts.map((d) => (
            <SocialDraftCard key={d.id} draft={d} pilar={pilar} title={title} />
          ))}
        </div>
      )}
    </div>
  )
}
