import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/posts"

const BASE_URL = "https://sapienzalabs.com.br"

export default function sitemap(): MetadataRoute.Sitemap {
  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${BASE_URL}/sobre`,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.9
    },
    ...postEntries
  ]
}
