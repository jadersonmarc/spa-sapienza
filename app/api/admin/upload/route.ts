import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { imageSize } from "image-size"
import { auth } from "@/auth"
import { isStorageConfigured, uploadObject } from "@/lib/storage/s3"
import { editorUploadKey, socialUploadKey } from "@/lib/storage/keys"
import { dimensionWarning, FORMAT_BY_PLATFORM, type SocialPlatform } from "@/lib/storage/dimensions"

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
// SVG fora da allowlist (pode conter <script> → XSS quando servido inline).
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
}

function asSocialPlatform(v: FormDataEntryValue | null): SocialPlatform | null {
  return v === "instagram" || v === "linkedin" ? v : null
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Storage não configurado. Defina as envs S3_* (MinIO)." },
      { status: 503 },
    )
  }

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 })
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Tipo de imagem não suportado." }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagem maior que 5 MB." }, { status: 400 })
  }

  // `platform` define a pasta (social/<plataforma>/) e o alvo de dimensão.
  const platform = asSocialPlatform(form.get("platform"))
  const ext = EXT[file.type]
  const key = platform
    ? socialUploadKey({ platform, uuid: randomUUID(), ext })
    : editorUploadKey({ uuid: randomUUID(), ext })
  const buffer = Buffer.from(await file.arrayBuffer())

  // Aviso de dimensão (não bloqueia) só faz sentido quando há alvo de plataforma.
  let warning: string | null = null
  if (platform) {
    try {
      const { width, height } = imageSize(buffer)
      warning = dimensionWarning(width ?? 0, height ?? 0, FORMAT_BY_PLATFORM[platform])
    } catch {
      /* dimensão ilegível — segue sem aviso */
    }
  }

  try {
    const url = await uploadObject(key, buffer, file.type)
    return NextResponse.json({ url, warning })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha no upload." },
      { status: 500 },
    )
  }
}
