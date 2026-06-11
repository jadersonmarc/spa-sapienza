import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, type TagTone } from "@/components/tag"

type TagColor = "blue" | "yellow" | "purple"

const tagStyles: Record<TagColor, { tone: TagTone; border: string }> = {
  blue: {
    tone: "blue",
    border: "border-l-blue-500/50"
  },
  yellow: {
    tone: "yellow",
    border: "border-l-yellow-500/50"
  },
  purple: {
    tone: "purple",
    border: "border-l-purple-500/50"
  }
}

const projects: {
  name: string
  tag: string
  tagColor: TagColor
  sector: string
  description: string
  stack: string[]
}[] = [
  {
    name: "LexWatch",
    tag: "Em desenvolvimento",
    tagColor: "blue",
    sector: "Jurídico",
    description:
      "Monitoramento de processos por simulação comportamental em PJe, e-SAJ e Projudi. Alerta automático, sem scraping frágil.",
    stack: ["Go", "Redis Streams", "PostgreSQL", "chromedp"]
  },
  {
    name: "OracleTalk",
    tag: "Roadmap",
    tagColor: "yellow",
    sector: "Gestão de Conhecimento",
    description:
      "Consulta de bibliotecas documentais via linguagem natural e áudio do WhatsApp. RAG com PostgreSQL + pgvector.",
    stack: ["Go", "PostgreSQL", "pgvector", "Redis"]
  },
  {
    name: "Sapienza OncoCare",
    tag: "Submetido ao Hackathon SUS",
    tagColor: "purple",
    sector: "Saúde Pública",
    description:
      "Triagem clínica point-of-care para monitoramento de toxicidade em quimioterapia no SUS. Offline-first, criptografia local.",
    stack: ["Go", "Rust", "Flutter", "XGBoost"]
  }
]

export function Portfolio() {
  return (
    <section className="py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-3 text-balance font-display sm:text-3xl sm:mb-4 md:text-4xl">
            Portfólio
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto sm:text-lg">
            Produtos que estamos construindo — e a engenharia por trás deles
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.name}
              className={`glass border-border/50 border-l-2 ${tagStyles[project.tagColor].border} hover:border-primary/30 transition-colors duration-300`}
            >
              <CardHeader>
                <Tag tone="neutral">
                  {project.sector}
                </Tag>
                <CardTitle className="text-xl font-semibold text-card-foreground font-display">
                  {project.name}
                </CardTitle>
                <Tag tone={tagStyles[project.tagColor].tone} className="mt-1">
                  {project.tag}
                </Tag>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base leading-relaxed">
                  {project.description}
                </CardDescription>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <Tag
                      key={tech}
                      tone="muted"
                      shape="rounded"
                      textCase="normal"
                      mono
                    >
                      {tech}
                    </Tag>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
