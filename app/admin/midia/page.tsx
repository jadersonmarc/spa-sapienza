import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { MediaLibrary } from "@/components/admin/media-library"

export const metadata: Metadata = {
  title: "Mídia — Admin",
  robots: { index: false, follow: false },
}

export default async function MediaPage() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Biblioteca de mídia</h1>
        <p className="text-sm text-muted-foreground">
          Imagens guardadas no R2, organizadas por pasta. Envie, navegue e copie a URL pública.
        </p>
      </div>

      <MediaLibrary />
    </main>
  )
}
