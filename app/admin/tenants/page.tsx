import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db, schema } from "@/lib/db"
import { TenantForm } from "./tenant-form"

export default async function TenantsPage() {
  const session = await auth()
  if (!session?.user?.isSuperadmin) redirect("/admin")

  const tenants = await db
    .select({
      id: schema.agentTenants.id,
      name: schema.agentTenants.name,
      agentApiUrl: schema.agentTenants.agentApiUrl,
      motorTenantId: schema.agentTenants.motorTenantId,
    })
    .from(schema.agentTenants)
    .orderBy(schema.agentTenants.name)

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header className="space-y-1">
        <h1 className="font-display text-xl font-semibold">Tenants</h1>
        <p className="text-sm text-muted-foreground">
          Clientes operados pelo console. O token do motor é guardado criptografado.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Cadastrados</h2>
        {tenants.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum tenant ainda.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {tenants.map((t) => (
              <li key={t.id} className="flex flex-col gap-0.5 p-3">
                <span className="font-medium">{t.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{t.agentApiUrl}</span>
                <span className="font-mono text-[11px] text-muted-foreground">motor: {t.motorTenantId}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Novo tenant</h2>
        <TenantForm />
      </section>
    </div>
  )
}
