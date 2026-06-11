import { Button } from "@/components/ui/button"
import { Tag } from "@/components/tag"
import { MessageCircle } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden sm:px-6 lg:px-8">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl sm:w-96 sm:h-96" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Tag tone="primary" size="sm" className="mb-4 sm:mb-6">
          Software sob medida · Baixada Fluminense
        </Tag>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-4 text-balance font-display sm:text-4xl sm:mb-6 md:text-5xl lg:text-6xl">
          Seu negócio merece sistema feito para ele —{" "}
          <span className="text-primary glow-text">não template comprado de fora.</span>
        </h1>

        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty leading-relaxed sm:text-lg sm:mb-10 md:text-xl">
          Desenvolvemos software sob medida para escritórios de advocacia, contabilidade e clínicas da Baixada Fluminense. Levantamento de requisitos conduzido por engenheiro, entrega com qualidade de produção.
        </p>

        <Button 
          size="lg" 
          className="glow-primary bg-primary hover:bg-primary/90 text-primary-foreground w-full px-6 py-5 text-base font-medium sm:w-auto sm:px-8 sm:py-6 sm:text-lg"
          asChild
        >
          <a
            href="https://wa.me/5521986537054?text=Olá! Quero agendar um diagnóstico gratuito de 30 minutos."
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Diagnóstico gratuito — 30 minutos
          </a>
        </Button>
      </div>
    </section>
  )
}
