import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Eyebrow } from "@/components/eyebrow"
import { getCampaignPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Campanhas | Sapienza Labs",
  description: "Campanhas e apresentações de produto da Sapienza Labs.",
  robots: { index: false, follow: true }, // material avulso, fora do índice editorial
}

export default async function CampanhasPage() {
  const posts = await getCampaignPosts()

  return (
    <main className="min-h-screen">
      <section className="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 sm:mb-12">
            <Eyebrow className="mb-4">Campanhas</Eyebrow>
            <h1 className="mb-3 font-display text-2xl font-semibold text-foreground sm:mb-4 sm:text-3xl md:text-4xl">
              Campanhas e produtos
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Materiais avulsos — campanhas e apresentações de produto da Sapienza Labs.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma campanha publicada ainda.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/campanhas/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-border p-5 transition-colors hover:border-primary/40"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(post.date).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <h2 className="mt-2 font-display text-lg font-semibold text-foreground group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
