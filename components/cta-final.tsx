import Link from "next/link"
import { MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/eyebrow"
import { whatsappUrl } from "@/lib/contact"

type Secondary = { href: string; label: string }

// Fechamento: uma pergunta que qualifica o lead pela dor real (caminho sob medida)
// + um caminho secundário para os produtos Margot. Passe `secondary={null}` para
// esconder o secundário (ex.: dentro das próprias páginas da Margot).
export function CtaFinal({
  secondary = { href: "/margot", label: "Ver planos Margot" },
}: {
  secondary?: Secondary | null
}) {
  return (
    <section className="py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow className="mb-5">Vamos conversar</Eyebrow>
        <h2 className="mb-6 text-balance font-display text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
          Qual é o problema que a sua empresa ainda resolve na mão?
        </h2>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="glow-primary bg-primary hover:bg-primary/90 text-primary-foreground w-full px-6 py-5 text-base font-medium sm:w-auto sm:px-8 sm:py-6 sm:text-lg"
            asChild
          >
            <a
              href={whatsappUrl("Olá! Quero agendar um diagnóstico (sem custo).")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Agendar diagnóstico (sem custo)
            </a>
          </Button>

          {secondary && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group w-full px-6 py-5 text-base font-medium sm:w-auto sm:px-8 sm:py-6 sm:text-lg"
            >
              <Link href={secondary.href}>
                {secondary.label}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
