import type { Metadata } from "next"
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
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sair
          </Button>
        </form>
      </div>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          Autenticação funcionando. Os módulos de conteúdo (CRUD, editor,
          versionamento) entram nas próximas etapas da Fase 1.
        </p>
      </Card>
    </main>
  )
}
