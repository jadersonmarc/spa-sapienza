import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getRevisionForDiff } from "@/lib/content/queries"
import { diffStats, lineDiff } from "@/lib/content/diff"

export const metadata: Metadata = {
  title: "Diff — Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

function FieldChange({ label, before, after }: { label: string; before: string; after: string }) {
  if (before === after) return null
  return (
    <div className="text-sm">
      <p className="mb-1 text-muted-foreground">{label}</p>
      <p className="rounded bg-red-500/10 px-2 py-1 text-red-300 line-through">{before || "(vazio)"}</p>
      <p className="mt-1 rounded bg-green-500/10 px-2 py-1 text-green-300">{after || "(vazio)"}</p>
    </div>
  )
}

export default async function DiffPage({
  params,
}: {
  params: Promise<{ id: string; revId: string }>
}) {
  const { id, revId } = await params
  const data = await getRevisionForDiff(id, revId)
  if (!data) notFound()

  const { revision, previous } = data
  const prevBody = previous?.bodyMarkdown ?? ""
  const lines = lineDiff(prevBody, revision.bodyMarkdown)
  const { added, removed } = diffStats(lines)

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mudanças nesta revisão</h1>
          <p className="text-sm text-muted-foreground">
            {previous ? "Comparado com a revisão anterior" : "Revisão inicial (tudo novo)"} ·{" "}
            <span className="text-green-400">+{added}</span>{" "}
            <span className="text-red-400">−{removed}</span>
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/content/${id}/history`}>Voltar ao histórico</Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <FieldChange label="Título" before={previous?.title ?? ""} after={revision.title} />
        <FieldChange label="Resumo" before={previous?.excerpt ?? ""} after={revision.excerpt} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-white/10 px-4 py-2 text-sm text-muted-foreground">
          Corpo (Markdown)
        </div>
        <pre className="overflow-x-auto p-0 text-sm leading-relaxed">
          {lines.map((l, i) => (
            <div
              key={i}
              className={
                l.type === "add"
                  ? "bg-green-500/10 text-green-300"
                  : l.type === "del"
                    ? "bg-red-500/10 text-red-300"
                    : "text-muted-foreground"
              }
            >
              <span className="select-none px-2 opacity-60">
                {l.type === "add" ? "+" : l.type === "del" ? "−" : " "}
              </span>
              <span className="whitespace-pre-wrap">{l.text || " "}</span>
            </div>
          ))}
        </pre>
      </Card>
    </main>
  )
}
