import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, Wrench, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: ClipboardCheck,
    label: "Requisitos antes de código",
    description: "Todo projeto começa com diagnóstico da operação real — não com formulário."
  },
  {
    icon: Wrench,
    label: "Stack escolhida pelo problema",
    description: "Go, Rust, PostgreSQL — tecnologia pela necessidade, não pela moda."
  },
  {
    icon: ShieldCheck,
    label: "Entrega de produção desde o MVP",
    description: "Sem retrabalho disfarçado de v2. O que entregamos funciona na vida real."
  }
]

export function Differentials() {
  return (
    <section className="py-16 px-4 relative sm:py-24 sm:px-6 lg:px-8">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-primary/5 rounded-full blur-3xl sm:w-[600px] sm:h-[400px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="glass rounded-2xl p-6 text-center border-border/50 sm:p-8 md:p-12">
          <Badge 
            variant="outline" 
            className="mb-4 px-3 py-1 text-[10px] uppercase tracking-widest border-accent/30 text-accent bg-accent/5 sm:mb-6 sm:px-4 sm:py-1.5 sm:text-xs"
          >
            Por que Sapienza Labs?
          </Badge>

          <h2 className="text-xl font-semibold text-foreground mb-4 text-balance leading-tight font-display sm:text-2xl sm:mb-6 md:text-3xl lg:text-4xl">
            Porque não entregamos apenas código; entregamos{" "}
            <span className="text-primary">inteligência</span>.
          </h2>

          <p className="text-muted-foreground text-base mb-8 max-w-2xl mx-auto leading-relaxed sm:text-lg sm:mb-10">
            Nossa abordagem vai além do desenvolvimento tradicional. Combinamos expertise técnica com visão estratégica de negócio.
          </p>

          <div className="grid gap-4 text-left sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="rounded-xl bg-secondary/30 border border-border/40 p-5"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium text-foreground">{feature.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
