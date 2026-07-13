"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { slugify } from "@/lib/content/slug"
import type { FormState } from "./actions"
import type { Project } from "@/lib/content/projects"

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
const labelCls = "text-sm font-medium"

const DEGRAUS: { value: Project["degrau"]; label: string }[] = [
  { value: "presenca", label: "01 · Presença" },
  { value: "operacao", label: "02 · Operação" },
  { value: "plataforma", label: "03 · Plataforma" },
  { value: "fronteira", label: "04 · Fronteira" },
]

export function ProjectForm({
  action,
  project,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  project?: Project
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  // Slug automático do nome enquanto não editado à mão (congela em publicado).
  const frozen = project?.publicado ?? false
  const [nome, setNome] = useState(project?.nome ?? "")
  const [slug, setSlug] = useState(project?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(!!project)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className={labelCls}>Nome</label>
          <input
            name="nome"
            required
            className={inputCls}
            value={nome}
            onChange={(e) => {
              setNome(e.target.value)
              if (!slugTouched && !frozen) setSlug(slugify(e.target.value))
            }}
            placeholder="NexusAgro RJ"
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Slug</label>
          <input
            name="slug"
            required
            readOnly={frozen}
            className={inputCls}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            placeholder="nexusagro-rj"
          />
          {frozen && (
            <p className="text-xs text-muted-foreground">
              Slug congelado (projeto publicado) — valor de URL/SEO.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Resumo</label>
        <input
          name="resumo"
          className={inputCls}
          defaultValue={project?.resumo}
          placeholder="1 frase de problema resolvido, em linguagem de negócio."
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Problema</label>
        <textarea
          name="problema"
          rows={3}
          className={inputCls}
          defaultValue={project?.problema}
          placeholder="O que a empresa resolvia na mão / o gargalo que o projeto ataca."
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Stack</label>
        <textarea
          name="stack"
          rows={2}
          className={`${inputCls} font-mono`}
          defaultValue={project?.stack.join(", ")}
          placeholder="Go, Rust, gRPC, Ed25519 (uma por linha ou separadas por vírgula)"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className={labelCls}>Degrau</label>
          <select name="degrau" required className={inputCls} defaultValue={project?.degrau ?? ""}>
            <option value="" disabled>
              Selecione…
            </option>
            {DEGRAUS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Ordem</label>
          <input
            name="ordem"
            type="number"
            className={inputCls}
            defaultValue={project?.ordem ?? 0}
          />
        </div>
        <div className="flex flex-col justify-center gap-2 pt-5">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="destaque" defaultChecked={project?.destaque} />
            Destaque
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publicado" defaultChecked={project?.publicado} />
            Publicado
          </label>
        </div>
      </div>

      <details className="rounded-md border border-border p-3">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
          Estudo de caso (opcional) — página /projetos/{slug || "…"}
        </summary>
        <div className="mt-3 space-y-4">
          <div className="space-y-1">
            <label className={labelCls}>Arquitetura</label>
            <textarea name="arquitetura" rows={3} className={inputCls} defaultValue={project?.arquitetura ?? ""} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Decisões técnicas</label>
            <textarea name="decisoes" rows={3} className={inputCls} defaultValue={project?.decisoes ?? ""} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Resultado</label>
            <textarea name="resultado" rows={2} className={inputCls} defaultValue={project?.resultado ?? ""} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>URL da capa (biblioteca de mídia)</label>
            <input name="coverImageUrl" className={inputCls} defaultValue={project?.coverImage ?? ""} />
          </div>
        </div>
      </details>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : project ? "Salvar projeto" : "Criar projeto"}
      </Button>
    </form>
  )
}
