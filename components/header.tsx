"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-foreground">
          Sapienza<span className="text-primary">Labs</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#servicos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Serviços
          </a>
          <a href="#sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sobre
          </a>
          <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </a>
        </nav>

        <Button 
          size="sm" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          asChild
        >
          <a 
            href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar um orçamento." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Orçamento</span>
          </a>
        </Button>
      </div>
    </header>
  )
}
