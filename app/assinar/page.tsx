import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"
import { Footer } from "@/components/footer"
import { Eyebrow } from "@/components/eyebrow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { brl, findTier, metricLabel, tierLabel } from "@/lib/pricing"
import { CheckoutForm } from "./checkout-form"

export const metadata: Metadata = {
  title: "Assinar | Sapienza Labs",
  description: "Contrate seu plano e comece a usar hoje. Pagamento via Pix ou boleto.",
  robots: { index: false }, // página transacional, fora do índice
}

// Checkout self-service. Recebe ?produto=&tier= (vindo dos cards de assinatura),
// mostra o plano escolhido e coleta os dados. O provisionamento roda no core.
export default async function AssinarPage({
  searchParams,
}: {
  searchParams: Promise<{ produto?: string; tier?: string }>
}) {
  const sp = await searchParams
  const match = findTier(sp.produto ?? "", sp.tier ?? "")

  if (!match) {
    return (
      <>
        <main className="mx-auto max-w-2xl px-4 py-24 text-center sm:py-32">
          <Eyebrow className="justify-center">Assinar</Eyebrow>
          <h1 className="mt-3 font-display text-2xl font-semibold text-foreground">Escolha um plano</h1>
          <p className="mt-2 text-muted-foreground">
            Selecione um plano na seção de produtos para continuar.
          </p>
          <Button asChild className="mt-6">
            <Link href="/#produtos">Ver planos</Link>
          </Button>
        </main>
        <Footer />
      </>
    )
  }

  const { produto, tier } = match
  const unidade = metricLabel(produto.metric)

  return (
    <>
      <main className="mx-auto grid max-w-4xl gap-8 px-4 py-16 sm:py-24 md:grid-cols-[1fr_1.1fr]">
        {/* Resumo do plano */}
        <div>
          <Eyebrow className="mb-3">Assinar</Eyebrow>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {produto.nome} {tierLabel(tier.id)}
          </h1>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-foreground">{brl(tier.mensal)}</span>
                <span className="font-mono text-sm text-muted-foreground">/mês</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm text-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{tier.incluso.toLocaleString("pt-BR")} {unidade} por mês</span>
                </li>
                {tier.canais != null && (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{tier.canais} {tier.canais === 1 ? "canal" : "canais"} de publicação</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>hoje você paga só a 1ª mensalidade</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Fidelidade de 12 meses. Cancelamento antes do prazo tem multa proporcional ao tempo restante.
              </p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Não é o plano certo?{" "}
                <Link href="/#produtos" className="underline underline-offset-2">trocar</Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dados + pagamento */}
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Seus dados</h2>
          <CheckoutForm produto={match.id} tier={tier.id} />
        </div>
      </main>
      <Footer />
    </>
  )
}
