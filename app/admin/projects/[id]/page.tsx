import Link from "next/link"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth/session"
import { getProjectForAdmin } from "@/lib/content/projects"
import { saveProjectAction } from "../actions"
import { ProjectForm } from "../project-form"

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const project = await getProjectForAdmin(id)
  if (!project) notFound()

  const action = saveProjectAction.bind(null, id)

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <Link href="/admin/projects" className="font-mono text-xs text-muted-foreground hover:underline">
          ← Projetos
        </Link>
        <h1 className="font-display text-xl font-semibold">{project.nome}</h1>
      </header>
      <ProjectForm action={action} project={project} />
    </div>
  )
}
