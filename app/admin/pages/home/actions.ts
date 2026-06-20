"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth/session"
import { ensurePage, savePageRevision, type HomeBlocks } from "@/lib/content/pages"

export type PageFormState = { error?: string; ok?: boolean }

export async function savePageAction(
  _prev: PageFormState,
  formData: FormData,
): Promise<PageFormState> {
  const user = await requireUser()
  const s = (k: string) => String(formData.get(k) ?? "").trim()

  const blocks: HomeBlocks = {
    hero: {
      badge: s("hero.badge"),
      titleLead: s("hero.titleLead"),
      titleHighlight: s("hero.titleHighlight"),
      subtitle: s("hero.subtitle"),
      ctaLabel: s("hero.ctaLabel"),
    },
    services: { title: s("services.title"), subtitle: s("services.subtitle") },
    howItWorks: {
      eyebrow: s("howItWorks.eyebrow"),
      title: s("howItWorks.title"),
      subtitle: s("howItWorks.subtitle"),
    },
    portfolio: { title: s("portfolio.title"), subtitle: s("portfolio.subtitle") },
    trust: { eyebrow: s("trust.eyebrow"), title: s("trust.title"), subtitle: s("trust.subtitle") },
    differentials: {
      eyebrow: s("differentials.eyebrow"),
      titleLead: s("differentials.titleLead"),
      titleHighlight: s("differentials.titleHighlight"),
      subtitle: s("differentials.subtitle"),
    },
  }

  try {
    const itemId = await ensurePage("home", user.id)
    await savePageRevision(itemId, blocks, user.id)
    revalidatePath("/admin/pages/home")
    return { ok: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao salvar." }
  }
}
