import { Badge } from "@/components/ui/badge"
import { Database, Scale, Layers } from "lucide-react"

const features = [
  {
    icon: Database,
    label: "Inteligência de Dados"
  },
  {
    icon: Scale,
    label: "Compliance Fiscal"
  },
  {
    icon: Layers,
    label: "Arquitetura Escalável"
  }
]

export function Differentials() {
  return (
    <section className="py-24 px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="glass rounded-2xl p-8 md:p-12 text-center border-border/50">
          <Badge 
            variant="outline" 
            className="mb-6 px-4 py-1.5 text-xs uppercase tracking-widest border-accent/30 text-accent bg-accent/5"
          >
            Por que Sapienza Labs?
          </Badge>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-6 text-balance leading-tight font-display">
            Porque não entregamos apenas código; entregamos{" "}
            <span className="text-primary">inteligência</span>.
          </h2>

          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Nossa abordagem vai além do desenvolvimento tradicional. Combinamos expertise técnica com visão estratégica de negócio.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 px-5 py-3 rounded-full bg-secondary/50 border border-border/50"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <span className="text-foreground font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
