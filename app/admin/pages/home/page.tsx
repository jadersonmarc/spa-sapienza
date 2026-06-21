import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getPageForAdmin, DEFAULT_HOME } from "@/lib/content/pages"
import { allowedTransitions } from "@/lib/content/transition"
import { StatusControls } from "@/app/admin/content/status-controls"
import { HomeForm } from "./home-form"

export const metadata: Metadata = {
  title: "Editar Home — Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function EditHomePage() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  const data = await getPageForAdmin("home")
  const blocks = data?.blocks ?? DEFAULT_HOME

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Página: Home</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `Status: ${data.item.status}` : "Ainda não criada — salve para gerar o rascunho."}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/pages">Voltar</Link>
        </Button>
      </div>

      {data ? (
        <div className="mb-6">
          <StatusControls
            itemId={data.item.id}
            status={data.item.status}
            allowed={allowedTransitions(data.item.status)}
          />
        </div>
      ) : null}

      <Card className="p-6">
        <HomeForm initial={blocks} />
      </Card>
    </main>
  )
}
