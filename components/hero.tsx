import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { Eyebrow } from "@/components/eyebrow"
import { DEFAULT_HOME, type HeroBlock } from "@/lib/content/pages"

export function Hero({ block = DEFAULT_HOME.hero }: { block?: HeroBlock }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden sm:px-6 lg:px-8">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl sm:w-96 sm:h-96" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Eyebrow className="mb-5 sm:mb-6">{block.badge}</Eyebrow>

        <h1 className="font-display text-[2rem] font-semibold leading-[1.08] tracking-tight text-foreground text-balance mb-4 sm:text-5xl sm:mb-6 md:text-6xl">
          {block.titleLead}{" "}
          <span className="text-primary">{block.titleHighlight}</span>
        </h1>

        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty leading-relaxed sm:text-lg sm:mb-10 md:text-xl">
          {block.subtitle}
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
            {block.ctaLabel}
          </a>
        </Button>
      </div>
    </section>
  )
}
