"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpRight, MessageCircle } from "lucide-react"

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-6">
      <div className="glass mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between rounded-full border border-white/8 px-4 shadow-[0_16px_48px_rgba(2,6,23,0.38)] md:px-6">
        <a href="/" className="flex items-center gap-3 text-foreground">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/12 text-sm font-semibold text-primary">
            SL
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl text-foreground">Sapienza Labs</span>
            <span className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Product Studio
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/4 p-1 md:flex">
          <a href="#servicos" className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/6 hover:text-foreground">
            Serviços
          </a>
          <a href="#sobre" className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/6 hover:text-foreground">
            Sobre
          </a>
          <a href="#contato" className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/6 hover:text-foreground">
            Contato
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden text-right lg:block">
            <p className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Briefing rápido</p>
            <p className="text-sm text-foreground">Resposta via WhatsApp</p>
          </div>
          <Button size="sm" className="group" asChild>
            <a
            href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar um orçamento." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Solicitar proposta</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
