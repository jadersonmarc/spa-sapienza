import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { signOutAction } from "./actions"

export const metadata: Metadata = {
  title: "Painel — Admin",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  const { email, role } = session.user

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Painel de conteúdo</h1>
          <p className="text-sm text-muted-foreground">
            {email} · <span className="uppercase">{role}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/conta">Conta</Link>
          </Button>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Sair
            </Button>
          </form>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="mb-1 font-medium">Gestão de conteúdo</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Criar, editar e versionar posts e páginas.
        </p>
        <Button asChild>
          <Link href="/admin/content">Abrir conteúdo</Link>
        </Button>
      </Card>
    </main>
  )
}
