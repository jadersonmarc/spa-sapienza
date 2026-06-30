import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tag, type TagTone } from "@/components/tag"
import { listContentItems } from "@/lib/content/queries"
import { DeleteContentButton } from "@/components/admin/delete-content-button"

export const metadata: Metadata = {
  title: "Conteúdo — Admin",
  robots: { index: false, follow: false },
}

// Painel admin: sempre fresco (lê o banco a cada request).
export const dynamic = "force-dynamic"

const STATUS: Record<string, { label: string; tone: TagTone }> = {
  draft: { label: "Rascunho", tone: "neutral" },
  in_review: { label: "Em revisão", tone: "yellow" },
  scheduled: { label: "Agendado", tone: "blue" },
  published: { label: "Publicado", tone: "green" },
  archived: { label: "Arquivado", tone: "muted" },
}

export default async function ContentListPage() {
  const items = await listContentItems()

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Conteúdo</h1>
          <p className="font-mono text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/new">Novo</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          Nenhum conteúdo ainda. Crie o primeiro em “Novo”.
        </Card>
      ) : (
        <Card className="divide-y divide-border p-0">
          {items.map((it) => {
            const status = STATUS[it.status] ?? { label: it.status, tone: "neutral" as TagTone }
            return (
            <div
              key={it.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/content/${it.id}`}
                    className="truncate font-medium hover:underline"
                  >
                    {it.title ?? "(sem título)"}
                  </Link>
                  <Tag tone={status.tone}>{status.label}</Tag>
                </div>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {it.type} · /{it.slug}
                  {it.pilar ? ` · ${it.pilar}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/content/${it.id}`}>Editar</Link>
                </Button>
                <DeleteContentButton id={it.id} title={it.title ?? it.slug} />
              </div>
            </div>
            )
          })}
        </Card>
      )}
    </main>
  )
}
