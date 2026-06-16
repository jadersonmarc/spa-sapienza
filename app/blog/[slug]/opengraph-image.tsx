import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { getAllPosts, getPostBySlug, type Pilar } from "@/lib/blog"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Sapienza Labs"

// Geração estática no build (sem runtime no Coolify).
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

// Fonte versionada no repo — satori não aceita .woff2; precisa de TTF/OTF.
const geist = readFileSync(join(process.cwd(), "assets/fonts/Geist-Regular.ttf"))

const pilarTheme: Record<Pilar, { color: string; label: string }> = {
  engenharia: { color: "#60a5fa", label: "Engenharia + IA" },
  pme: { color: "#4ade80", label: "Negócio / PME" },
  bastidores: { color: "#fb923c", label: "Bastidores" },
}

interface ImageProps {
  params: Promise<{ slug: string }>
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  const title = post?.title ?? "Sapienza Labs"
  const theme = pilarTheme[post?.pilar ?? "pme"]
  const dateLabel = post
    ? new Date(post.date).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0a0a0b",
          backgroundImage: `radial-gradient(circle at 80% 10%, ${theme.color}40, transparent 52%)`,
          color: "#fafafa",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#a1a1aa",
            }}
          >
            Sapienza Labs
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 24,
              color: theme.color,
              border: `1px solid ${theme.color}55`,
              backgroundColor: `${theme.color}1f`,
            }}
          >
            {theme.label}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 60 : 72,
            fontWeight: 600,
            lineHeight: 1.12,
            letterSpacing: -1,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            color: "#a1a1aa",
          }}
        >
          <div style={{ display: "flex", width: 44, height: 4, backgroundColor: theme.color, borderRadius: 999 }} />
          {dateLabel ? `${dateLabel} · ${post?.readingTime} de leitura` : "sapienzalabs.com.br"}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Geist", data: geist, style: "normal", weight: 400 }],
    }
  )
}
