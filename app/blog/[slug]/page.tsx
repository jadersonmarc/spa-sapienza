import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, Clock, ArrowLeft, MessageCircle } from "lucide-react"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { BlogBreadcrumb } from "@/components/blog-breadcrumb"
import { Button } from "@/components/ui/button"
import { getPostBySlug, getAllPosts } from "@/lib/posts"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: "Artigo não encontrado | Sapienza Labs"
    }
  }

  const url = `https://sapienzalabs.com.br/blog/${post.slug}`

  return {
    title: `${post.title} | Sapienza Labs`,
    description: post.excerpt,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      siteName: "Sapienza Labs",
      images: [
        {
          url: "https://sapienzalabs.com.br/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt
    },
    alternates: {
      canonical: url
    }
  }
}

function parseMarkdownContent(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-foreground mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-foreground mt-10 mb-4">$1</h2>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    // Lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal text-muted-foreground leading-relaxed">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc text-muted-foreground leading-relaxed">$1</li>')
    // Paragraphs
    .split('\n\n')
    .map(block => {
      if (block.startsWith('<h') || block.startsWith('<li')) return block
      if (block.trim() === '') return ''
      return `<p class="text-muted-foreground leading-relaxed mb-4">${block}</p>`
    })
    .join('\n')
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const htmlContent = parseMarkdownContent(post.content)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role
    },
    publisher: {
      "@type": "Organization",
      name: "Sapienza Labs",
      logo: {
        "@type": "ImageObject",
        url: "https://sapienzalabs.com.br/logo-sapienza.png"
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://sapienzalabs.com.br/blog/${post.slug}`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen">
        <article className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <BlogBreadcrumb currentPage={post.title} />
            
            <header className="mt-6 mb-8 sm:mt-8 sm:mb-10">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3 sm:mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readingTime} de leitura
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground leading-tight text-balance">
                {post.title}
              </h1>
            </header>

            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Author block */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <div className="flex items-center gap-4">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border border-primary/25 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-primary/12 text-sm font-semibold text-primary">
                    SL
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">{post.author.role}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 p-4 sm:mt-12 sm:p-6 rounded-xl bg-card/50 border border-border/50">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Precisa de ajuda com seu projeto?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                A Sapienza Labs desenvolve soluções de software sob medida para empresas que buscam eficiencia e inovacao.
              </p>
              <Button asChild className="w-full sm:w-auto">
                <a 
                  href="https://wa.me/5521986537054?text=Olá! Vim pelo blog e gostaria de saber mais sobre os serviços."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Falar com especialista
                </a>
              </Button>
            </div>

            {/* Back to blog */}
            <div className="mt-10">
              <Button variant="ghost" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o blog
                </Link>
              </Button>
            </div>
          </div>
        </article>

        <Footer />
        <WhatsAppButton />
      </main>
    </>
  )
}
