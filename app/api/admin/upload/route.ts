import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { auth } from "@/auth"
import { isStorageConfigured, uploadObject } from "@/lib/storage/s3"

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
// SVG fora da allowlist (pode conter <script> → XSS quando servido inline).
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
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

  const now = new Date()
  const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${EXT[file.type]}`
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const url = await uploadObject(key, buffer, file.type)
    return NextResponse.json({ url })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha no upload." },
      { status: 500 },
    )
  }
}
