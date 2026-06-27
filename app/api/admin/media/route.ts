import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { deleteObject, isStorageConfigured, listObjects, publicUrlForKey } from "@/lib/storage/s3"
import { isR2Purpose, listPrefixFor } from "@/lib/storage/keys"
import { isKnownFolderKey } from "@/lib/content/media-usage"
import { findImageReferences } from "@/lib/content/queries"

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

// Exclui uma imagem. Se referenciada e sem `confirm=1`, responde 409 { inUse }.
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  if (!isStorageConfigured()) {
    return NextResponse.json({ error: "Storage não configurado." }, { status: 503 })
  }

  const sp = new URL(req.url).searchParams
  const key = sp.get("key") ?? ""
  if (!isKnownFolderKey(key)) {
    return NextResponse.json({ error: "Imagem inválida." }, { status: 400 })
  }
  const confirm = sp.get("confirm") === "1"

  try {
    const refs = await findImageReferences(publicUrlForKey(key))
    if (refs.total > 0 && !confirm) {
      return NextResponse.json({ inUse: refs }, { status: 409 })
    }
    await deleteObject(key)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao excluir." },
      { status: 500 },
    )
  }
}
