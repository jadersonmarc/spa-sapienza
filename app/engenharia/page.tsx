import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Eyebrow } from "@/components/eyebrow"
import { CtaFinal } from "@/components/cta-final"
import { DEGRAUS } from "@/lib/content/degraus"
import { getProjectsByDegrau } from "@/lib/content/projects"

const TITLE = "Engenharia | Sapienza Labs"
const DESCRIPTION =
  "A escada de capacidade da Sapienza Labs: da vitrine (Presença) ao sistema distribuído (Fronteira). Desenvolvimento de software sob medida — ERP, CRM, aplicativos, plataformas SaaS, sistemas distribuídos e embarcados."

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

export default async function EngenhariaPage() {
  const byDegrau = await getProjectsByDegrau()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen pt-32 pb-20">
        {/* Hero */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <Eyebrow className="mb-5">Engenharia</Eyebrow>
            <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Uma engenharia só, em quatro degraus.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              A Sapienza opera do primeiro contato digital ao sistema crítico. A
              vitrine é a porta de entrada — abaixo, cada degrau com as capacidades,
              quando faz sentido, e os projetos que provam o nível.
            </p>
          </div>
        </section>

        {/* Um bloco por degrau */}
        {DEGRAUS.map((d) => {
          const isFronteira = d.key === "fronteira"
          const projetos = byDegrau[d.key]
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

        <div className="mt-8">
          <CtaFinal />
        </div>
      </main>
      <Footer />
    </>
  )
}
