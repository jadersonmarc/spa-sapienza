import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { listContentItems } from "@/lib/content/queries"
import { deleteContentAction } from "./actions"

export const metadata: Metadata = {
  title: "Conteúdo — Admin",
  robots: { index: false, follow: false },
}

// Painel admin: sempre fresco (lê o banco a cada request).
export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  scheduled: "Agendado",
  published: "Publicado",
  archived: "Arquivado",
}

export default async function ContentListPage() {
  const items = await listContentItems()

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Conteúdo</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/admin">Voltar</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/content/new">Novo</Link>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          Nenhum conteúdo ainda. Crie o primeiro em “Novo”.
        </Card>
      ) : (
        <Card className="divide-y divide-white/10 p-0">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/content/${it.id}`}
                  className="block truncate font-medium hover:underline"
                >
                  {it.title ?? "(sem título)"}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {it.type} · /{it.slug}
                  {it.pilar ? ` · ${it.pilar}` : ""} ·{" "}
                  {STATUS_LABEL[it.status] ?? it.status}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/content/${it.id}`}>Editar</Link>
                </Button>
                <form action={deleteContentAction}>
                  <input type="hidden" name="id" value={it.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Excluir
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </Card>
      )}
    </main>
  )
}
