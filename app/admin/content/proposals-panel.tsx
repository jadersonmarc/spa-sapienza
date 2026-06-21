import Link from "next/link"
import { Button } from "@/components/ui/button"
import { acceptProposalAction, discardProposalAction } from "./ai-actions"

const TYPE_LABEL: Record<string, string> = {
  quality: "Qualidade",
  seo: "SEO",
  emotional: "Impacto emocional",
  thematic: "Temática",
}

type Proposal = {
  id: string
  title: string
  proposedFrom: unknown
  createdAt: Date
}

export function ProposalsPanel({
  itemId,
  proposals,
}: {
  itemId: string
  proposals: Proposal[]
}) {
  if (proposals.length === 0) return null

  return (
    <div className="flex flex-col gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
      <div>
        <h2 className="font-medium">Propostas pendentes ({proposals.length})</h2>
        <p className="text-sm text-muted-foreground">
          Revisões geradas por IA. Veja o diff e aceite (vira a revisão atual) ou descarte.
        </p>
      </div>

      {proposals.map((p) => {
        const from = (p.proposedFrom ?? {}) as { analysisType?: string; recommendation?: string }
        return (
          <div key={p.id} className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">
              {from.analysisType ? `${TYPE_LABEL[from.analysisType] ?? from.analysisType} · ` : ""}
              {new Date(p.createdAt).toLocaleString("pt-BR")}
            </p>
            {from.recommendation ? (
              <p className="mt-1 text-sm">“{from.recommendation}”</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/content/${itemId}/proposals/${p.id}`}>Ver diff</Link>
              </Button>
              <form action={acceptProposalAction}>
                <input type="hidden" name="itemId" value={itemId} />
                <input type="hidden" name="proposalId" value={p.id} />
                <Button type="submit" size="sm">Aceitar</Button>
              </form>
              <form action={discardProposalAction}>
                <input type="hidden" name="itemId" value={itemId} />
                <input type="hidden" name="proposalId" value={p.id} />
                <Button type="submit" variant="destructive" size="sm">Descartar</Button>
              </form>
            </div>
          </div>
        )
      })}
    </div>
  )
}
