import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, ShoppingCart, Bot } from "lucide-react"

const services = [
  {
    icon: Zap,
    title: "Landing Pages de Alta Performance",
    description: "Foco em velocidade e conversão para empresas que buscam resultados reais. Sites otimizados que transformam visitantes em clientes."
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Estratégico",
    description: "Lojas virtuais robustas com WooCommerce para escalar sua operação. Arquitetura pensada para crescimento sustentável."
  },
  {
    icon: Bot,
    title: "Automação Inteligente",
    description: "Chatbots e fluxos de atendimento que filtram leads e economizam seu tempo. Inteligência artificial aplicada ao seu negócio."
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
