import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, MessageCircle } from "lucide-react"
import { Footer } from "@/components/footer"
import { Eyebrow } from "@/components/eyebrow"
import { Button } from "@/components/ui/button"
import { CtaFinal } from "@/components/cta-final"
import { HowItWorks } from "@/components/how-it-works"
import { Services } from "@/components/services"
import { Plans } from "@/components/plans"
import { DEGRAUS } from "@/lib/content/degraus"
import { getProjectsByDegrau } from "@/lib/content/projects"
import { getHomeBlocks } from "@/lib/content/pages"
import { whatsappUrl } from "@/lib/contact"

const TITLE = "Sistemas sob medida | Sapienza Labs"
const DESCRIPTION =
  "Estúdio de software com IA: sistemas sob medida, da vitrine (Presença) ao sistema distribuído (Fronteira) — ERP, CRM, apps, plataformas SaaS, sistemas distribuídos e embarcados."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://sapienzalabs.com.br/engenharia",
    siteName: "Sapienza Labs",
    locale: "pt_BR",
    type: "website",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://sapienzalabs.com.br/engenharia" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Escada de capacidade — Sapienza Labs",
  itemListElement: DEGRAUS.map((d, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `${d.numero} · ${d.nome}`,
    description: d.promessa,
  })),
}

export default async function SobMedidaPage() {
  const [byDegrau, home] = await Promise.all([getProjectsByDegrau(), getHomeBlocks()])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen pt-32 pb-20">
        {/* Hero-pitch */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <Eyebrow className="mb-5">Sob medida</Eyebrow>
            <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Software sob medida com IA, do primeiro contato ao sistema crítico.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Quando o sistema pronto não cabe na sua operação, a gente constrói o exato — com escopo
              fechado, prazo definido e a mesma engenharia em todos os níveis. Abaixo, a escada de
              capacidade: cada degrau resolve um problema maior, com os projetos que provam o nível.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <a
                  href={whatsappUrl("Olá! Quero agendar um diagnóstico (sem custo).")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Agendar diagnóstico (sem custo)
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Um bloco por degrau (com até 2 provas cada) */}
        {DEGRAUS.map((d) => {
          const isFronteira = d.key === "fronteira"
          const projetos = byDegrau[d.key].slice(0, 2)
          return (
            <section key={d.key} id={d.anchor} className="mt-16 scroll-mt-28 px-4 sm:mt-20 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <div
                  className={`rounded-2xl border p-6 sm:p-8 ${
                    isFronteira ? "border-l-2 border-primary bg-card" : "border-border bg-card/40"
                  }`}
                >
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`font-mono text-3xl tabular-nums sm:text-4xl ${
                        isFronteira ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {d.numero}
                    </span>
                    <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                      {d.nome}
                    </h2>
                  </div>

                  <p className="mt-4 font-display text-lg text-foreground">{d.promessa}</p>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{d.quando}</p>

                  <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                    {d.itens.map((item) => (
                      <li
                        key={item}
                        className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  {projetos.length > 0 && (
                    <div className="mt-6 border-t border-border pt-5">
                      <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        Provado por
                      </p>
                      <ul className="space-y-3">
                        {projetos.map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/projetos/${p.slug}`}
                              className="group flex flex-col gap-1 hover:text-primary"
                            >
                              <span className="font-display font-semibold text-foreground group-hover:text-primary">
                                {p.nome}
                              </span>
                              <span className="text-sm text-muted-foreground">{p.resumo}</span>
                              <span className="font-mono text-[11px] tracking-wider text-muted-foreground">
                                {p.stack.join(" · ")}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        })}

        {/* Ponte para a Presença já pronta (produtos Margot) + todos os cases */}
        <section className="mt-12 px-4 sm:mt-16 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Precisa da Presença (Degrau 01) funcionando agora? Os produtos{" "}
              <Link href="/margot" className="text-primary underline-offset-4 hover:underline">
                Margot
              </Link>{" "}
              atendem e produzem conteúdo por assinatura.
            </p>
            <Link
              href="/projetos"
              className="group inline-flex shrink-0 items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
            >
              Ver todos os cases
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* Como trabalhamos */}
        <div className="mt-8">
          <HowItWorks header={home.howItWorks} />
        </div>
        {/* Capacidades em detalhe */}
        <Services header={home.services} />
        {/* Vitrine / planos de serviço (Degrau 01 — porta de entrada) */}
        <Plans block={home.portfolio} />

        <CtaFinal />
      </main>
      <Footer />
    </>
  )
}
