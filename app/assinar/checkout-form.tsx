"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { checkoutAction, type CheckoutState } from "./actions"

const field =
  "rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"

// Form do checkout. Envia ao Server Action (que chama o core) e, no sucesso,
// redireciona o cliente para a página de pagamento (Pix/boleto) do Asaas.
export function CheckoutForm({ produto, tier }: { produto: string; tier: string }) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(checkoutAction, {})

  useEffect(() => {
    if (state.paymentUrl) window.location.href = state.paymentUrl
  }, [state.paymentUrl])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="produto" value={produto} />
      <input type="hidden" name="tier" value={tier} />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Nome ou razão social</span>
        <input name="name" required autoComplete="organization" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">CPF ou CNPJ</span>
        <input name="taxId" required inputMode="numeric" autoComplete="off" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">E-mail</span>
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Senha de acesso</span>
        <input name="password" type="password" required autoComplete="new-password" className={field} />
        <span className="font-mono text-xs text-muted-foreground">
          mín. 10 caracteres, com maiúscula, minúscula e número — é a senha do seu painel
        </span>
      </label>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending || !!state.paymentUrl} className="mt-2 w-full">
        {pending || state.paymentUrl ? "Redirecionando ao pagamento..." : "Continuar para o pagamento"}
      </Button>
      <p className="text-center font-mono text-xs text-muted-foreground">
        pagamento seguro via Pix ou boleto · sua conta é liberada assim que o pagamento é confirmado
      </p>
    </form>
  )
}
