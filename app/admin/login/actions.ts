"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/auth"

export type LoginState = { error?: string }

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    })
    return {}
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha inválidos." }
    }
    throw error // redirects (NEXT_REDIRECT) precisam propagar
  }
}
