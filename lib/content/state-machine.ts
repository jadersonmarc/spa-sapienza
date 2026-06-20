import type { ContentStatus } from "./queries"

// Máquina de estados editorial (SPEC §Máquina de estados). Lógica pura — sem
// db/next aqui, para ser testável isoladamente.
// draft → in_review → scheduled → published → archived; volta a draft em edição.
export const TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  draft: ["in_review"],
  in_review: ["scheduled", "published", "draft"],
  scheduled: ["published", "draft"],
  published: ["archived", "draft"],
  archived: ["draft"],
}

export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function allowedTransitions(from: ContentStatus): ContentStatus[] {
  return TRANSITIONS[from] ?? []
}

export class TransitionError extends Error {}
