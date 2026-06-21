const GRAPH = "https://graph.facebook.com/v21.0"

export function isInstagramConfigured(): boolean {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_ACCOUNT_ID)
}

async function igFetch(url: string, params: Record<string, string>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
    signal: AbortSignal.timeout(20000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Instagram: HTTP ${res.status}`)
  }
  return json
}

// Publica no IG Business (Facebook Graph, token EAA): container → publish.
export async function postToInstagram(opts: {
  caption: string
  imageUrl: string
}): Promise<{ id: string; permalink?: string }> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const igId = process.env.INSTAGRAM_ACCOUNT_ID
  if (!token || !igId) throw new Error("Instagram não configurado (token/account id).")

  const container = await igFetch(`${GRAPH}/${igId}/media`, {
    image_url: opts.imageUrl,
    caption: opts.caption,
    access_token: token,
  })
  const published = await igFetch(`${GRAPH}/${igId}/media_publish`, {
    creation_id: String(container.id),
    access_token: token,
  })

  let permalink: string | undefined
  try {
    const res = await fetch(
      `${GRAPH}/${published.id}?fields=permalink&access_token=${token}`,
      { signal: AbortSignal.timeout(10000) },
    )
    const j = await res.json()
    permalink = j?.permalink
  } catch {
    /* permalink é best-effort */
  }
  return { id: String(published.id), permalink }
}
