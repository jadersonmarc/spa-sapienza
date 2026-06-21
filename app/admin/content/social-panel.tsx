"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { allowedSocialTransitions } from "@/lib/content/social-status"
import type { SocialStatus } from "@/lib/content/queries"
import {
  deleteSocialAction,
  generateSocialAction,
  postSocialAction,
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
  postUrl: string | null
  createdAt: Date
}

export function SocialPanel({
  itemId,
  revisionId,
  platforms,
  drafts,
}: {
  itemId: string
  revisionId: string
  platforms: { platform: string; label: string }[]
  drafts: Draft[]
}) {
  const [state, formAction, pending] = useActionState<SocialFormState, FormData>(
    generateSocialAction,
    {},
  )
  const [postState, postAction, posting] = useActionState<SocialFormState, FormData>(
    postSocialAction,
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
            <Button type="submit" variant="outline" size="sm" disabled={pending}>
              {pending ? "Gerando..." : `Gerar ${p.label}`}
            </Button>
          </form>
        ))}
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">{state.error}</p>
      ) : null}
      {postState.error ? (
        <p className="text-sm text-destructive" role="alert">{postState.error}</p>
      ) : null}

      {drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum post gerado nesta revisão ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {drafts.map((d) => {
            const tags = Array.isArray(d.hashtags) ? (d.hashtags as string[]) : []
            return (
              <div key={d.id} className="rounded-md border border-border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {PLATFORM_LABEL[d.platform] ?? d.platform}
                    <span className="ml-2 rounded-full bg-foreground/[0.08] px-2 py-0.5 text-xs uppercase">
                      {STATUS_LABEL[d.status]}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm">{d.body}</p>

                {tags.length ? (
                  <p className="mt-2 text-xs text-primary">
                    {tags.map((t) => `#${t}`).join(" ")}
                  </p>
                ) : null}

                {d.status === "sent" && d.postUrl ? (
                  <p className="mt-2 text-xs">
                    <a href={d.postUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Ver post publicado ↗
                    </a>
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  {allowedSocialTransitions(d.status)
                    .filter((to) => to !== "sent")
                    .map((to) => (
                      <form key={to} action={setSocialStatusAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <input type="hidden" name="to" value={to} />
                        <Button type="submit" variant="outline" size="sm">
                          {ACTION_LABEL[to]}
                        </Button>
                      </form>
                    ))}
                  {d.status === "approved" ? (
                    <form action={postAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <Button type="submit" size="sm" disabled={posting}>
                        {posting ? "Publicando..." : `Publicar no ${PLATFORM_LABEL[d.platform] ?? d.platform}`}
                      </Button>
                    </form>
                  ) : null}
                  <form action={deleteSocialAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Excluir
                    </Button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
