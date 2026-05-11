import type { Metadata } from "next"
import { Header } from "@/components/header"
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
      <Header />
      
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <BlogBreadcrumb />
          
          <div className="mt-8 mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Insights sobre desenvolvimento de software, automação e tecnologia para empresas que buscam crescer de forma inteligente.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
