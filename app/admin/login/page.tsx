import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card } from "@/components/ui/card"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Entrar — Admin",
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect("/admin")

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="mb-1 text-xl font-semibold">Admin</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Acesso restrito à equipe Sapienza Labs.
        </p>
        <LoginForm />
      </Card>
    </main>
  )
}
