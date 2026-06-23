export function isLinkedinConfigured(): boolean {
  return Boolean(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_AUTHOR_URN)
}

// Registra o upload e devolve { uploadUrl, asset } (URN do recurso de mídia).
async function registerUpload(token: string, author: string): Promise<{ uploadUrl: string; asset: string }> {
  const res = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: author,
        serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }],
      },
    }),
    signal: AbortSignal.timeout(20000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.message ?? `LinkedIn (registerUpload): HTTP ${res.status}`)
  const uploadUrl =
    json?.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl
  const asset = json?.value?.asset
  if (!uploadUrl || !asset) throw new Error("LinkedIn: resposta de registerUpload sem uploadUrl/asset.")
  return { uploadUrl, asset }
}

// Publica no LinkedIn como IMAGE share: sobe o binário do card e referencia o asset.
export async function postToLinkedin(opts: {
  text: string
  title: string
  imageBuffer: Buffer
}): Promise<{ id: string; permalink?: string }> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  const author = process.env.LINKEDIN_AUTHOR_URN
  if (!token || !author) {
    const missing = [!token && "LINKEDIN_ACCESS_TOKEN", !author && "LINKEDIN_AUTHOR_URN"].filter(Boolean)
    throw new Error(`LinkedIn não configurado no ambiente de execução: ${missing.join(", ")} ausente(s).`)
  }

  const { uploadUrl, asset } = await registerUpload(token, author)

  const up = await fetch(uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/png" },
    body: new Uint8Array(opts.imageBuffer),
    signal: AbortSignal.timeout(30000),
  })
  if (!up.ok) throw new Error(`LinkedIn (upload de imagem): HTTP ${up.status}`)

  const body = {
    author,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: opts.text },
        shareMediaCategory: "IMAGE",
        media: [{ status: "READY", media: asset, title: { text: opts.title } }],
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
  if (!res.ok) throw new Error(json?.message ?? `LinkedIn: HTTP ${res.status}`)

  const id = String(res.headers.get("x-restli-id") ?? json?.id ?? "")
  return { id, permalink: id ? `https://www.linkedin.com/feed/update/${id}` : undefined }
}
