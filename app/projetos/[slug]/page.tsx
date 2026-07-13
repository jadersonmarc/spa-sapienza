import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { Eyebrow } from "@/components/eyebrow"
import { CtaFinal } from "@/components/cta-final"
import { getProjectBySlug, getPublishedProjects } from "@/lib/content/projects"

const DEGRAU_LABEL: Record<string, string> = {
  presenca: "01 · Presença",
  operacao: "02 · Operação",
  plataforma: "03 · Plataforma",
  fronteira: "04 · Fronteira",
}

export async function generateStaticParams() {
  const projects = await getPublishedProjects()
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: "Projeto não encontrado | Sapienza Labs" }

  const title = `${project.nome} | Sapienza Labs`
  const url = `https://sapienzalabs.com.br/projetos/${project.slug}`
  return {
    title,
    description: project.resumo,
    openGraph: {
      title,
      description: project.resumo,
      url,
      siteName: "Sapienza Labs",
      locale: "pt_BR",
      type: "article",
      images: [project.coverImage ?? "/og-image.png"],
    },
    alternates: { canonical: url },
  }
}

// Seção de texto do estudo de caso — só renderiza se houver conteúdo.
function CaseSection({ title, body }: { title: string; body: string | null }) {
  if (!body) return null
  return (
    <section className="mt-12 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  return (
    <>
      <main className="min-h-screen pt-32 pb-20">
        {/* Hero */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/projetos"
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              ← Projetos
            </Link>
            <Eyebrow className="mb-4 mt-5">{DEGRAU_LABEL[project.degrau]}</Eyebrow>
            <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {project.nome}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {project.resumo}
            </p>
            {project.stack.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="font-mono text-xs tracking-wider text-muted-foreground"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {project.coverImage && (
          <section className="mt-10 px-4 sm:px-6">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border">
              <Image
                src={project.coverImage}
                alt={project.nome}
                width={1200}
                height={630}
                className="h-auto w-full object-cover"
              />
            </div>
          </section>
        )}

        <CaseSection title="O problema" body={project.problema || null} />
        <CaseSection title="Arquitetura" body={project.arquitetura} />
        <CaseSection title="Decisões técnicas" body={project.decisoes} />
        <CaseSection title="Resultado" body={project.resultado} />

        <CtaFinal />
      </main>
      <Footer />
    </>
  )
}
