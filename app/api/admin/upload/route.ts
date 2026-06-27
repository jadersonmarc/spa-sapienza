import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { imageSize } from "image-size"
import { auth } from "@/auth"
import { isStorageConfigured, uploadObject } from "@/lib/storage/s3"
import { editorUploadKey, isR2Purpose, mediaUploadKey, type R2Purpose } from "@/lib/storage/keys"
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

function asPurpose(v: FormDataEntryValue | null): R2Purpose | null {
  return typeof v === "string" && isR2Purpose(v) ? v : null
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

  // Destino: `folder` (qualquer finalidade) tem precedência; `platform` segue por
  // compat e também define o alvo de dimensão. Sem nenhum → editor/ (default).
  const platform = asSocialPlatform(form.get("platform"))
  const folder = asPurpose(form.get("folder")) ?? (platform as R2Purpose | null)
  const ext = EXT[file.type]
  const key = folder
    ? mediaUploadKey({ purpose: folder, uuid: randomUUID(), ext })
    : editorUploadKey({ uuid: randomUUID(), ext })
  const buffer = Buffer.from(await file.arrayBuffer())

  // Aviso de dimensão (não bloqueia) só faz sentido quando há alvo de plataforma.
  const target = platform ?? (folder === "instagram" || folder === "linkedin" ? folder : null)
  let warning: string | null = null
  if (target) {
    try {
      const { width, height } = imageSize(buffer)
      warning = dimensionWarning(width ?? 0, height ?? 0, FORMAT_BY_PLATFORM[target])
    } catch {
      /* dimensão ilegível — segue sem aviso */
    }
  }

  try {
    const url = await uploadObject(key, buffer, file.type)
    return NextResponse.json({ url, key, warning })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha no upload." },
      { status: 500 },
    )
  }
}
