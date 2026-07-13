import Link from "next/link"
import { requireUser } from "@/lib/auth/session"
import { createProjectAction } from "../actions"
import { ProjectForm } from "../project-form"

export default async function NewProjectPage() {
  await requireUser()

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <Link href="/admin/projects" className="font-mono text-xs text-muted-foreground hover:underline">
          ← Projetos
        </Link>
        <h1 className="font-display text-xl font-semibold">Novo projeto</h1>
      </header>
      <ProjectForm action={createProjectAction} />
    </div>
  )
}
