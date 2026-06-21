import type { Metadata } from "next"
import { ContentForm } from "../content-form"
import { createContentAction } from "../actions"

export const metadata: Metadata = {
  title: "Novo conteúdo — Admin",
  robots: { index: false, follow: false },
}

export default function NewContentPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Novo conteúdo</h1>
      <ContentForm action={createContentAction} submitLabel="Criar" />
    </main>
  )
}
