// Helpers puros para mover/renomear/excluir imagens da biblioteca com segurança.
// Sem DB/SDK — só strings. A checagem de "em uso" no banco fica em queries.ts.
import { prefixFor, R2_PURPOSES, type R2Purpose } from "@/lib/storage/keys"

/** Nome de arquivo seguro: sem barras/espaços problemáticos; preserva ext. */
export function sanitizeFileName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^\w.\-]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
  return cleaned || "arquivo"
}

/** Pasta (prefixo) de uma key. `social/instagram/x.png` → `social/instagram`. */
export function keyFolder(key: string): string {
  const i = key.lastIndexOf("/")
  return i >= 0 ? key.slice(0, i) : ""
}

/** Renomear: mantém a pasta, troca só o nome do arquivo (sanitizado). */
export function destKeyForRename(srcKey: string, newName: string): string {
  const folder = keyFolder(srcKey)
  const safe = sanitizeFileName(newName)
  return folder ? `${folder}/${safe}` : safe
}

/** Mover: mantém o nome do arquivo, troca a pasta para a finalidade alvo. */
export function destKeyForMove(srcKey: string, target: R2Purpose): string {
  const file = srcKey.split("/").pop() || srcKey
  return `${prefixFor(target)}/${file}`
}

/** A key está sob alguma pasta conhecida? (evita escrita arbitrária no bucket) */
export function isKnownFolderKey(key: string): boolean {
  if (!key || key.includes("..") || key.startsWith("/")) return false
  return R2_PURPOSES.some((p) => key.startsWith(`${prefixFor(p)}/`))
}

/** O corpo markdown referencia esta URL? (best-effort, substring) */
export function markdownReferencesUrl(body: string, url: string): boolean {
  return body.includes(url)
}
