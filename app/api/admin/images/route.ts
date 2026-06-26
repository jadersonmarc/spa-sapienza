import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { isStorageConfigured, listObjectsByPrefix } from "@/lib/storage/s3"
import { listPrefixFor } from "@/lib/storage/keys"

// Plataformas cujo prefixo pode ser listado (não aceita prefixo cru do cliente).
const PLATFORMS = new Set(["instagram", "linkedin"])

// Lista as imagens já hospedadas na pasta de uma plataforma, para o picker.
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  if (!isStorageConfigured()) {
    return NextResponse.json({ error: "Storage não configurado." }, { status: 503 })
  }

  const platform = new URL(req.url).searchParams.get("platform") ?? ""
  if (!PLATFORMS.has(platform)) {
    return NextResponse.json({ error: "Plataforma inválida." }, { status: 400 })
  }

  try {
    const images = await listObjectsByPrefix(listPrefixFor(platform as "instagram" | "linkedin"))
    return NextResponse.json({ images })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao listar imagens." },
      { status: 500 },
    )
  }
}
