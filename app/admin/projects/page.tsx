import Link from "next/link"
import { requireUser } from "@/lib/auth/session"
import { listProjectsForAdmin } from "@/lib/content/projects"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/tag"
import { DeleteProjectButton } from "./delete-button"

const DEGRAU_LABEL: Record<string, string> = {
  presenca: "01 · Presença",
  operacao: "02 · Operação",
  plataforma: "03 · Plataforma",
  fronteira: "04 · Fronteira",
}

export default async function ProjectsAdminPage() {
  await requireUser()
  const projects = await listProjectsForAdmin()

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-xl font-semibold">Projetos</h1>
          <p className="text-sm text-muted-foreground">
            Prova de engenharia da home, das rotas /engenharia e /projetos.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/projects/new">Novo projeto</Link>
        </Button>
      </header>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum projeto ainda.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/projects/${p.id}`} className="font-medium hover:underline">
                    {p.nome}
                  </Link>
                  <Tag tone={p.publicado ? "primary" : "muted"} size="xs">
                    {p.publicado ? "Publicado" : "Rascunho"}
                  </Tag>
                  {p.destaque && (
                    <Tag tone="neutral" size="xs">
                      Destaque
                    </Tag>
                  )}
                </div>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {DEGRAU_LABEL[p.degrau]} · /projetos/{p.slug}
                </p>
              </div>
              <DeleteProjectButton id={p.id} nome={p.nome} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
