import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// Instância edge-safe (sem providers/bcrypt) só para o middleware.
// O callback `authorized` em auth.config decide o acesso a /admin.
export default NextAuth(authConfig).auth

export const config = {
  matcher: ["/admin/:path*"],
}
