"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { loginAction, type LoginState } from "./actions"

const initial: LoginState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-white/10 bg-background px-3 py-2 text-foreground outline-none focus:border-white/30"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted-foreground">Senha</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-white/10 bg-background px-3 py-2 text-foreground outline-none focus:border-white/30"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  )
}
