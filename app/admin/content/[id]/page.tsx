import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getContentItem, type Seo } from "@/lib/content/queries"
import { allowedTransitions } from "@/lib/content/transition"
import { ContentForm, type ContentFormValues } from "../content-form"
import { StatusControls } from "../status-controls"
import { saveContentAction } from "../actions"

export const metadata: Metadata = {
  title: "Editar conteúdo — Admin",
  robots: { index: false, follow: false },
}

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getContentItem(id)
  if (!data) notFound()

  const { item, revision } = data
  const seo = (revision?.seo ?? {}) as Seo

  const initial: Partial<ContentFormValues> = {
    type: item.type,
    slug: item.slug,
    pilar: item.pilar,
    title: revision?.title ?? "",
    excerpt: revision?.excerpt ?? "",
    bodyMarkdown: revision?.bodyMarkdown ?? "",
    seoTitle: seo.title ?? "",
    seoDescription: seo.description ?? "",
    seoKeywords: (seo.keywords ?? []).join(", "),
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold">Editar conteúdo</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Salvar cria uma nova revisão (snapshot).
      </p>

      <div className="mb-6">
        <StatusControls
          itemId={item.id}
          status={item.status}
          allowed={allowedTransitions(item.status)}
        />
      </div>

      <ContentForm
        action={saveContentAction.bind(null, id)}
        initial={initial}
        submitLabel="Salvar revisão"
      />
    </main>
  )
}
