import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Eyebrow } from "@/components/eyebrow"
import { DEGRAUS } from "@/lib/content/degraus"

// Escada de capacidade: quatro degraus, uma engenharia só. A vitrine é a porta
// de entrada (Degrau 01); o Degrau 04 (Fronteira) ganha destaque por peso, mono
// e borda — sem cor nova (assinatura da marca petrol).
export function CapabilityLadder() {
  return (
    <section className="py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center sm:mb-14">
          <Eyebrow className="mb-4">Escada de capacidade</Eyebrow>
          <h2 className="mb-3 text-balance font-display text-2xl font-semibold text-foreground sm:mb-4 sm:text-3xl md:text-4xl">
            Uma engenharia só, do primeiro contato ao sistema crítico.
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            A vitrine é a porta de entrada — não o teto. Cada degrau resolve um
            problema maior, com a mesma engenharia por trás.
          </p>
        </div>

        <ol className="flex flex-col gap-4">
          {DEGRAUS.map((d) => {
            const isFronteira = d.key === "fronteira"
            return (
              <li key={d.key}>
                <Link
                  href={`/engenharia#${d.anchor}`}
                  className={`group flex flex-col gap-4 rounded-xl border p-5 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:gap-6 sm:p-6 ${
                    isFronteira
                      ? "border-l-2 border-primary bg-card"
                      : "border-border bg-card/40"
                  }`}
                >
                  <div className="flex items-baseline gap-4 sm:w-56 sm:shrink-0">
                    <span
                      className={`font-mono text-3xl tabular-nums sm:text-4xl ${
                        isFronteira ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {d.numero}
                    </span>
                    <h3
                      className={`font-display text-xl font-semibold text-foreground sm:text-2xl ${
                        isFronteira ? "tracking-tight" : ""
                      }`}
                    >
                      {d.nome}
                    </h3>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-pretty font-display text-base text-foreground sm:text-lg">
                      {d.promessa}
                    </p>
                    <ul className="flex flex-wrap gap-x-3 gap-y-1">
                      {d.itens.map((item) => (
                        <li
                          key={item}
                          className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ArrowUpRight
                    className="hidden h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:block"
                    aria-hidden
                  />
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
