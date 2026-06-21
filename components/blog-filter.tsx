"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ArticleCard, pilarConfig } from "@/components/article-card"
import { tagVariants } from "@/components/tag"
import { cn } from "@/lib/utils"
import type { Pilar, Post } from "@/lib/blog"

const filters: { value: Pilar | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pme", label: pilarConfig["pme"].label },
  { value: "engenharia", label: pilarConfig["engenharia"].label },
  { value: "bastidores", label: pilarConfig["bastidores"].label }
]

const PAGE_SIZE = 6

interface BlogFilterProps {
  posts: Post[]
}

export function BlogFilter({ posts }: BlogFilterProps) {
  const [activeFilter, setActiveFilter] = useState<Pilar | "todos">("todos")
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () =>
      activeFilter === "todos"
        ? posts
        : posts.filter((post) => post.pilar === activeFilter),
    [posts, activeFilter]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function selectFilter(value: Pilar | "todos") {
    setActiveFilter(value)
    setPage(1)
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2 sm:mb-10">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => selectFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
            className={cn(
              tagVariants({
                tone: activeFilter === filter.value
                  ? filter.value === "todos"
                    ? "primary"
                    : pilarConfig[filter.value].tone
                  : "neutral",
                size: "md",
                interactive: activeFilter !== filter.value,
              })
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-2 sm:mt-12"
              aria-label="Paginação dos artigos"
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className={cn(
                  tagVariants({ tone: "neutral", size: "md", interactive: true }),
                  "gap-1 disabled:pointer-events-none disabled:opacity-40"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === currentPage ? "page" : undefined}
                  aria-label={`Página ${n}`}
                  className={cn(
                    tagVariants({
                      tone: n === currentPage ? "primary" : "neutral",
                      size: "md",
                      interactive: n !== currentPage,
                    }),
                    "min-w-9 justify-center font-mono"
                  )}
                >
                  {n}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
                className={cn(
                  tagVariants({ tone: "neutral", size: "md", interactive: true }),
                  "gap-1 disabled:pointer-events-none disabled:opacity-40"
                )}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          Nenhum artigo neste pilar ainda — em breve.
        </p>
      )}
    </>
  )
}
