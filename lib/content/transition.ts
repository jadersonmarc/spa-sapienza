import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import type { ContentStatus } from "./queries"
import { canTransition, TransitionError } from "./state-machine"

// Reexporta a lógica pura da máquina de estados (consumidores existentes a importam daqui).
export { canTransition, allowedTransitions, TransitionError } from "./state-machine"

const { contentItems, contentRevisions, auditLog } = schema

type TransitionOpts = {
  scheduledAt?: Date | null
  note?: string | null
}

// Único ponto de mudança de status. Valida, persiste, audita e, só em
// → published, dispara os efeitos colaterais (revalidação + webhook social).
export async function contentTransition(
  itemId: string,
  to: ContentStatus,
  actorId: string,
  opts: TransitionOpts = {},
) {
  const result = await db.transaction(async (tx) => {
    const [item] = await tx
      .select({
        status: contentItems.status,
        publishedAt: contentItems.publishedAt,
        slug: contentItems.slug,
        type: contentItems.type,
      })
      .from(contentItems)
      .where(eq(contentItems.id, itemId))
      .limit(1)
    if (!item) throw new TransitionError("Conteúdo não encontrado.")

    const from = item.status
    if (from === to) throw new TransitionError("O conteúdo já está nesse status.")
    if (!canTransition(from, to))
      throw new TransitionError(`Transição inválida: ${from} → ${to}.`)

    const patch: Partial<typeof contentItems.$inferInsert> = {
      status: to,
      updatedAt: new Date(),
    }

    if (to === "scheduled") {
      if (!opts.scheduledAt || opts.scheduledAt.getTime() <= Date.now())
        throw new TransitionError("Agendamento exige uma data/hora futura.")
      patch.scheduledAt = opts.scheduledAt
    } else {
      patch.scheduledAt = null // limpa agendamento ao sair de scheduled
    }

    if (to === "published") {
      patch.publishedAt = item.publishedAt ?? new Date()
    }

    await tx.update(contentItems).set(patch).where(eq(contentItems.id, itemId))

    await tx.insert(auditLog).values({
      contentItemId: itemId,
      actorId,
      fromStatus: from,
      toStatus: to,
      note: opts.note ?? null,
    })

    return { from, to, slug: item.slug, type: item.type }
  })

  // Revalida o site quando a visibilidade pública muda (entra/sai de published).
  const visibilityChanged = result.to === "published" || result.from === "published"
  if (visibilityChanged) {
    if (result.type === "page") {
      // Página: home → '/'; outras → '/{slug}'.
      revalidatePath(result.slug === "home" ? "/" : `/${result.slug}`)
    } else {
      revalidatePath("/blog")
      revalidatePath(`/blog/${result.slug}`)
      revalidatePath("/sitemap.xml")
    }
  }

  // Webhook social só em → published (SPEC, princípio inviolável #2) — só posts.
  if (result.to === "published" && result.type === "post") {
    await notifySocialWebhook(itemId).catch((err) => {
      console.error("[social] falha no webhook de publicação:", err)
    })
  }

  return result
}

const SITE_URL = process.env.SITE_URL ?? "https://sapienzalabs.com.br"

// POST best-effort ao n8n com os dados do post publicado (contrato do SPEC).
async function notifySocialWebhook(itemId: string) {
  const url = process.env.N8N_PUBLISH_WEBHOOK_URL
  const secret = process.env.WEBHOOK_SECRET
  if (!url || !secret) return // não configurado → no-op

  const [row] = await db
    .select({
      slug: contentItems.slug,
      pilar: contentItems.pilar,
      title: contentRevisions.title,
      excerpt: contentRevisions.excerpt,
    })
    .from(contentItems)
    .innerJoin(
      contentRevisions,
      eq(contentRevisions.id, contentItems.currentRevisionId),
    )
    .where(eq(contentItems.id, itemId))
    .limit(1)
  if (!row) return

  const postUrl = `${SITE_URL}/blog/${row.slug}`
  const payload = {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    url: postUrl,
    pilar: row.pilar,
    image_url: `${postUrl}/opengraph-image`,
  }

  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-webhook-secret": secret },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  })
}
