import type { Metadata } from "next"
import { MargotProductPage } from "@/components/margot/product-page"

const TITLE = "Margot Editora | Sapienza Labs"
const DESCRIPTION =
  "Conteúdo da sua marca criado e publicado no automático — artigos, posts e peças em movimento no seu tom, sem você escrever. Blog, Instagram e LinkedIn."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://sapienzalabs.com.br/margot/editora",
    siteName: "Sapienza Labs",
    locale: "pt_BR",
    type: "website",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://sapienzalabs.com.br/margot/editora" },
}

export default function MargotEditoraPage() {
  return <MargotProductPage id="motor" />
}
