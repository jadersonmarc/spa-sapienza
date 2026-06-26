"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { setActiveTenant } from "@/app/admin/tenant-actions"

type Option = { id: string; name: string }

export function TenantSwitcher({ tenants, activeId }: { tenants: Option[]; activeId?: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (tenants.length === 0) return null

  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tenant</span>
      <select
        value={activeId}
        disabled={pending || tenants.length === 1}
        onChange={(e) => {
          const id = e.target.value
          startTransition(async () => {
            await setActiveTenant(id)
            router.refresh()
          })
        }}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        {tenants.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  )
}
