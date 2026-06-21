import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
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
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Conta</h1>
        <p className="font-mono text-xs text-muted-foreground">
          {session.user.email} · <span className="uppercase">{session.user.role}</span>
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-medium">Trocar senha</h2>
        <ChangePasswordForm />
      </Card>
    </main>
  )
}
