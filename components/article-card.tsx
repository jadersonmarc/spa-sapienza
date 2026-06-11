import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tag, type TagTone } from "@/components/tag"
import type { Pilar, Post } from "@/lib/posts"

export const pilarConfig: Record<Pilar, { label: string; tone: TagTone }> = {
  "engenharia-ia": { label: "Engenharia + IA", tone: "blue" },
  "negocio-pme": { label: "Negócio / PME", tone: "green" },
  "bastidores": { label: "Bastidores", tone: "orange" }
}

interface ArticleCardProps {
  post: Post
}

export function ArticleCard({ post }: ArticleCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Card className="h-full bg-card/50 border-border/50 transition-colors duration-300 hover:border-primary/30 hover:bg-card/80">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2 sm:gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.date).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} de leitura
            </span>
          </div>
          <Tag tone={pilarConfig[post.pilar].tone} className="mb-2">
            {pilarConfig[post.pilar].label}
          </Tag>
          <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 sm:text-lg">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <CardDescription className="text-sm text-muted-foreground line-clamp-3 leading-relaxed sm:text-base">
            {post.excerpt}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}
