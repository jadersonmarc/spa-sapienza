import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { BlogBreadcrumb } from "@/components/blog-breadcrumb"
import { BlogFilter } from "@/components/blog-filter"
import { Eyebrow } from "@/components/eyebrow"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog | Sapienza Labs - Artigos sobre Desenvolvimento de Software",
  description: "Artigos e insights sobre desenvolvimento de software personalizado, automação de processos e integração de sistemas para empresas.",
  openGraph: {
    title: "Blog | Sapienza Labs",
    description: "Artigos e insights sobre desenvolvimento de software personalizado, automação de processos e integração de sistemas para empresas.",
    url: "https://sapienzalabs.com.br/blog",
    type: "website",
    siteName: "Sapienza Labs",
    images: ["/og-image.png"]
  },
  alternates: {
    canonical: "https://sapienzalabs.com.br/blog"
  }
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen">
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <BlogBreadcrumb />
          
          <div className="mt-6 mb-8 sm:mt-8 sm:mb-12">
            <Eyebrow className="mb-4">Diário de engenharia</Eyebrow>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-3 sm:mb-4">
              Blog
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
              Insights sobre desenvolvimento de software, automação e tecnologia para empresas que buscam crescer de forma inteligente.
            </p>
          </div>

          <BlogFilter posts={posts} />
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
