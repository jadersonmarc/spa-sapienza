import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eyebrow } from "@/components/eyebrow"
import { getPublishedProjects } from "@/lib/content/projects"

const DEGRAU_LABEL: Record<string, string> = {
  presenca: "01 · Presença",
  operacao: "02 · Operação",
  plataforma: "03 · Plataforma",
  fronteira: "04 · Fronteira",
}

// Prova de engenharia: os projetos reais como artefato. Sem isto, o
// reposicionamento não convence — adjetivo não prova, artefato prova.
export async function EngineeringProof() {
  const projects = await getPublishedProjects()
  if (projects.length === 0) return null

  return (
    <section className="py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-16">
          <Eyebrow className="mb-4">O que construímos</Eyebrow>
          <h2 className="mb-3 text-balance font-display text-2xl font-semibold text-foreground sm:mb-4 sm:text-3xl md:text-4xl">
            Prova de engenharia, não promessa.
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Projetos autorais e de P&amp;D — o difícil que a Sapienza constrói de verdade.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <Card
              key={p.slug}
              className="glass group relative flex flex-col border-border/50 transition-colors duration-300 hover:border-primary/30"
            >
              <CardHeader>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {DEGRAU_LABEL[p.degrau]}
                </p>
                <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold text-card-foreground">
                  <Link
                    href={`/projetos/${p.slug}`}
                    className="after:absolute after:inset-0"
                  >
                    {p.nome}
                  </Link>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-base leading-relaxed text-foreground/90">{p.resumo}</p>
                <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1">
                  {p.stack.map((tech) => (
                    <li
                      key={tech}
                      className="font-mono text-[11px] tracking-wider text-muted-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
