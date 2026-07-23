"use server"

import { validatePasswordStrength } from "@/lib/auth/password"
import { findTier } from "@/lib/pricing"

// Checkout self-service: o site é a vitrine. Este Server Action valida a entrada e
// chama a API pública do core (server-to-server, sem CORS), que provisiona a conta
// em past_due e emite a cobrança. Devolve o link de pagamento (Pix/boleto do Asaas)
// para o cliente redirecionar. O core é a fonte da verdade — aqui a validação é só
// para dar erro amigável cedo.

export type CheckoutState = { error?: string; paymentUrl?: string }

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const produto = String(formData.get("produto") ?? "")
  const tier = String(formData.get("tier") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const taxId = String(formData.get("taxId") ?? "").replace(/\D/g, "")
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!findTier(produto, tier)) return { error: "Plano inválido. Volte e escolha um plano." }
  if (name.length < 2) return { error: "Informe o nome ou a razão social." }
  if (taxId.length !== 11 && taxId.length !== 14) return { error: "Informe um CPF ou CNPJ válido." }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Informe um e-mail válido." }
  const weak = validatePasswordStrength(password)
  if (weak) return { error: weak }

  const url = process.env.CORE_CHECKOUT_URL
  const secret = process.env.CHECKOUT_SECRET
  if (!url || !secret) return { error: "Checkout indisponível no momento. Fale com a gente pelo WhatsApp." }

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-checkout-secret": secret },
      body: JSON.stringify({ name, taxId, email, password, produto, tier }),
      cache: "no-store",
    })
  } catch {
    return { error: "Não foi possível concluir agora. Tente novamente em instantes." }
  }

  const data = (await res.json().catch(() => null)) as { paymentUrl?: string; error?: string } | null
  if (!res.ok || !data?.paymentUrl) {
    // 422 = erro de negócio (ex.: e-mail já com conta ativa) → mensagem do core.
    return { error: data?.error ?? "Não foi possível concluir a assinatura." }
  }
  return { paymentUrl: data.paymentUrl }
}
