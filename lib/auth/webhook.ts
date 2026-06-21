import { createHash, timingSafeEqual } from "node:crypto"

// Compara o secret em tempo constante. Hash antes do compare para igualar o
// tamanho dos buffers (timingSafeEqual exige mesmo comprimento) e não vazar
// o tamanho do secret esperado. Lógica pura — testável isoladamente.
export function secretMatches(provided: string | null | undefined, expected: string): boolean {
  if (!provided) return false
  const a = createHash("sha256").update(provided).digest()
  const b = createHash("sha256").update(expected).digest()
  return timingSafeEqual(a, b)
}
