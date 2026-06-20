import type { SocialStatus } from "./queries"

// Fluxo de revisão do post social: rascunho → aprovado → enviado (volta a rascunho).
// Lógica pura — testável isoladamente.
export const SOCIAL_TRANSITIONS: Record<SocialStatus, SocialStatus[]> = {
  draft: ["approved"],
  approved: ["sent", "draft"],
  sent: [],
}

export function canSocialTransition(from: SocialStatus, to: SocialStatus): boolean {
  return SOCIAL_TRANSITIONS[from]?.includes(to) ?? false
}

export function allowedSocialTransitions(from: SocialStatus): SocialStatus[] {
  return SOCIAL_TRANSITIONS[from] ?? []
}
