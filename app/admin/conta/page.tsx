import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChangePasswordForm } from "./change-password-form"

export const metadata: Metadata = {
  title: "Conta — Admin",
  robots: { index: false, follow: false },
}

export default async function ContaPage() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Conta</h1>
          <p className="text-sm text-muted-foreground">
            {session.user.email} · <span className="uppercase">{session.user.role}</span>
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">Voltar</Link>
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-medium">Trocar senha</h2>
        <ChangePasswordForm />
      </Card>
    </main>
  )
}
