import type { Metadata } from "next"
import { MargotProductPage } from "@/components/margot/product-page"

const TITLE = "Margot Atendente | Sapienza Labs"
const DESCRIPTION =
  "Agente de IA que atende o WhatsApp da sua empresa 24h: responde na hora, qualifica o lead, organiza o funil e passa para você só quando precisa."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://sapienzalabs.com.br/margot/atendente",
    siteName: "Sapienza Labs",
    locale: "pt_BR",
    type: "website",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://sapienzalabs.com.br/margot/atendente" },
}

export default function MargotAtendentePage() {
  return <MargotProductPage id="margot" />
}
