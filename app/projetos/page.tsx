import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Eyebrow } from "@/components/eyebrow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CtaFinal } from "@/components/cta-final"
import { getPublishedProjects } from "@/lib/content/projects"
import { DEGRAU_LABEL } from "@/lib/content/degraus"

const TITLE = "Projetos | Sapienza Labs"
const DESCRIPTION =
  "Estudos de caso da Sapienza Labs — projetos autorais e de P&D em software sob medida: rastreabilidade, automação judicial, atendimento com IA e saúde pública."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://sapienzalabs.com.br/projetos",
    siteName: "Sapienza Labs",
    locale: "pt_BR",
    type: "website",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://sapienzalabs.com.br/projetos" },
}

export default async function ProjetosPage() {
  const projects = await getPublishedProjects()

  return (
    <>
      <main className="min-h-screen pt-32 pb-20">
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <Eyebrow className="mb-5">Projetos</Eyebrow>
            <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              O que construímos
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Projetos autorais e de P&amp;D. Cada um é um estudo de caso: o problema,
              a arquitetura, as decisões e o resultado.
            </p>

            <div className="mt-10 grid gap-4 sm:gap-6 md:grid-cols-2">
              {projects.map((p) => (
                <Card
                  key={p.slug}
                  className="glass group relative flex flex-col border-border/50 transition-colors duration-300 hover:border-primary/30"
                >
                  <CardHeader>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {DEGRAU_LABEL[p.degrau]}
                    </p>
                    <CardTitle className="font-display text-xl font-semibold text-card-foreground">
                      <Link href={`/projetos/${p.slug}`} className="after:absolute after:inset-0">
                        {p.nome}
                      </Link>
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

        <CtaFinal />
      </main>
      <Footer />
    </>
  )
}
