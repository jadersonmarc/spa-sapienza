import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden sm:px-6 lg:px-8">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl sm:w-96 sm:h-96" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-accent/15 rounded-full blur-3xl sm:w-80 sm:h-80" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Badge 
          variant="outline" 
          className="mb-4 px-3 py-1 text-[10px] uppercase tracking-widest border-primary/30 text-primary bg-primary/5 sm:mb-6 sm:px-4 sm:py-1.5 sm:text-xs"
        >
          Product Studio
        </Badge>
        
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-4 text-balance font-display sm:text-4xl sm:mb-6 md:text-5xl lg:text-6xl">
          Transformamos complexidade técnica em{" "}
          <span className="text-primary glow-text">ativos digitais de alto valor.</span>
        </h1>
        
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty leading-relaxed sm:text-lg sm:mb-10 md:text-xl">
          Especialistas em desenvolvimento de software, automações inteligentes e soluções RegTech sob medida.
        </p>

        <Button 
          size="lg" 
          className="glow-primary bg-primary hover:bg-primary/90 text-primary-foreground w-full px-6 py-5 text-base font-medium sm:w-auto sm:px-8 sm:py-6 sm:text-lg"
          asChild
        >
          <a 
            href="https://wa.me/5521986537054?text=Olá! Gostaria de solicitar um orçamento." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            <span className="sm:hidden">Solicitar Orçamento</span>
            <span className="hidden sm:inline">Solicitar Orçamento via WhatsApp</span>
          </a>
        </Button>
      </div>
    </section>
  )
}
