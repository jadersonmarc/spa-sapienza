import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { isStorageConfigured, listObjects } from "@/lib/storage/s3"
import { isR2Purpose, listPrefixFor } from "@/lib/storage/keys"

// Lista as imagens de uma pasta/finalidade do R2 (biblioteca + seletor).
// `folder` é validado contra as finalidades conhecidas — sem prefixo cru do cliente.
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  if (!isStorageConfigured()) {
    return NextResponse.json({ error: "Storage não configurado." }, { status: 503 })
  }

  const sp = new URL(req.url).searchParams
  const folder = sp.get("folder") ?? ""
  if (!isR2Purpose(folder)) {
    return NextResponse.json({ error: "Pasta inválida." }, { status: 400 })
  }
  const token = sp.get("token") ?? undefined

  try {
    const { objects, nextToken } = await listObjects(listPrefixFor(folder), { token })
    return NextResponse.json({ objects, nextToken })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao listar imagens." },
      { status: 500 },
    )
  }
}
