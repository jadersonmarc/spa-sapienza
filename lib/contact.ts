// Canal único de conversão do site: WhatsApp. Centraliza o número e a montagem
// da URL com mensagem pré-preenchida (ver CLAUDE.md — wa.me padrão).
export const WHATSAPP_PHONE = "5521986537054"

export function whatsappUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`
}
