import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Bot, Layers } from "lucide-react"

const services = [
  {
    icon: Scale,
    title: "Automação para Escritórios Jurídicos",
    description: "Monitoramento automático de processos (PJe, e-SAJ, Projudi), onboarding de cliente via WhatsApp e alertas de prazo. Devolve horas faturáveis toda semana."
  },
  {
    icon: Bot,
    title: "Integração e Automação de Fluxos",
    description: "Conectamos seus sistemas atuais e eliminamos a digitação duplicada. WhatsApp, ERP, planilha e sistema fiscal conversando de forma automática."
  },
  {
    icon: Layers,
    title: "Sistema de Gestão Sob Medida",
    description: "Para quando SaaS genérico não cabe na sua operação. Desenvolvemos o sistema exato que sua empresa precisa — com escopo fechado, prazo definido e suporte incluso."
  }
]

export function Services() {
  return (
    <section className="py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-3 text-balance font-display sm:text-3xl sm:mb-4 md:text-4xl">
            Nossos Serviços
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto sm:text-lg">
            Soluções tecnológicas sob medida para impulsionar seu negócio
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="glass border-border/50 hover:border-primary/30 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-card-foreground font-display">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
