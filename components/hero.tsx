import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Badge 
          variant="outline" 
          className="mb-6 px-4 py-1.5 text-xs uppercase tracking-widest border-primary/30 text-primary bg-primary/5"
        >
          Product Studio
        </Badge>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6 text-balance font-display">
          Transformamos complexidade técnica em{" "}
          <span className="text-primary glow-text">ativos digitais de alto valor.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
          Especialistas em desenvolvimento de software, automações inteligentes e soluções RegTech sob medida.
        </p>

        <Button 
          size="lg" 
          className="glow-primary bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium"
          asChild
        >
          <a 
            href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar um orçamento." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Solicitar Orçamento via WhatsApp
          </a>
        </Button>
      </div>
    </section>
  )
}
