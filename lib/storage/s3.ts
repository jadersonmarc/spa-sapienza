import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"

const {
  S3_ENDPOINT,
  S3_REGION,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_PUBLIC_URL,
} = process.env

export function isStorageConfigured(): boolean {
  return Boolean(
    S3_ENDPOINT &&
      S3_BUCKET &&
      S3_ACCESS_KEY_ID &&
      S3_SECRET_ACCESS_KEY &&
      S3_PUBLIC_URL,
  )
}

let client: S3Client | null = null
function getClient(): S3Client {
  if (!isStorageConfigured()) {
    throw new Error("Storage S3/MinIO não configurado (ver envs S3_*).")
  }
  client ??= new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION || "us-east-1",
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID!,
      secretAccessKey: S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // necessário para MinIO
  })
  return client
}

// Sobe um objeto e retorna a URL pública (S3_PUBLIC_URL/key).
export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
  return `${S3_PUBLIC_URL!.replace(/\/$/, "")}/${key}`
}

export interface StoredObject {
  key: string
  url: string
}

// Mapeia o retorno do ListObjectsV2 para {key, url público}. Puro (testável):
// descarta chaves vazias e "pseudo-pastas" (terminadas em "/").
export function mapListedObjects(
  contents: { Key?: string }[] | undefined,
  publicUrl: string,
): StoredObject[] {
  const base = publicUrl.replace(/\/$/, "")
  return (contents ?? [])
    .map((o) => o.Key)
    .filter((k): k is string => typeof k === "string" && k.length > 0 && !k.endsWith("/"))
    .map((key) => ({ key, url: `${base}/${key}` }))
}

// Lista objetos de uma pasta (prefixo) e devolve {key, url}. Alimenta o picker.
export async function listObjectsByPrefix(prefix: string, max = 100): Promise<StoredObject[]> {
  const res = await getClient().send(
    new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix, MaxKeys: max }),
  )
  return mapListedObjects(res.Contents, S3_PUBLIC_URL!)
}
