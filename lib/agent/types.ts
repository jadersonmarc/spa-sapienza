// DTOs espelhando a API do motor (rag-agente-go, SPEC §4). JSON snake_case.

export type Conversation = {
  id: string
  tenant_id: string
  contact_id: string
  mode: "bot" | "human"
  status: string
}

export type Message = {
  id: string
  conversation_id: string
  direction: "in" | "out"
  sender: "contact" | "bot" | "human"
  content: string
  provider_id?: string
  status: string
  created_at: string
}

export type Contact = {
  id: string
  tenant_id: string
  phone: string
  name?: string
  source: string
  stage_id?: string
  consent: boolean
}

export type Stage = {
  id: string
  name: string
  position: number
  count: number
}

export type TenantConfig = {
  tenant_id: string
  system_prompt: string
  tone: string
  fallback: string
  max_tokens: number
  ai_model: string
  evolution_instance: string
  whatsapp_number?: string
}

export type Automation = {
  id: string
  tenant_id: string
  type: "off_hours" | "welcome" | "keyword"
  trigger: unknown
  action: unknown
  enabled: boolean
  position: number
}
