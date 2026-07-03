import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { BrandCover } from "@/components/brand-cover"
import { Button } from "@/components/ui/button"
import { getCampaignPosts, getCampaignPostBySlug } from "@/lib/blog"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getCampaignPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getCampaignPostBySlug(slug)
  if (!post) return { title: "Não encontrado | Sapienza Labs" }
  return {
    title: `${post.title} | Sapienza Labs`,
    description: post.excerpt,
    robots: { index: false, follow: true },
  }
}

export default async function CampaignPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getCampaignPostBySlug(slug)
  if (!post) notFound()

  return (
    <main className="min-h-screen">
      <article className="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/campanhas"
            className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Campanhas
          </Link>

          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={480}
              className="mt-6 aspect-[5/2] w-full rounded-xl border border-border/50 object-cover sm:mt-8"
            />
          ) : (
            <BrandCover
              pilar={post.pilar}
              title={post.title}
              priority
              className="mt-6 rounded-xl border border-border/50 sm:mt-8"
            />
          )}

          <header className="mb-8 mt-6 sm:mb-10">
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-sm text-muted-foreground sm:mb-4 sm:gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readingTime} de leitura
              </span>
            </div>
            <h1 className="text-balance font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {post.title}
            </h1>
          </header>

          <div className="markdown-preview max-w-none text-[1.0625rem] leading-[1.75]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-12 border-t border-border/50 pt-8">
            <Button asChild>
              <Link href="/contato">Falar com a Sapienza Labs</Link>
            </Button>
          </div>
        </div>
      </article>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
