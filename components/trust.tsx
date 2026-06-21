import Image from "next/image"
import { BadgeCheck, Handshake, ShieldCheck } from "lucide-react"
import { Tag } from "@/components/tag"
import { DEFAULT_HOME, type SectionHeader } from "@/lib/content/pages"

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Escopo definido",
    description:
      "O projeto começa com entregáveis e critérios de aceite documentados.",
  },
  {
    icon: BadgeCheck,
    title: "Prazo combinado",
    description:
      "A execução é organizada em marcos para você acompanhar avanço sem adivinhar status.",
  },
  {
    icon: Handshake,
    title: "Suporte incluso",
    description:
      "A entrega não termina no deploy: há orientação para uso, operação e próximos passos.",
  },
]

export function Trust({ header = DEFAULT_HOME.trust }: { header?: SectionHeader }) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-16">
          <Tag tone="accent" size="sm" className="mb-4">
            {header.eyebrow}
          </Tag>
          <h2 className="mb-3 text-2xl font-semibold text-foreground text-balance font-display sm:mb-4 sm:text-3xl md:text-4xl">
            {header.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            {header.subtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            {guarantees.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/50 bg-card/45 p-5 transition-colors duration-300 hover:border-primary/30"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="glass flex flex-col gap-5 rounded-xl p-6 sm:flex-row sm:items-center lg:flex-col lg:items-start">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-primary/25">
              <Image
                src="/marc.webp"
                alt="Marc Jaderson, fundador da Sapienza Labs"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div>
              <Tag tone="primary" className="mb-3">
                SEBRAE Dev Empreendedor
              </Tag>
              <h3 className="text-xl font-semibold text-foreground font-display">
                Marc Jaderson
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Fundador e engenheiro responsável por conduzir requisitos, arquitetura e entrega dos projetos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
