import Anthropic from "@anthropic-ai/sdk"

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export const AI_MODEL = "claude-opus-4-8"

type StructuredOpts = {
  system: string
  user: string
  schema: Record<string, unknown>
  effort?: "low" | "medium" | "high"
  maxTokens?: number
}

// Chamada à Claude com saída estruturada (json_schema). Retorna o objeto parseado.
export async function callStructured<T>(
  opts: StructuredOpts,
): Promise<{ data: T; model: string }> {
  if (!isAiConfigured()) throw new Error("ANTHROPIC_API_KEY não configurada.")
  const client = new Anthropic()

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: opts.maxTokens ?? 8000,
    thinking: { type: "adaptive" },
    output_config: {
      format: { type: "json_schema", schema: opts.schema },
      effort: opts.effort ?? "medium",
    },
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  })

  const text = response.content.find((b) => b.type === "text")
  if (!text || text.type !== "text") {
    throw new Error("Resposta do modelo sem conteúdo de texto.")
  }
  return { data: JSON.parse(text.text) as T, model: response.model }
}
