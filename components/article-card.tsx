import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Post } from "@/lib/posts"

interface ArticleCardProps {
  post: Post
}

export function ArticleCard({ post }: ArticleCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Card className="h-full bg-card/50 border-border/50 transition-all duration-300 hover:border-primary/30 hover:bg-card/80">
        <CardHeader>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
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
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground line-clamp-3 leading-relaxed">
            {post.excerpt}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}
