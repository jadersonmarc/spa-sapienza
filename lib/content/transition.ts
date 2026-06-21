import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import type { ContentStatus } from "./queries"
import { canTransition, TransitionError } from "./state-machine"

// Reexporta a lógica pura da máquina de estados (consumidores existentes a importam daqui).
export { canTransition, allowedTransitions, TransitionError } from "./state-machine"

const { contentItems, auditLog } = schema

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

  // Postagem social agora é por botão no admin (R2) — não dispara no publish.
  return result
}
