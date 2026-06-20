import { ClipboardCheck, FileCheck2, Code2, LifeBuoy } from "lucide-react"
import { Tag } from "@/components/tag"
import { DEFAULT_HOME, type SectionHeader } from "@/lib/content/pages"

const steps = [
  {
    icon: ClipboardCheck,
    title: "Diagnóstico",
    description:
      "Mapeamos a operação, os gargalos e o resultado esperado antes de falar em tecnologia.",
  },
  {
    icon: FileCheck2,
    title: "Escopo fechado",
    description:
      "A proposta define entregáveis, prazo, responsabilidades e critérios objetivos de aceite.",
  },
  {
    icon: Code2,
    title: "Entregas acompanhadas",
    description:
      "O desenvolvimento acontece em ciclos curtos, com demonstrações e ajustes controlados.",
  },
  {
    icon: LifeBuoy,
    title: "Suporte",
    description:
      "Após a entrega, você tem orientação para operação, correções combinadas e próximos passos.",
  },
]

export function HowItWorks({ header = DEFAULT_HOME.howItWorks }: { header?: SectionHeader }) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-16">
          <Tag tone="primary" size="sm" className="mb-4">
            {header.eyebrow}
          </Tag>
          <h2 className="mb-3 text-2xl font-semibold text-foreground text-balance font-display sm:mb-4 sm:text-3xl md:text-4xl">
            {header.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            {header.subtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-xl border border-border/50 bg-card/45 p-5 transition-colors duration-300 hover:border-primary/30"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
