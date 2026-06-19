import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import type { ContentStatus } from "./queries"

const { contentItems, auditLog } = schema

// Transições válidas da máquina de estados (SPEC §Máquina de estados).
// draft → in_review → scheduled → published → archived; volta a draft em edição.
const TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  draft: ["in_review"],
  in_review: ["scheduled", "published", "draft"],
  scheduled: ["published", "draft"],
  published: ["archived", "draft"],
  archived: ["draft"],
}

export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function allowedTransitions(from: ContentStatus): ContentStatus[] {
  return TRANSITIONS[from] ?? []
}

export class TransitionError extends Error {}

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

    return { from, to, slug: item.slug }
  })

  // Revalida o site quando a visibilidade pública muda (entra/sai de published).
  // O blog lê do Postgres, então publicar/despublicar reflete sem deploy.
  const visibilityChanged = result.to === "published" || result.from === "published"
  if (visibilityChanged) {
    revalidatePath("/blog")
    revalidatePath(`/blog/${result.slug}`)
    revalidatePath("/sitemap.xml")
  }

  // Webhook social só em → published (SPEC, princípio inviolável #2).
  if (result.to === "published") {
    // TODO(ponte social): POST ao n8n (slug/title/excerpt/url/pilar/image_url)
    // será adicionado na fatia "/api/generate-draft + ponte social".
  }

  return result
}
