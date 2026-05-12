"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, MessageCircle, Menu, X } from "lucide-react"

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/blog", label: "Blog" },
  { href: "/#contato", label: "Contato" },
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
    if (href.startsWith("/#")) return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6">
      <div className="glass mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-white/8 px-4 shadow-[0_16px_48px_rgba(2,6,23,0.38)] md:h-[4.5rem] md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-foreground sm:gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 bg-primary/12 text-sm font-semibold text-primary sm:h-10 sm:w-10">
            SL
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg text-foreground sm:text-xl">Sapienza Labs</span>
            <span className="hidden text-[10px] uppercase tracking-[0.32em] text-muted-foreground sm:block sm:text-[11px]">
              Product Studio
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/4 p-1 md:flex" aria-label="Menu principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-wider transition-colors hover:bg-white/6 hover:text-foreground ${
                isActive(link.href)
                  ? "bg-white/8 text-foreground"
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
            <p className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Briefing rápido</p>
            <p className="text-sm text-foreground">Resposta via WhatsApp</p>
          </div>
          
          {/* Desktop CTA Button */}
          <Button size="sm" className="group hidden sm:inline-flex" asChild>
            <a
              href="https://wa.me/5521986537054?text=Olá! Gostaria de solicitar um orçamento."
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/4 text-foreground transition-colors hover:bg-white/8 md:hidden"
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
        className={`fixed inset-x-0 top-0 z-40 h-screen bg-background/98 backdrop-blur-lg transition-all duration-300 ease-in-out md:hidden ${
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
              href="https://wa.me/5521986537054?text=Olá! Gostaria de solicitar um orçamento."
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
