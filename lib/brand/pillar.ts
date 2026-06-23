import type { Pilar } from "@/lib/blog"
import type { Field } from "./tokens"

// Pilar → tratamento (função pura). Segue o vocabulário do código
// (`engenharia | pme | bastidores`), não o `engai` do prompt.
export function pillarStyle(pilar: Pilar): { tag: string; field: Field } {
  switch (pilar) {
    case "engenharia":
      return { tag: "ENG/AI", field: "ink" }
    case "pme":
      return { tag: "NEGÓCIO", field: "surface" }
    case "bastidores":
      return { tag: "BASTIDORES", field: "ink" }
  }
}
