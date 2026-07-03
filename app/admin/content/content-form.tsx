"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarkdownEditor } from "./markdown-editor"
import { BriefPanel } from "./brief-panel"
import type { FormState } from "./actions"
import { slugify } from "@/lib/content/slug"
import { VERTENTES } from "@/lib/content/vertentes"

export type ContentFormValues = {
  type: "post" | "page"
  slug: string
  /** Key da vertente selecionada (pilar p1/p2/p3 ou avulsa campanha/produto). */
  vertente: string
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
  vertente: "p1",
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
  itemId,
  autoSlug = true,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  initial?: Partial<ContentFormValues>
  submitLabel: string
  /** Presente na edição — habilita brief como revisão proposta (não sobrescreve). */
  itemId?: string
  /** Auto-slug a partir do título. Desligado em item publicado (slug congelado). */
  autoSlug?: boolean
}) {
  const v = { ...EMPTY, ...initial }
  const [state, formAction, pending] = useActionState(action, {})
  const [type, setType] = useState<"post" | "page">(v.type)
  const [vertente, setVertente] = useState(v.vertente)
  const [title, setTitle] = useState(v.title)
  const [slug, setSlug] = useState(v.slug)
  const [slugTouched, setSlugTouched] = useState(false)
  const [excerpt, setExcerpt] = useState(v.excerpt)
  const [body, setBody] = useState(v.bodyMarkdown)
  const [seoKeywords, setSeoKeywords] = useState(v.seoKeywords)

  function onTitleChange(next: string) {
    setTitle(next)
    // Auto-slug só daqui pra frente: item publicado tem o slug congelado.
    if (autoSlug && !slugTouched) setSlug(slugify(next))
  }

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-4">
      <BriefPanel
        vertenteKey={vertente}
        itemId={itemId}
        onFill={(d) => {
          setTitle(d.title)
          if (autoSlug && !slugTouched) setSlug(slugify(d.title))
          setExcerpt(d.excerpt)
          setBody(d.bodyMarkdown)
          setSeoKeywords((d.keywords ?? []).join(", "))
        }}
      />

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
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugTouched(true)
            }}
            required
            className={field}
          />
          {!autoSlug ? (
            <span className="text-xs text-muted-foreground">
              Slug congelado (item publicado) — alterar quebra a URL/SEO.
            </span>
          ) : null}
        </label>
      </div>

      {type === "post" ? (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Vertente</span>
          <select
            name="vertente"
            value={vertente}
            onChange={(e) => setVertente(e.target.value)}
            className={field}
          >
            <optgroup label="Pilares (blog)">
              {VERTENTES.filter((x) => x.kind === "pilar").map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Avulsas (/campanhas)">
              {VERTENTES.filter((x) => x.kind !== "pilar").map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Título</span>
        <input
          name="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Resumo (excerpt)</span>
        <input
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={field}
        />
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
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
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
