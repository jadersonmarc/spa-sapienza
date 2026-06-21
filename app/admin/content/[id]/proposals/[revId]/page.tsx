import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getProposalDiff } from "@/lib/content/queries"
import { diffStats, lineDiff } from "@/lib/content/diff"
import { acceptProposalAction, discardProposalAction } from "../../../ai-actions"

export const metadata: Metadata = {
  title: "Proposta — Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

function FieldChange({ label, before, after }: { label: string; before: string; after: string }) {
  if (before === after) return null
  return (
    <div className="text-sm">
      <p className="mb-1 text-muted-foreground">{label}</p>
      <p className="rounded bg-red-500/10 px-2 py-1 text-red-700 dark:text-red-300 line-through">{before || "(vazio)"}</p>
      <p className="mt-1 rounded bg-green-500/10 px-2 py-1 text-green-700 dark:text-green-300">{after || "(vazio)"}</p>
    </div>
  )
}

export default async function ProposalDiffPage({
  params,
}: {
  params: Promise<{ id: string; revId: string }>
}) {
  const { id, revId } = await params
  const data = await getProposalDiff(id, revId)
  if (!data) notFound()

  const { proposal, current } = data
  const lines = lineDiff(current?.bodyMarkdown ?? "", proposal.bodyMarkdown)
  const { added, removed } = diffStats(lines)

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Proposta da IA</h1>
          <p className="text-sm text-muted-foreground">
            Comparado com a revisão atual · <span className="text-emerald-600 dark:text-emerald-400">+{added}</span>{" "}
            <span className="text-destructive">−{removed}</span>
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/content/${id}`}>Voltar</Link>
        </Button>
      </div>

      <div className="mb-6 flex gap-2">
        <form action={acceptProposalAction}>
          <input type="hidden" name="itemId" value={id} />
          <input type="hidden" name="proposalId" value={revId} />
          <Button type="submit">Aceitar proposta</Button>
        </form>
        <form action={discardProposalAction}>
          <input type="hidden" name="itemId" value={id} />
          <input type="hidden" name="proposalId" value={revId} />
          <Button type="submit" variant="destructive">Descartar</Button>
        </form>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <FieldChange label="Título" before={current?.title ?? ""} after={proposal.title} />
        <FieldChange label="Resumo" before={current?.excerpt ?? ""} after={proposal.excerpt} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-4 py-2 text-sm text-muted-foreground">
          Corpo (Markdown)
        </div>
        <pre className="overflow-x-auto p-0 text-sm leading-relaxed">
          {lines.map((l, i) => (
            <div
              key={i}
              className={
                l.type === "add"
                  ? "bg-green-500/10 text-green-700 dark:text-green-300"
                  : l.type === "del"
                    ? "bg-red-500/10 text-red-700 dark:text-red-300"
                    : "text-muted-foreground"
              }
            >
              <span className="select-none px-2 opacity-60">
                {l.type === "add" ? "+" : l.type === "del" ? "−" : " "}
              </span>
              <span className="whitespace-pre-wrap">{l.text || " "}</span>
            </div>
          ))}
        </pre>
      </Card>
    </main>
  )
}
