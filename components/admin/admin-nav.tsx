"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type NavItem = { href: string; label: string; exact?: boolean }

const defaultItems: NavItem[] = [
  { href: "/admin", label: "Painel", exact: true },
  { href: "/admin/content", label: "Conteúdo" },
  { href: "/admin/pages", label: "Páginas" },
  { href: "/admin/conta", label: "Conta" },
]

export function AdminNav({ items = defaultItems, className }: { items?: NavItem[]; className?: string }) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <nav className={cn("flex gap-1", className)} aria-label="Navegação do admin">
      {items.map((item) => {
        const active = isActive(item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-foreground/[0.06] font-medium text-foreground"
                : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
