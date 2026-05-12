import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { BlogBreadcrumb } from "@/components/blog-breadcrumb"
import { ArticleCard } from "@/components/article-card"
import { getAllPosts } from "@/lib/posts"

export const metadata: Metadata = {
  title: "Blog | Sapienza Labs - Artigos sobre Desenvolvimento de Software",
  description: "Artigos e insights sobre desenvolvimento de software personalizado, automação de processos e integração de sistemas para empresas.",
  openGraph: {
    title: "Blog | Sapienza Labs",
    description: "Artigos e insights sobre desenvolvimento de software personalizado, automação de processos e integração de sistemas para empresas.",
    url: "https://sapienzalabs.com.br/blog",
    type: "website",
    siteName: "Sapienza Labs"
  },
  alternates: {
    canonical: "https://sapienzalabs.com.br/blog"
  }
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen">
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <BlogBreadcrumb />
          
          <div className="mt-6 mb-8 sm:mt-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-3 sm:mb-4">
              Blog
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
              Insights sobre desenvolvimento de software, automação e tecnologia para empresas que buscam crescer de forma inteligente.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
