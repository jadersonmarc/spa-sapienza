"use client"

import { useState } from "react"
import { ArticleCard, pilarConfig } from "@/components/article-card"
import type { Pilar, Post } from "@/lib/posts"

const filters: { value: Pilar | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "negocio-pme", label: pilarConfig["negocio-pme"].label },
  { value: "engenharia-ia", label: pilarConfig["engenharia-ia"].label },
  { value: "bastidores", label: pilarConfig["bastidores"].label }
]

interface BlogFilterProps {
  posts: Post[]
}

export function BlogFilter({ posts }: BlogFilterProps) {
  const [activeFilter, setActiveFilter] = useState<Pilar | "todos">("todos")

  const filtered = activeFilter === "todos"
    ? posts
    : posts.filter((post) => post.pilar === activeFilter)

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2 sm:mb-10">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
            className={`rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-wider transition-colors ${
              activeFilter === filter.value
                ? filter.value === "todos"
                  ? "border-primary/30 bg-primary/15 text-primary"
                  : pilarConfig[filter.value].color
                : "border-border/50 text-muted-foreground hover:bg-white/4 hover:text-foreground"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          Nenhum artigo neste pilar ainda — em breve.
        </p>
      )}
    </>
  )
}
