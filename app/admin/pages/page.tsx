import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Páginas — Admin",
  robots: { index: false, follow: false },
}

export default async function PagesListPage() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Páginas do site</h1>
        <Button asChild variant="outline">
          <Link href="/admin">Voltar</Link>
        </Button>
      </div>

      <Card className="divide-y divide-white/10 p-0">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Home</p>
            <p className="text-xs text-muted-foreground">Seções da página inicial</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/pages/home">Editar</Link>
          </Button>
        </div>
      </Card>
    </main>
  )
}
