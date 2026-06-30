import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import {
  createContentItem,
  listPostTitlesByPilar,
  listThematicSeedsByPilar,
  slugExists,
  type Pilar,
} from "@/lib/content/queries"
import { generateDraft, isAiConfigured } from "@/lib/ai/draft"
import { secretMatches } from "@/lib/auth/webhook"

const PILARES: Pilar[] = ["p1", "p2", "p3"]

async function uniqueSlug(base: string): Promise<string> {
  if (!(await slugExists(base))) return base
  for (let i = 2; i < 50; i++) {
    const candidate = `${base}-${i}`
    if (!(await slugExists(candidate))) return candidate
  }
  return `${base}-${Date.now()}`
}

export async function POST(req: Request) {
  const expected = process.env.WEBHOOK_SECRET
  if (!expected) {
    return NextResponse.json({ error: "WEBHOOK_SECRET não configurado." }, { status: 503 })
  }
  if (!secretMatches(req.headers.get("x-webhook-secret"), expected)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  if (!isAiConfigured()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 503 })
  }

  let pilar: Pilar
  try {
    const body = await req.json()
    pilar = body?.pilar
    if (!PILARES.includes(pilar)) {
      return NextResponse.json({ error: "pilar inválido (use p1|p2|p3)." }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 })
  }

  // Autor = primeiro admin (geração de máquina é atribuída ao admin).
  const [author] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.role, "admin"))
    .limit(1)
  if (!author) {
    return NextResponse.json({ error: "Nenhum usuário admin para autoria." }, { status: 500 })
  }

  try {
    // Renovação de tema: evita repetir títulos e semeia pelas sugestões temáticas.
    const [avoidTitles, themeSeeds] = await Promise.all([
      listPostTitlesByPilar(pilar),
      listThematicSeedsByPilar(pilar),
    ])
    const draft = await generateDraft(pilar, { avoidTitles, themeSeeds })
    const slug = await uniqueSlug(draft.slug)
    const itemId = await createContentItem(
      { type: "post", slug, pilar },
      draft.rev,
      author.id,
    )
    return NextResponse.json({ itemId })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao gerar rascunho." },
      { status: 500 },
    )
  }
}
