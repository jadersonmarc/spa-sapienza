import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, TrendingUp, Bell } from "lucide-react"

export function FiscalMonitor() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/5">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="lg:max-w-xl">
                <Badge 
                  className="mb-4 px-3 py-1 text-[10px] uppercase tracking-widest font-semibold bg-primary/20 text-primary border-primary/30 hover:bg-primary/20"
                >
                  Em Desenvolvimento
                </Badge>

                <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4 text-balance font-display">
                  O Próximo Grande Passo
                </h2>

                <h3 className="text-xl md:text-2xl font-medium text-primary mb-4 glow-text font-display">
                  Monitor Fiscal Pós-Reforma
                </h3>

                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  Protegendo sua empresa do caos tributário. Uma solução proprietária para navegar as mudanças fiscais com segurança e conformidade.
                </p>

                <Button 
                  variant="outline" 
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  Saiba Mais em Breve
                </Button>
              </div>

              <div className="flex flex-col gap-4 lg:w-64">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Compliance</p>
                    <p className="text-muted-foreground text-xs">Conformidade garantida</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <TrendingUp className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Análise</p>
                    <p className="text-muted-foreground text-xs">Impacto em tempo real</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <Bell className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Alertas</p>
                    <p className="text-muted-foreground text-xs">Notificações proativas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
