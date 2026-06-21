"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarkdownEditor } from "./markdown-editor"
import type { FormState } from "./actions"

const PILAR_OPTIONS = [
  { value: "p1", label: "P1 — Engenharia + IA" },
  { value: "p2", label: "P2 — Negócio / PME" },
  { value: "p3", label: "P3 — Bastidores" },
]

export type ContentFormValues = {
  type: "post" | "page"
  slug: string
  pilar: "p1" | "p2" | "p3" | null
  title: string
  excerpt: string
  bodyMarkdown: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
}

const EMPTY: ContentFormValues = {
  type: "post",
  slug: "",
  pilar: "p1",
  title: "",
  excerpt: "",
  bodyMarkdown: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
}

const field =
  "rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"

export function ContentForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: Partial<ContentFormValues>
  submitLabel: string
}) {
  const v = { ...EMPTY, ...initial }
  const [state, formAction, pending] = useActionState(action, {})
  const [type, setType] = useState<"post" | "page">(v.type)
  const [body, setBody] = useState(v.bodyMarkdown)

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Tipo</span>
          <select
            name="type"
            defaultValue={v.type}
            onChange={(e) => setType(e.target.value as "post" | "page")}
            className={field}
          >
            <option value="post">Post (blog)</option>
            <option value="page">Página</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Slug</span>
          <input name="slug" defaultValue={v.slug} required className={field} />
        </label>
      </div>

      {type === "post" ? (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Pilar</span>
          <select name="pilar" defaultValue={v.pilar ?? "p1"} className={field}>
            {PILAR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Título</span>
        <input name="title" defaultValue={v.title} required className={field} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Resumo (excerpt)</span>
        <input name="excerpt" defaultValue={v.excerpt} className={field} />
      </label>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Corpo (Markdown)</span>
        <MarkdownEditor value={body} onChange={setBody} />
        <input type="hidden" name="bodyMarkdown" value={body} />
      </div>

      <fieldset className="flex flex-col gap-4 rounded-md border border-border p-4">
        <legend className="px-1 text-sm text-muted-foreground">SEO</legend>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Título SEO</span>
          <input name="seoTitle" defaultValue={v.seoTitle} className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Descrição SEO</span>
          <input
            name="seoDescription"
            defaultValue={v.seoDescription}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">
            Keywords (separadas por vírgula)
          </span>
          <input
            name="seoKeywords"
            defaultValue={v.seoKeywords}
            className={field}
          />
        </label>
      </fieldset>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/content">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
