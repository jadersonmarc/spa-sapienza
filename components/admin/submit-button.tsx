"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"

// Botão de submit que lê o pending do SEU formulário (useFormStatus é escopado
// ao <form> pai mais próximo). Evita o vazamento de estado entre botões irmãos
// que compartilham o mesmo formAction de um único useActionState.
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  )
}
