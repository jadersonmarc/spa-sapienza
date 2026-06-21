export function isLinkedinConfigured(): boolean {
  return Boolean(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_AUTHOR_URN)
}

// Publica no LinkedIn como compartilhamento de ARTIGO (originalUrl) — o LinkedIn
// busca a imagem/preview via Open Graph do artigo, sem upload binário.
export async function postToLinkedin(opts: {
  text: string
  articleUrl: string
  title: string
}): Promise<{ id: string; permalink?: string }> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  const author = process.env.LINKEDIN_AUTHOR_URN
  if (!token || !author) throw new Error("LinkedIn não configurado (token/author urn).")

  const body = {
    author,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: opts.text },
        shareMediaCategory: "ARTICLE",
        media: [{ status: "READY", originalUrl: opts.articleUrl, title: { text: opts.title } }],
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  }

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json?.message ?? `LinkedIn: HTTP ${res.status}`)
  }
  const id = String(res.headers.get("x-restli-id") ?? json?.id ?? "")
  return {
    id,
    permalink: id ? `https://www.linkedin.com/feed/update/${id}` : undefined,
  }
}
