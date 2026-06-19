import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

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
