"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowUpRight, MessageCircle, Menu, X } from "lucide-react"

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/#planos", label: "Planos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        closeMenu()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isMenuOpen, closeMenu])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href.startsWith("/#")) return false
    return pathname.startsWith(href)
  }

  // O /admin tem chrome próprio — esconde o header institucional.
  if (pathname.startsWith("/admin")) return null

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6">
      <div className="glass mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-border/60 px-4 shadow-[0_16px_48px_color-mix(in_oklch,var(--background)_72%,transparent)] md:h-[4.5rem] md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center text-foreground" aria-label="Sapienza Labs — início">
          <Image
            src="/logo-sapienza-footer.webp"
            alt="Sapienza Labs"
            width={168}
            height={92}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-foreground/[0.03] p-1 lg:flex" aria-label="Menu principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
            className={`rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground/[0.06] hover:text-foreground xl:px-4 ${
                isActive(link.href)
                  ? "bg-foreground/[0.08] text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA + Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <div className="hidden text-right lg:block">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Briefing rápido</p>
            <p className="text-sm text-foreground">Resposta via WhatsApp</p>
          </div>

          <ThemeToggle />

          {/* Desktop CTA Button */}
          <Button size="sm" className="group hidden rounded-full sm:inline-flex" asChild>
            <a
              href="https://wa.me/5521984167397?text=Olá! Gostaria de solicitar um orçamento."
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Solicitar proposta</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-foreground/[0.03] text-foreground transition-colors hover:bg-foreground/[0.08] lg:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-0 z-40 h-screen bg-background/98 backdrop-blur-lg transition-[opacity,visibility] duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <nav
          className={`flex h-full flex-col items-center justify-center gap-6 transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
          aria-label="Menu principal"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={`text-2xl font-medium transition-colors hover:text-primary ${
                isActive(link.href) ? "text-primary" : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile CTA Button */}
          <Button size="lg" className="mt-6 w-full max-w-xs" asChild>
            <a
              href="https://wa.me/5521984167397?text=Olá! Gostaria de solicitar um orçamento."
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Solicitar proposta
            </a>
          </Button>
        </nav>
      </div>
    </header>
  )
}
