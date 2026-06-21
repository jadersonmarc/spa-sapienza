import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getContentItem, listRevisions } from "@/lib/content/queries"

export const metadata: Metadata = {
  title: "Histórico — Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

function fmt(d: Date) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getContentItem(id)
  if (!data) notFound()

  const revisions = await listRevisions(id)
  const currentId = data.item.currentRevisionId

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Histórico de revisões</h1>
          <p className="text-sm text-muted-foreground">
            {revisions.length} {revisions.length === 1 ? "revisão" : "revisões"} · /{data.item.slug}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/content/${id}`}>Voltar à edição</Link>
        </Button>
      </div>

      <Card className="divide-y divide-white/10 p-0">
        {revisions.map((rev, idx) => {
          const isCurrent = rev.id === currentId
          // O último da lista (mais antigo) não tem predecessora para diff.
          const hasDiff = idx < revisions.length - 1
          return (
            <div key={rev.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {rev.title}
                  {isCurrent ? (
                    <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                      atual
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fmt(rev.createdAt)} · {rev.authorEmail ?? "—"}
                </p>
              </div>
              {hasDiff ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/content/${id}/history/${rev.id}`}>Ver mudanças</Link>
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">revisão inicial</span>
              )}
            </div>
          )
        })}
      </Card>
    </main>
  )
}
