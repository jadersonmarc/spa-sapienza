import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { copyObject, deleteObject, isStorageConfigured, publicUrlForKey } from "@/lib/storage/s3"
import { isKnownFolderKey } from "@/lib/content/media-usage"
import { findImageReferences } from "@/lib/content/queries"

// Move/renomeia uma imagem (copy + delete). O cliente calcula `destKey` (mesma
// pasta = renomear; outra pasta = mover). Se a origem está referenciada e sem
// `confirm`, responde 409 { inUse } — a v1 NÃO reescreve as referências.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  if (!isStorageConfigured()) {
    return NextResponse.json({ error: "Storage não configurado." }, { status: 503 })
  }

  const body = (await req.json().catch(() => null)) as
    | { srcKey?: string; destKey?: string; confirm?: boolean }
    | null
  const srcKey = body?.srcKey ?? ""
  const destKey = body?.destKey ?? ""
  if (!isKnownFolderKey(srcKey) || !isKnownFolderKey(destKey)) {
    return NextResponse.json({ error: "Origem ou destino inválido." }, { status: 400 })
  }
  if (srcKey === destKey) {
    return NextResponse.json({ error: "Origem e destino iguais." }, { status: 400 })
  }

  try {
    const refs = await findImageReferences(publicUrlForKey(srcKey))
    if (refs.total > 0 && !body?.confirm) {
      return NextResponse.json({ inUse: refs }, { status: 409 })
    }
    const url = await copyObject(srcKey, destKey)
    await deleteObject(srcKey)
    return NextResponse.json({ url, key: destKey })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao mover." },
      { status: 500 },
    )
  }
}
