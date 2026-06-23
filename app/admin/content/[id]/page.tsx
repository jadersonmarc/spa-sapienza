import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  getContentItem,
  listAnalysesByRevision,
  listProposedRevisions,
  listSocialDraftsByRevision,
  type Seo,
} from "@/lib/content/queries"
import { allowedTransitions } from "@/lib/content/transition"
import { pilarFromDb } from "@/lib/blog"
import { ANALYZER_LIST } from "@/lib/ai/analyzers"
import { SOCIAL_PLATFORMS } from "@/lib/ai/social"
import { ContentForm, type ContentFormValues } from "../content-form"
import { StatusControls } from "../status-controls"
import { AnalysisPanel } from "../analysis-panel"
import { ProposalsPanel } from "../proposals-panel"
import { SocialPanel } from "../social-panel"
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
  const analyses = item.currentRevisionId
    ? await listAnalysesByRevision(item.currentRevisionId)
    : []
  const socialDrafts = item.currentRevisionId
    ? await listSocialDraftsByRevision(item.currentRevisionId)
    : []
  const proposals = await listProposedRevisions(item.id)

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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Editar conteúdo</h1>
          <p className="text-sm text-muted-foreground">
            Salvar cria uma nova revisão (snapshot).
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/content/${id}/history`}>Histórico</Link>
        </Button>
      </div>

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

      <div className="mt-8">
        <ProposalsPanel itemId={item.id} proposals={proposals} />
      </div>

      {item.currentRevisionId ? (
        <div className="mt-6 flex flex-col gap-6">
          <AnalysisPanel
            itemId={item.id}
            revisionId={item.currentRevisionId}
            analyzers={ANALYZER_LIST}
            analyses={analyses}
          />
          <SocialPanel
            itemId={item.id}
            revisionId={item.currentRevisionId}
            platforms={SOCIAL_PLATFORMS}
            drafts={socialDrafts}
            pilar={pilarFromDb(item.pilar)}
            title={revision?.title ?? item.slug}
          />
        </div>
      ) : null}
    </main>
  )
}
