"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { changePasswordAction, type AccountFormState } from "./actions"

const field =
  "rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<AccountFormState, FormData>(
    changePasswordAction,
    {},
  )

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Senha atual</span>
        <input name="current" type="password" required autoComplete="current-password" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Nova senha</span>
        <input name="next" type="password" required autoComplete="new-password" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Confirmar nova senha</span>
        <input name="confirm" type="password" required autoComplete="new-password" className={field} />
      </label>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Senha alterada com sucesso.</p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Salvando..." : "Trocar senha"}
      </Button>
    </form>
  )
}
