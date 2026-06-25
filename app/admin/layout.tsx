import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminNav, type NavItem } from "@/components/admin/admin-nav"
import { TenantSwitcher } from "@/components/admin/tenant-switcher"
import { accessibleTenants, ACTIVE_TENANT_COOKIE } from "@/lib/agent/tenant"
import { signOutAction } from "./actions"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  // Sem sessão (ex.: /admin/login) → sem chrome; a própria página se centraliza.
  if (!session?.user) return <>{children}</>

  const { email, role, isSuperadmin } = session.user

  const tenants = await accessibleTenants()
  const activeTenantId = (await cookies()).get(ACTIVE_TENANT_COOKIE)?.value ?? tenants[0]?.id

  // Console do agente (atendimento/CRM) — itens adicionados conforme as fases.
  const navItems: NavItem[] = [
    { href: "/admin", label: "Painel", exact: true },
    { href: "/admin/atendimento", label: "Atendimento" },
    { href: "/admin/content", label: "Conteúdo" },
    { href: "/admin/pages", label: "Páginas" },
    ...(isSuperadmin ? [{ href: "/admin/tenants", label: "Tenants" }] : []),
    { href: "/admin/conta", label: "Conta" },
  ]

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Sidebar (lg+) / topbar (mobile) */}
      <aside className="flex shrink-0 flex-col gap-4 border-b border-border bg-card/40 p-4 lg:w-60 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between lg:flex-col lg:items-start lg:gap-4">
          <Link
            href="/admin"
            className="font-display text-base font-semibold text-foreground"
          >
            Sapienza <span className="font-mono text-xs text-muted-foreground">/admin</span>
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>

        {tenants.length > 0 && <TenantSwitcher tenants={tenants} activeId={activeTenantId} />}

        <AdminNav items={navItems} className="overflow-x-auto lg:flex-col" />

        <div className="mt-auto hidden flex-col gap-3 lg:flex">
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {email}
            <br />
            <span className="uppercase tracking-wider">{role}</span>
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOutAction} className="flex-1">
              <Button type="submit" variant="outline" size="sm" className="w-full">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
