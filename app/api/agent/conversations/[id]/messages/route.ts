import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/auth"
import { listMessages, AgentError } from "@/lib/agent/client"

// BFF de polling: o thread (client) busca aqui; o token do motor fica server-side.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const after = req.nextUrl.searchParams.get("after") ?? undefined

  try {
    const messages = await listMessages(id, { after, limit: 100 })
    return NextResponse.json(messages, { headers: { "Cache-Control": "no-store" } })
  } catch (e) {
    const status = e instanceof AgentError ? e.status : 502
    return NextResponse.json({ error: "agent_unreachable" }, { status })
  }
}
