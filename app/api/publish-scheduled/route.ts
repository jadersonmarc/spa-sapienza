import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"
import { listDueScheduled } from "@/lib/content/queries"
import { contentTransition } from "@/lib/content/transition"
import { secretMatches } from "@/lib/auth/webhook"

// Acionado pelo cron do n8n. Publica os itens "scheduled" cujo horário já chegou.
export async function POST(req: Request) {
  const expected = process.env.WEBHOOK_SECRET
  if (!expected) {
    return NextResponse.json({ error: "WEBHOOK_SECRET não configurado." }, { status: 503 })
  }
  if (!secretMatches(req.headers.get("x-webhook-secret"), expected)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  const [actor] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.role, "admin"))
    .limit(1)
  if (!actor) {
    return NextResponse.json({ error: "Nenhum usuário admin para autoria." }, { status: 500 })
  }

  const due = await listDueScheduled()
  const published: string[] = []
  const failed: { id: string; error: string }[] = []

  for (const item of due) {
    try {
      await contentTransition(item.id, "published", actor.id, {
        note: "Publicação automática (agendamento).",
      })
      published.push(item.id)
    } catch (err) {
      failed.push({ id: item.id, error: err instanceof Error ? err.message : "erro" })
    }
  }

  return NextResponse.json({ published: published.length, failed })
}
