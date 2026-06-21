import type { NextAuthConfig } from "next-auth"

// Config edge-safe (sem bcrypt/driver de DB) — usada pelo middleware.
// O provider Credentials, que precisa do Node runtime, é adicionado em `auth.ts`.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  callbacks: {
    // Protege /admin: só logado entra; /admin/login é sempre liberado.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl
      if (pathname.startsWith("/admin/login")) return true
      if (pathname.startsWith("/admin")) return isLoggedIn
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as "admin" | "editor"
      return session
    },
  },
  providers: [], // definidos em auth.ts
} satisfies NextAuthConfig
